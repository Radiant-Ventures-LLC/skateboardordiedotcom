// Server-side Turnstile check, shared by the waitlist and the sign-in link
// request. The token is single-use, so the server is the only place it gets
// redeemed. Fails closed if the secret isn't configured.

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  env: unknown,
  token: string | null,
  ip: string | null,
): Promise<boolean> {
  const secret = (env as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }
  if (!token) return false;
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
