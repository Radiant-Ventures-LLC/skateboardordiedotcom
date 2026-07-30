import Link from "next/link";
import { LinkButton } from "./LinkButton";

// Server component — plain links, no interactivity.
const LINKS = [
  { href: "/manifesto", label: "Manifesto" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-void bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="font-poster text-lede uppercase leading-none tracking-slogan text-ink"
        >
          skateboard<span className="text-flag">ordie</span>
        </Link>

        <div className="flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-meta uppercase tracking-stamp text-concrete-600 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <LinkButton href="/early-access" variant="flag" size="md">
            Early Access
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
