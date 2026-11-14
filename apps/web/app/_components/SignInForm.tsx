"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  WebAuthnAbortService,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  sendSignal,
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { ActionButton } from "./ActionButton";
import { postJson, type ApiResult } from "./postJson";
import { useTurnstile } from "./useTurnstile";

type State =
  | { kind: "idle" }
  | { kind: "busy"; what: "passkey" | "email" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

type Options = ApiResult & {
  options?: PublicKeyCredentialRequestOptionsJSON;
  challengeId?: string;
};

const FIELD =
  "border-2 border-void bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-concrete-300 focus:shadow-hard-flag";

/**
 * Passkey first. The email field also offers saved passkeys through the
 * browser's autofill. No passkey on this device: we email a one-time link.
 */
export function SignInForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [canPasskey, setCanPasskey] = useState(false);
  const [email, setEmail] = useState("");
  const turnstile = useTurnstile("sign-in");
  const done = useRef(false);

  async function passkeySignIn(autofill: boolean) {
    const o = await postJson<Options>("/api/auth/passkey/login/options", {});
    if (!o.ok || !o.options || !o.challengeId) {
      if (!autofill) setState({ kind: "error", message: o.error ?? "Something went sideways." });
      return;
    }
    let response;
    try {
      response = await startAuthentication({ optionsJSON: o.options, useBrowserAutofill: autofill });
    } catch (err) {
      // Autofill gets aborted whenever the button flow starts; stay quiet.
      if (autofill) return;
      const name = (err as Error).name;
      setState({
        kind: "error",
        message:
          name === "NotAllowedError"
            ? "No passkey picked. If this device doesn't have one yet, get an email link below."
            : "That passkey didn't work here. Try an email link instead.",
      });
      return;
    }
    setState({ kind: "busy", what: "passkey" });
    const v = await postJson<ApiResult & { unknownCredential?: boolean }>(
      "/api/auth/passkey/login/verify",
      { challengeId: o.challengeId, response },
    );
    if (!v.ok) {
      if (v.unknownCredential && o.options.rpId) {
        // Tell the device to stop offering a passkey we no longer recognize.
        sendSignal({
          signalName: "unknownCredential",
          rpID: o.options.rpId,
          credentialID: response.id,
        }).catch(() => {});
      }
      setState({ kind: "error", message: v.error ?? "Couldn't sign you in." });
      return;
    }
    done.current = true;
    window.location.assign("/account");
  }

  // Start passkey autofill as soon as the page is ready.
  useEffect(() => {
    if (!browserSupportsWebAuthn()) return;
    setCanPasskey(true);
    browserSupportsWebAuthnAutofill().then((yes) => {
      if (yes) void passkeySignIn(true);
    });
    return () => {
      if (!done.current) WebAuthnAbortService.cancelCeremony();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!turnstile.token) {
      setState({ kind: "error", message: "Hang on a sec for the human check, then send it." });
      return;
    }
    setState({ kind: "busy", what: "email" });
    const r = await postJson<ApiResult>("/api/auth/email", {
      email,
      turnstileToken: turnstile.token,
    });
    turnstile.reset();
    if (!r.ok) {
      setState({ kind: "error", message: r.error ?? "Something went sideways." });
      return;
    }
    setState({ kind: "sent", email });
  }

  if (state.kind === "sent") {
    return (
      <div className="border-2 border-void bg-palm/15 p-6 shadow-hard">
        <p className="font-display text-h3 uppercase tracking-slogan text-ink">Check your inbox.</p>
        <p className="mt-2 text-body text-concrete-600">
          If <strong className="text-ink">{state.email}</strong> has a pass, a sign-in link is on
          its way. It works once, for 15 minutes. No pass yet? The email says what&rsquo;s next.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-4 font-mono text-meta uppercase tracking-stamp text-concrete-600 underline hover:text-ink"
        >
          Use a different email
        </button>
      </div>
    );
  }

  const busy = state.kind === "busy";

  return (
    <div className="flex flex-col gap-6">
      {canPasskey && (
        <>
          <ActionButton
            variant="flag"
            size="lg"
            block
            disabled={busy}
            onClick={() => void passkeySignIn(false)}
          >
            {busy && state.what === "passkey" ? "Checking…" : "Sign in with a passkey"}
          </ActionButton>
          <div className="flex items-center gap-3 font-mono text-micro uppercase tracking-stamp text-concrete-500">
            <span className="h-[2px] flex-1 bg-void/20" />
            No passkey here yet?
            <span className="h-[2px] flex-1 bg-void/20" />
          </div>
        </>
      )}

      <form onSubmit={onEmail} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-meta uppercase tracking-stamp text-concrete-600">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            // "webauthn" lets the browser offer saved passkeys right here.
            autoComplete="username webauthn"
            placeholder="you@paradise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD}
          />
        </label>

        <div ref={turnstile.ref} />

        {state.kind === "error" && (
          <p
            role="alert"
            className="border-2 border-flag bg-flag/10 px-4 py-2 font-mono text-meta text-flag-700"
          >
            {state.message}
          </p>
        )}

        <ActionButton type="submit" variant={canPasskey ? "outline" : "flag"} size="lg" block disabled={busy}>
          {busy && state.what === "email" ? "Sending…" : "Email me a link"}
        </ActionButton>
      </form>
    </div>
  );
}
