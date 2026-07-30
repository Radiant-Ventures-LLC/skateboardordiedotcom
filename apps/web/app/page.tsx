import {
  Heading,
  Marquee,
  Sticker,
  Tag,
  Divider,
  Star,
  Fist,
  Wheel,
  voice,
} from "skateaf";
import { LinkButton } from "./_components/LinkButton";

export default function Home() {
  return (
    <main>
      {/* Top chant */}
      <Marquee items={[...voice.chants]} tone="flag" />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="flex items-center gap-2">
          <Sticker tone="gold" tilt>
            {voice.welcome.kicker}
          </Sticker>
          <Tag tone="sky">Paradise</Tag>
        </div>

        <Heading level={1} bar poster className="mt-6">
          Just another day in Paradise.
        </Heading>

        <p className="mt-6 max-w-2xl text-lede text-concrete-600">
          {voice.welcome.line}
        </p>
        <p className="mt-4 max-w-2xl text-body text-concrete-500">
          {voice.welcome.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <LinkButton href="/early-access" variant="flag" size="lg">
            {voice.cta.enter}
          </LinkButton>
          <LinkButton href="/manifesto" variant="outline" size="lg">
            {voice.cta.later}
          </LinkButton>
        </div>

        <div className="mt-16 flex items-center gap-6 text-void">
          <Star className="h-10 w-10" />
          <Fist className="h-10 w-10" />
          <Wheel className="h-10 w-10" />
          <span className="font-mono text-meta uppercase tracking-stamp text-concrete-500">
            {voice.creed}
          </span>
        </div>

        <Divider className="mt-16" />

        <p className="mt-6 font-mono text-meta text-concrete-500">
          {voice.farewell}
        </p>
      </section>

      {/* Bottom chant */}
      <Marquee items={[voice.creed, ...voice.chants]} tone="void" fast />
    </main>
  );
}
