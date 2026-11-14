"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Cloudflare Web Analytics: cookie-free, no consent banner needed. Manual
// install because auto-injection doesn't reach Worker-rendered pages. The
// token is public by design. Skipped on /auth/* so sign-in link URLs never
// end up in analytics.
export function Analytics() {
  const path = usePathname();
  if (path.startsWith("/auth/")) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon='{"token": "47f58dc6d4d94009b777586e2425cb5e"}'
    />
  );
}
