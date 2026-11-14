import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heading, Sticker, voice } from "skateaf";
import { getSessionUser } from "../_lib/auth";
import { SignInForm } from "../_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to skateboardordie.com with a passkey or an email link.",
  robots: { index: false },
};

export default async function SignIn() {
  if (await getSessionUser()) redirect("/account");

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2">
      <div>
        <Sticker tone="gold" tilt>
          Founding Skaters
        </Sticker>
        <Heading level={1} bar poster className="mt-6">
          Roll in.
        </Heading>
        <p className="mt-6 text-lede text-concrete-600">
          Got a passkey on this device? One tap and you&rsquo;re in. No passkey yet? We&rsquo;ll
          email you a link, then you can add one so next time it&rsquo;s one tap.
        </p>
        <p className="mt-6 text-body text-concrete-600">
          No pass yet?{" "}
          <Link href="/early-access" className="font-semibold text-flag underline">
            Request one
          </Link>
          . Paradise is opening in waves.
        </p>
        <p className="mt-8 font-mono text-meta uppercase tracking-stamp text-concrete-500">
          {voice.creed}
        </p>
      </div>

      <div className="border-2 border-void bg-paper p-6 shadow-hard-lg md:p-8">
        <h2 className="font-display text-h3 uppercase tracking-slogan text-ink">Sign in</h2>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </section>
  );
}
