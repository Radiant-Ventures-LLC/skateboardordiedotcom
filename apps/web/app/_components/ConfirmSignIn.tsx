"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActionButton } from "./ActionButton";
import { postJson, type ApiResult } from "./postJson";

type State =
  | { kind: "loading" }
  | { kind: "ready"; token: string }
  | { kind: "busy"; token: string }
  | { kind: "error"; message: string };

/**
 * The emailed link lands here with the token in the URL fragment (never sent
 * to the server, logs or analytics). The skater taps once to redeem it, so
 * mail scanners that open links can't use it up first.
 */
export function ConfirmSignIn() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    // Drop the token from the address bar and history.
    history.replaceState(null, "", window.location.pathname);
    setState(
      token
        ? { kind: "ready", token }
        : { kind: "error", message: "This link is missing its code. Grab a fresh one." },
    );
  }, []);

  async function confirm(token: string) {
    setState({ kind: "busy", token });
    const r = await postJson<ApiResult & { hasPasskey?: boolean }>("/api/auth/email/verify", {
      token,
    });
    if (!r.ok) {
      setState({ kind: "error", message: r.error ?? "Couldn't sign you in." });
      return;
    }
    window.location.assign(r.hasPasskey ? "/account" : "/account?new=1");
  }

  if (state.kind === "loading") return null;

  if (state.kind === "error") {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="alert"
          className="border-2 border-flag bg-flag/10 px-4 py-2 font-mono text-meta text-flag-700"
        >
          {state.message}
        </p>
        <Link
          href="/sign-in"
          className="font-mono text-meta uppercase tracking-stamp text-concrete-600 underline hover:text-ink"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <ActionButton
      variant="flag"
      size="lg"
      block
      disabled={state.kind === "busy"}
      onClick={() => void confirm(state.token)}
    >
      {state.kind === "busy" ? "Rolling in…" : "Sign me in"}
    </ActionButton>
  );
}
