// Public Turnstile sitekey (safe to ship). In `next dev` we use Cloudflare's
// always-pass test key so local sign-in and signup work against the test
// secret in .dev.vars; production uses the real widget.
export const TURNSTILE_SITEKEY =
  process.env.NODE_ENV === "development"
    ? "1x00000000000000000000AA"
    : "0x4AAAAAAECWBITJhNy_vq8m";
