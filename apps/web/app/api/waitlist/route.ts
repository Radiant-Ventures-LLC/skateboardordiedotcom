import { getCloudflareContext } from "@opennextjs/cloudflare";
import { inBackground } from "../../_lib/background";
import { EMAIL_RE, clean, json } from "../../_lib/http";
import { verifyTurnstile } from "../../_lib/turnstile";
import { SENDER, welcomeEmail } from "../../_lib/welcomeEmail";

// Runs in the Worker (nodejs runtime via OpenNext) on every request.
export const dynamic = "force-dynamic";

type Payload = {
  email?: unknown;
  handle?: unknown;
  city?: unknown;
  source?: unknown;
  // Honeypot: real humans never fill this hidden field.
  website?: unknown;
  // Turnstile token from the widget; verified server-side below.
  turnstileToken?: unknown;
};

export async function POST(req: Request) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Send us JSON, bro." }, 400);
  }

  // Honeypot tripped → act like success, store nothing. Bots think they won.
  if (clean(payload.website, 200)) {
    return json({ ok: true, status: "joined" });
  }

  const email = clean(payload.email, 254);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "That email doesn't look right." }, 400);
  }

  const handle = clean(payload.handle, 80);
  const city = clean(payload.city, 120);
  const source = clean(payload.source, 120);
  const userAgent = clean(req.headers.get("user-agent"), 400);

  const { env, ctx } = getCloudflareContext();

  const token = clean(payload.turnstileToken, 2048);
  if (!(await verifyTurnstile(env, token, req.headers.get("cf-connecting-ip")))) {
    return json(
      { ok: false, error: "Couldn't confirm you're human. Give it another go." },
      403,
    );
  }

  try {
    const res = await env.DB.prepare(
      `INSERT INTO waitlist (email, handle, city, source, user_agent)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT (lower(email)) DO NOTHING`,
    )
      .bind(email, handle, city, source, userAgent)
      .run();

    // No rows written → the email was already on the list.
    const joined = (res.meta?.changes ?? 0) > 0;

    // New signups get one welcome note with a personal share link. Sent after
    // the response so a mail hiccup never blocks or fails the signup.
    if (joined) {
      const refCode = `crew-${res.meta.last_row_id}`;
      const msg = welcomeEmail({ handle, refCode });
      inBackground(ctx, "welcome email", () => env.EMAIL.send({ from: SENDER, to: email, ...msg }));
    }
    return json({ ok: true, status: joined ? "joined" : "already" });
  } catch (err) {
    console.error("waitlist insert failed", err);
    return json({ ok: false, error: "Paradise hiccuped. Try again in a sec." }, 500);
  }
}
