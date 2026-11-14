// Small helpers shared by the API route handlers.

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Trimmed string or null, capped at `max` chars. */
export function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

// Pragmatic email check: rejects typos and garbage without rejecting
// valid-but-unusual addresses.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? "local";
}

/**
 * CSRF guard for state-changing requests: the browser's Origin header must
 * match the site the request came in on. Cross-site forms and fetches fail.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return origin !== null && origin === new URL(req.url).origin;
}

type Limiter = { limit(opts: { key: string }): Promise<{ success: boolean }> };

/**
 * Per-IP limit using the Workers rate limiting binding (AUTH_LIMITER in
 * wrangler.jsonc). Fails open if the binding is missing so local dev and
 * a misconfigured deploy still work; the per-address email throttle in D1
 * still applies.
 */
export async function underLimit(env: unknown, bucket: string, req: Request) {
  const limiter = (env as { AUTH_LIMITER?: Limiter }).AUTH_LIMITER;
  if (!limiter) return true;
  const { success } = await limiter.limit({ key: `${bucket}:${clientIp(req)}` });
  return success;
}

export const tooMany = () =>
  json({ ok: false, error: "Easy, bro. Too many tries. Give it a minute." }, 429);

export const badOrigin = () => json({ ok: false, error: "Wrong door." }, 403);
