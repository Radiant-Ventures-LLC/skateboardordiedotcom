import Link from "next/link";
import { voice } from "skateaf";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-void bg-void text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-poster text-lede uppercase leading-none tracking-slogan">
            skateboard<span className="text-flag">ordie</span>.com
          </p>
          <p className="mt-2 font-mono text-meta text-concrete-200">
            {voice.tagline}
          </p>
        </div>
        <div className="flex items-center gap-6 font-mono text-meta uppercase tracking-stamp text-concrete-200">
          <Link href="/manifesto" className="hover:text-gold">
            Manifesto
          </Link>
          <Link href="/early-access" className="hover:text-gold">
            Early Access
          </Link>
          <span className="text-concrete-400">{voice.creed}</span>
        </div>
      </div>
    </footer>
  );
}
