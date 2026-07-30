import type { Metadata } from "next";
import { Heading, Sticker, Marquee, voice } from "skateaf";
import { WaitlistForm } from "../_components/WaitlistForm";

export const metadata: Metadata = {
  title: "Early Access",
  description:
    "Claim your plot before the gates open wide. Founding skaters get in first — request an early-access pass to Paradise.",
};

export default function EarlyAccess() {
  return (
    <>
      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <Sticker tone="gold" tilt>
            Founding Skaters
          </Sticker>
          <Heading level={1} bar poster className="mt-6">
            Claim your plot.
          </Heading>
          <p className="mt-6 text-lede text-concrete-600">
            The gate&rsquo;s always open — but Paradise is opening in waves.
            Get an early-access pass and you&rsquo;re in with the first crew:
            you claim your plot, name your spots, and help lay the coping before
            anyone else rolls up.
          </p>
          <ul className="mt-8 flex flex-col gap-3 font-mono text-meta text-concrete-600">
            <li>★ First pick of handles &amp; home spots</li>
            <li>★ A hand in the charter — you shape the commons</li>
            <li>★ Founding-skater mark that never gets minted again</li>
          </ul>
          <p className="mt-8 font-mono text-meta uppercase tracking-stamp text-concrete-500">
            {voice.creed}
          </p>
        </div>

        <div className="border-2 border-void bg-paper p-6 shadow-hard-lg md:p-8">
          <h2 className="font-display text-h3 uppercase tracking-slogan text-ink">
            Request your pass
          </h2>
          <p className="mt-2 text-body text-concrete-600">{voice.welcome.sub}</p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <Marquee items={[...voice.chants]} tone="flag" />
    </>
  );
}
