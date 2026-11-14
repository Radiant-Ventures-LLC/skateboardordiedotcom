import { cache } from "react";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Sessions, tokens and WebAuthn challenge storage. Everything secret is
// random from crypto.getRandomValues and stored only as a SHA-256 hash.

export const SESSION_COOKIE = "sod_session";
const SESSION_WINDOW = "+60 days"; // sliding: extended at most once a day
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // browser cap; D1 expiry is the real limit

export type SessionUser = {
  id: string;
  email: string;
  handle: string | null;
  role: string;
};

export function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Relying party and cookie scope for the host the request came in on.
 * Passkeys and the session cookie are scoped to skateboardordie.com so they
 * work on both the apex and www. Local dev uses the request's own host.
 */
export function site(req: Request) {
  const url = new URL(req.url);
  const host = url.hostname;
  const ours = host === "skateboardordie.com" || host.endsWith(".skateboardordie.com");
  return {
    origin: url.origin,
    rpID: ours ? "skateboardordie.com" : host,
    cookieDomain: ours ? "skateboardordie.com" : undefined,
    secure: url.protocol === "https:",
  };
}

function db() {
  return getCloudflareContext().env.DB;
}

/** Creates a session for `userId` and sets the cookie. Route handlers only. */
export async function startSession(req: Request, userId: string) {
  const token = randomToken();
  const ua = req.headers.get("user-agent")?.slice(0, 400) ?? null;
  const d = db();
  await d.batch([
    d
      .prepare(
        `INSERT INTO sessions (id_hash, user_id, expires_at, user_agent)
         VALUES (?1, ?2, datetime('now', '${SESSION_WINDOW}'), ?3)`,
      )
      .bind(await sha256(token), userId, ua),
    d.prepare(`UPDATE users SET last_seen_at = datetime('now') WHERE id = ?1`).bind(userId),
  ]);
  const s = site(req);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: s.secure,
    sameSite: "lax",
    path: "/",
    domain: s.cookieDomain,
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Deletes the current session row and clears the cookie. Route handlers only. */
export async function endSession(req: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db().prepare(`DELETE FROM sessions WHERE id_hash = ?1`).bind(await sha256(token)).run();
  }
  const s = site(req);
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: s.secure,
    sameSite: "lax",
    path: "/",
    domain: s.cookieDomain,
    maxAge: 0,
  });
}

/**
 * The signed-in skater for this request, or null. Cached per request, so
 * layouts, pages and handlers can all call it.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const hash = await sha256(token);
  const { env, ctx } = getCloudflareContext();
  const user = await env.DB.prepare(
    `SELECT u.id, u.email, u.handle, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id_hash = ?1 AND s.expires_at > datetime('now')`,
  )
    .bind(hash)
    .first<SessionUser>();
  if (!user) return null;

  // Slide the expiry and stamp last_seen, at most once a day, off the
  // response path.
  ctx.waitUntil(
    env.DB.batch([
      env.DB.prepare(
        `UPDATE sessions SET expires_at = datetime('now', '${SESSION_WINDOW}')
          WHERE id_hash = ?1 AND expires_at < datetime('now', '+59 days')`,
      ).bind(hash),
      env.DB.prepare(
        `UPDATE users SET last_seen_at = datetime('now')
          WHERE id = ?1 AND (last_seen_at IS NULL OR last_seen_at < datetime('now', '-1 day'))`,
      ).bind(user.id),
    ]).catch((err: unknown) => console.error("session touch failed", err)),
  );
  return user;
});

/** Stores a WebAuthn challenge for 5 minutes and returns its id. */
export async function saveChallenge(
  kind: "login" | "register",
  challenge: string,
  userId: string | null,
): Promise<string> {
  const id = randomToken(16);
  const d = db();
  await d.batch([
    d.prepare(`DELETE FROM auth_challenges WHERE expires_at < datetime('now')`),
    d
      .prepare(
        `INSERT INTO auth_challenges (id, challenge, kind, user_id, expires_at)
         VALUES (?1, ?2, ?3, ?4, datetime('now', '+5 minutes'))`,
      )
      .bind(id, challenge, kind, userId),
  ]);
  return id;
}

/** Consumes a challenge (single use). Register challenges must match the user. */
export async function takeChallenge(
  id: string,
  kind: "login" | "register",
  userId: string | null,
): Promise<string | null> {
  const row = await db()
    .prepare(
      `DELETE FROM auth_challenges
        WHERE id = ?1 AND kind = ?2 AND expires_at > datetime('now')
       RETURNING challenge, user_id`,
    )
    .bind(id, kind)
    .first<{ challenge: string; user_id: string | null }>();
  if (!row) return null;
  if (kind === "register" && row.user_id !== userId) return null;
  return row.challenge;
}
