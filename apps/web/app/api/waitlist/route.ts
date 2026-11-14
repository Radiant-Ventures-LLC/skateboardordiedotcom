import { getCloudflareContext } from "@opennextjs/cloudflare";

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

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Server-side Turnstile check. The token is single-use, so this is the only
// place it gets redeemed. Fails closed if the secret isn't configured.
async function verifyTurnstile(
  token: string,
  secret: string | undefined,
  ip: string | null,
): Promise<boolean> {
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const res = await fetch(SITEVERIFY, { method: "POST", body: form });
    const out = (await res.json()) as { success?: boolean };
    return out.success === true;
  } catch (err) {
    console.error("turnstile siteverify failed", err);
    return false;
  }
}

// Pragmatic email check — good enough to reject typos/garbage without
// rejecting valid-but-unusual addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

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

  const { env } = getCloudflareContext();

  const token = clean(payload.turnstileToken, 2048);
  const secret = (env as unknown as { TURNSTILE_SECRET_KEY?: string })
    .TURNSTILE_SECRET_KEY;
  if (
    !token ||
    !(await verifyTurnstile(token, secret, req.headers.get("cf-connecting-ip")))
  ) {
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
    return json({ ok: true, status: joined ? "joined" : "already" });
  } catch (err) {
    console.error("waitlist insert failed", err);
    return json({ ok: false, error: "Paradise hiccuped. Try again in a sec." }, 500);
  }
}
