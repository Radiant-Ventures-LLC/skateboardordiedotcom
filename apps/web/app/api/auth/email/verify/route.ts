import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sha256, startSession } from "../../../../_lib/auth";
import {
  badOrigin,
  clean,
  json,
  readJson,
  sameOrigin,
  tooMany,
  underLimit,
} from "../../../../_lib/http";

export const dynamic = "force-dynamic";

/**
 * POST { token } → redeems a one-time sign-in link. Called from the confirm
 * page, never straight from the email link, so mail scanners that prefetch
 * links can't burn the token. Creates the account on first sign-in if the
 * address has an invite.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env } = getCloudflareContext();
  if (!(await underLimit(env, "auth-verify", req))) return tooMany();

  const body = await readJson<{ token?: unknown }>(req);
  const token = clean(body?.token, 100);
  const expired = json(
    { ok: false, error: "That link's expired or already used. Grab a fresh one." },
    400,
  );
  if (!token) return expired;

  const db = env.DB;
  const used = await db
    .prepare(
      `UPDATE auth_emails SET used_at = datetime('now')
        WHERE token_hash = ?1 AND kind = 'signin'
          AND used_at IS NULL AND expires_at > datetime('now')
       RETURNING email`,
    )
    .bind(await sha256(token))
    .first<{ email: string }>();
  if (!used) return expired;

  let user = await db
    .prepare(`SELECT id FROM users WHERE lower(email) = lower(?1)`)
    .bind(used.email)
    .first<{ id: string }>();

  if (!user) {
    const invite = await db
      .prepare(`SELECT id FROM invites WHERE lower(email) = lower(?1)`)
      .bind(used.email)
      .first<{ id: number }>();
    if (!invite) {
      return json({ ok: false, error: "This address doesn't have a pass yet." }, 403);
    }
    const id = crypto.randomUUID();
    await db.batch([
      db
        .prepare(`INSERT INTO users (id, email) VALUES (?1, lower(?2))`)
        .bind(id, used.email),
      db
        .prepare(`UPDATE invites SET redeemed_at = datetime('now') WHERE id = ?1`)
        .bind(invite.id),
    ]);
    user = { id };
  }

  await startSession(req, user.id);
  const keys = await db
    .prepare(`SELECT COUNT(*) AS n FROM passkeys WHERE user_id = ?1`)
    .bind(user.id)
    .first<{ n: number }>();
  return json({ ok: true, hasPasskey: (keys?.n ?? 0) > 0 });
}
