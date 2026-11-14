"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import { voice } from "skateaf";
import { TURNSTILE_SITEKEY } from "../_lib/turnstileSitekey";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "joined" }
  | { kind: "already" }
  | { kind: "error"; message: string };

// Pull acquisition source from the URL (?ref=reddit / ?utm_source=slap) so we
// can measure which community outreach actually converts. Read at submit time
// to stay a clean client component with no effects.
function readSource(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  return p.get("ref") ?? p.get("utm_source") ?? null;
}

function resetTurnstile() {
  (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
}

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Turnstile injects this field once the challenge is solved.
    const token = data.get("cf-turnstile-response");
    if (typeof token !== "string" || !token) {
      setStatus({ kind: "error", message: "Hang on a sec for the human check, then send it." });
      return;
    }

    setStatus({ kind: "submitting" });

    // The API verifies the Turnstile token server-side before writing.
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          handle: data.get("handle"),
          city: data.get("city"),
          website: data.get("website"), // honeypot
          source: readSource(),
          turnstileToken: token,
        }),
      });
      const body = (await res.json()) as {
        ok: boolean;
        status?: "joined" | "already";
        error?: string;
      };
      if (!res.ok || !body.ok) {
        resetTurnstile();
        setStatus({ kind: "error", message: body.error ?? "Something went sideways." });
        return;
      }
      setStatus({ kind: body.status === "already" ? "already" : "joined" });
      form.reset();
    } catch {
      resetTurnstile();
      setStatus({ kind: "error", message: "No signal. Check your connection and try again." });
    }
  }

  if (status.kind === "joined" || status.kind === "already") {
    return (
      <div className="border-2 border-void bg-palm/15 p-6 shadow-hard">
        <p className="font-display text-h3 uppercase tracking-slogan text-ink">
          {status.kind === "joined" ? "You're on the list." : "Already rooted."}
        </p>
        <p className="mt-2 text-body text-concrete-600">
          {status.kind === "joined" ? voice.toast.joined : voice.membership.crew}
        </p>
        <p className="mt-4 font-mono text-meta uppercase tracking-stamp text-concrete-500">
          {voice.creed}
        </p>
      </div>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />

      {/* Honeypot — visually hidden, off the tab order. Bots fill it; humans don't. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-meta uppercase tracking-stamp text-concrete-600">
          Email <span className="text-flag">*</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@paradise.com"
          className="border-2 border-void bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-concrete-300 focus:shadow-hard-flag"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-meta uppercase tracking-stamp text-concrete-600">
            Handle
          </span>
          <input
            type="text"
            name="handle"
            autoComplete="off"
            placeholder="@yourname"
            className="border-2 border-void bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-concrete-300 focus:shadow-hard-flag"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-meta uppercase tracking-stamp text-concrete-600">
            Where you skate
          </span>
          <input
            type="text"
            name="city"
            autoComplete="off"
            placeholder="City / spot"
            className="border-2 border-void bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-concrete-300 focus:shadow-hard-flag"
          />
        </label>
      </div>

      {/* Turnstile widget — renders the human check; injects cf-turnstile-response. */}
      <div
        className="cf-turnstile"
        data-sitekey={TURNSTILE_SITEKEY}
        data-action="turnstile-spin-v1"
        data-theme="light"
      />

      {status.kind === "error" && (
        <p role="alert" className="border-2 border-flag bg-flag/10 px-4 py-2 font-mono text-meta text-flag-700">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center border-2 border-void bg-flag px-10 py-4 font-display text-lede font-semibold uppercase tracking-slogan text-paper shadow-hard transition-transform hover:bg-flag-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : voice.cta.claim}
      </button>

      <p className="font-mono text-micro uppercase tracking-stamp text-concrete-400">
        No spam. One note when your pass is ready.
      </p>
    </form>
  );
}
