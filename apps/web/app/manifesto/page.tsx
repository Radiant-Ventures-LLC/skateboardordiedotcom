import type { Metadata } from "next";
import { Heading, Divider, Star, Fist, Wheel, voice } from "skateaf";
import { LinkButton } from "../_components/LinkButton";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "The gate is always open. Everything you need is inside. What skateboardordie.com stands for.",
};

const TENETS = [
  {
    title: "The streets belong to everyone",
    body: "Every curb, ledge, and empty lot is common ground. We map it, share it, and leave it better than we found it. No spot is owned; every spot is tended.",
  },
  {
    title: "The gate is always open",
    body: "Nobody's trapped and nobody's turned away. It's the walls that make it Paradise — everything you need is already inside. Wander in, plant something, stay as long as you like.",
  },
  {
    title: "We build the commons together",
    body: "The charter isn't handed down, it's laid by the crew. You get a say in the yard you skate. Solidarity over scarcity, always room for one more.",
  },
  {
    title: "Skate. Organize. Repeat.",
    body: "Joy is the tactic. We show up, we build, we look out for each other, and we do it again tomorrow. That's the whole program.",
  },
];

export default function Manifesto() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="flex items-center gap-6 text-void">
        <Star className="h-9 w-9" />
        <Fist className="h-9 w-9" />
        <Wheel className="h-9 w-9" />
      </div>

      {/* On phones the size follows the screen width so the longest word fits. */}
      <Heading level={1} bar poster className="mt-6 max-sm:text-[length:clamp(2rem,10.5vw,4rem)]">
        The Manifesto
      </Heading>
      <p className="mt-6 text-lede text-concrete-600">{voice.welcome.line}</p>

      <Divider className="mt-10" />

      <ol className="mt-10 flex flex-col gap-10">
        {TENETS.map((t, i) => (
          <li key={t.title} className="grid grid-cols-[auto_1fr] gap-5">
            <span className="font-poster text-h2 leading-none text-flag">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-display text-h3 uppercase tracking-slogan text-ink">
                {t.title}
              </h2>
              <p className="mt-2 text-body text-concrete-600">{t.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Divider className="mt-12" />

      <div className="mt-10 flex flex-col items-start gap-4">
        <p className="font-mono text-meta uppercase tracking-stamp text-concrete-500">
          {voice.membership.crew}
        </p>
        <LinkButton href="/early-access" variant="flag" size="lg">
          {voice.cta.join}
        </LinkButton>
      </div>
    </section>
  );
}
