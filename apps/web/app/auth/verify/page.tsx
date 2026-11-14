import type { Metadata } from "next";
import { Heading } from "skateaf";
import { ConfirmSignIn } from "../../_components/ConfirmSignIn";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
  referrer: "no-referrer",
};

export default function VerifySignIn() {
  return (
    <section className="mx-auto max-w-xl px-6 py-20">
      <Heading level={1} bar poster>
        One tap.
      </Heading>
      <p className="mt-6 text-lede text-concrete-600">
        Confirm it&rsquo;s you and you&rsquo;re in. The link works once.
      </p>
      <div className="mt-8 border-2 border-void bg-paper p-6 shadow-hard-lg">
        <ConfirmSignIn />
      </div>
    </section>
  );
}
