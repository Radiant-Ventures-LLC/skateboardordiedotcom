import { getCloudflareContext } from "@opennextjs/cloudflare";
import { inBackground } from "../../../_lib/background";
import { randomToken, sha256, site } from "../../../_lib/auth";
import { noPassEmail, signInEmail } from "../../../_lib/authEmail";
import {
  EMAIL_RE,
  badOrigin,
  clean,
  clientIp,
  json,
  readJson,
  sameOrigin,
  tooMany,
  underLimit,
} from "../../../_lib/http";
import { verifyTurnstile } from "../../../_lib/turnstile";
import { SENDER } from "../../../_lib/welcomeEmail";

export const dynamic = "force-dynamic";

// Per-address cap on sign-in emails, on top of the per-IP limiter and
// Turnstile, so nobody can use this form to flood someone's inbox.
const MAX_EMAILS_PER_10_MIN = 3;

/**
 * POST { email, turnstileToken } → always { ok: true } once the human check
 * passes. The response never says whether the address has a pass; the email
 * does. Invited or existing skaters get a one-time link, everyone else gets
 * a "no pass yet" note.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env, ctx } = getCloudflareContext();
  if (!(await underLimit(env, "auth-email", req))) return tooMany();

  const body = await readJson<{ email?: unknown; turnstileToken?: unknown }>(req);
  const email = clean(body?.email, 254);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "That email doesn't look right." }, 400);
  }
  if (!(await verifyTurnstile(env, clean(body?.turnstileToken, 2048), clientIp(req)))) {
    return json({ ok: false, error: "Couldn't confirm you're human. Give it another go." }, 403);
  }

  const db = env.DB;
  const recent = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM auth_emails
        WHERE lower(email) = lower(?1) AND created_at > datetime('now', '-10 minutes')`,
    )
    .bind(email)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= MAX_EMAILS_PER_10_MIN) {
    // Same answer as success: don't reveal the throttle per address.
    return json({ ok: true });
  }

  const standing = await db
    .prepare(
      `SELECT
         EXISTS (SELECT 1 FROM users   WHERE lower(email) = lower(?1)) AS has_user,
         EXISTS (SELECT 1 FROM invites WHERE lower(email) = lower(?1)) AS has_invite,
         EXISTS (SELECT 1 FROM waitlist WHERE lower(email) = lower(?1)) AS on_list`,
    )
    .bind(email)
    .first<{ has_user: number; has_invite: number; on_list: number }>();

  let msg: { subject: string; html: string; text: string };
  if (standing?.has_user || standing?.has_invite) {
    const token = randomToken();
    await db.batch([
      db.prepare(`DELETE FROM auth_emails WHERE created_at < datetime('now', '-1 day')`),
      db
        .prepare(
          `INSERT INTO auth_emails (email, kind, token_hash, expires_at)
           VALUES (?1, 'signin', ?2, datetime('now', '+15 minutes'))`,
        )
        .bind(email, await sha256(token)),
    ]);
    // Token rides in the fragment so it never reaches server logs or analytics.
    msg = signInEmail(`${site(req).origin}/auth/verify#token=${token}`);
  } else {
    await db
      .prepare(`INSERT INTO auth_emails (email, kind) VALUES (?1, 'nopass')`)
      .bind(email)
      .run();
    msg = noPassEmail(Boolean(standing?.on_list));
  }

  // Sent after the response so both branches take the same time.
  inBackground(ctx, "sign-in email", () => env.EMAIL.send({ from: SENDER, to: email, ...msg }));
  return json({ ok: true });
}
