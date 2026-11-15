import Link from "next/link";
import { LinkButton } from "./LinkButton";

// Server component — plain links, no interactivity.
const LINKS = [
  { href: "/manifesto", label: "Manifesto" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-void bg-paper/90 backdrop-blur">
      {/* Phones (under 640px): smaller logo and button, and the text links
          drop out (they're in the footer), so the row fits without scrolling
          sideways. */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-poster text-body uppercase leading-none tracking-slogan text-ink sm:text-lede"
        >
          skateboard<span className="text-flag">ordie</span>
        </Link>

        <div className="flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden font-mono text-meta uppercase tracking-stamp text-concrete-600 hover:text-ink sm:inline"
            >
              {l.label}
            </Link>
          ))}
          <LinkButton
            href="/early-access"
            variant="flag"
            size="md"
            className="whitespace-nowrap max-sm:px-4 max-sm:text-meta"
          >
            Early Access
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
