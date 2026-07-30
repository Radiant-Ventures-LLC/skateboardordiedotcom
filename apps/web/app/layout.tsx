import type { Metadata } from "next";
import "./globals.css";

// NOTE: skateaf ships as a single bundle that includes client (hook-using)
// components, so importing from it pulls the client boundary in. Keep this
// server-only root layout free of skateaf imports; brand copy lives in
// `voice` and is consumed in client components (see app/page.tsx).

export const metadata: Metadata = {
  title: {
    default: "skateboardordie.com — Just another day in Paradise.",
    template: "%s — skateboardordie.com",
  },
  description:
    "The gate is always open. Everything you need is inside. Skate. Organize. Repeat.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
