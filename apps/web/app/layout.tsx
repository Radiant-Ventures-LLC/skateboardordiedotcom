import type { Metadata } from "next";
import { voice } from "skateaf";
import { SiteNav } from "./_components/SiteNav";
import { SiteFooter } from "./_components/SiteFooter";
import "./globals.css";

// skateaf is now RSC-native: `voice` (and server-safe components) can be
// imported directly into Server Components. Only the interactive components
// (Modal/Tabs/Toast/Toggle/Input/Navbar) carry their own "use client".
export const metadata: Metadata = {
  metadataBase: new URL("https://skateboardordie.com"),
  title: {
    default: `skateboardordie.com — ${voice.tagline}`,
    template: "%s — skateboardordie.com",
  },
  description: `${voice.welcome.line} ${voice.creed}`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        {/* Cloudflare Web Analytics: cookie-free, no consent banner needed.
            Manual install because auto-injection doesn't reach Worker-rendered
            pages. The token is public by design. */}
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "47f58dc6d4d94009b777586e2425cb5e"}'
        />
      </body>
    </html>
  );
}
