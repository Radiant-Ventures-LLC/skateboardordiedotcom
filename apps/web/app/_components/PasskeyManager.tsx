"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSupportsWebAuthn,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { ActionButton } from "./ActionButton";
import { postJson, type ApiResult } from "./postJson";

export type PasskeyRow = { id: string; name: string; added: string; lastUsed: string | null };

type Options = ApiResult & {
  options?: PublicKeyCredentialCreationOptionsJSON;
  challengeId?: string;
};

export function PasskeyManager({ passkeys, nudge }: { passkeys: PasskeyRow[]; nudge: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  useEffect(() => setSupported(browserSupportsWebAuthn()), []);

  async function add() {
    setBusy(true);
    setMessage(null);
    try {
      const o = await postJson<Options>("/api/auth/passkey/register/options", {});
      if (!o.ok || !o.options || !o.challengeId) {
        setMessage({ tone: "error", text: o.error ?? "Something went sideways." });
        return;
      }
      let response;
      try {
        response = await startRegistration({ optionsJSON: o.options });
      } catch (err) {
        const name = (err as Error).name;
        setMessage(
          name === "InvalidStateError"
            ? { tone: "ok", text: "This device already has a passkey for your account." }
            : name === "NotAllowedError"
              ? { tone: "error", text: "Cancelled. No passkey added." }
              : { tone: "error", text: "This device couldn't make a passkey." },
        );
        return;
      }
      const v = await postJson<ApiResult>("/api/auth/passkey/register/verify", {
        challengeId: o.challengeId,
        response,
      });
      if (!v.ok) {
        setMessage({ tone: "error", text: v.error ?? "Couldn't save that passkey." });
        return;
      }
      setMessage({ tone: "ok", text: "Passkey added. Next time it's one tap." });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (armed !== id) {
      setArmed(id);
      return;
    }
    setArmed(null);
    setBusy(true);
    const r = await postJson<ApiResult>("/api/auth/passkey/remove", { id });
    setBusy(false);
    if (!r.ok) {
      setMessage({ tone: "error", text: r.error ?? "Couldn't remove it." });
      return;
    }
    setMessage({ tone: "ok", text: "Passkey removed. You can still sign in with an email link." });
    router.refresh();
  }


  return (
    <div className="flex flex-col gap-4">
      {nudge && passkeys.length === 0 && (
        <p className="border-2 border-void bg-gold/30 px-4 py-3 text-body text-ink">
          Make it one tap next time: add a passkey on this device. It uses your face, fingerprint
          or screen lock. Nothing to remember.
        </p>
      )}

      {passkeys.length > 0 ? (
        <ul className="flex flex-col divide-y-2 divide-void/10 border-2 border-void">
          {passkeys.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-display uppercase tracking-slogan text-ink">{p.name}</p>
                <p className="font-mono text-micro uppercase tracking-stamp text-concrete-500">
                  Added {p.added}
                  {p.lastUsed ? ` · Last used ${p.lastUsed}` : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(p.id)}
                className="font-mono text-meta uppercase tracking-stamp text-flag underline disabled:opacity-50"
              >
                {armed === p.id ? "Tap again to remove" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-concrete-600">
          No passkeys yet. You&rsquo;re signing in with email links.
        </p>
      )}

      {message && (
        <p
          role="status"
          className={
            message.tone === "ok"
              ? "border-2 border-void bg-palm/15 px-4 py-2 font-mono text-meta text-ink"
              : "border-2 border-flag bg-flag/10 px-4 py-2 font-mono text-meta text-flag-700"
          }
        >
          {message.text}
        </p>
      )}

      {supported ? (
        <ActionButton variant="flag" size="md" disabled={busy} onClick={() => void add()}>
          {busy ? "Working…" : "Add a passkey on this device"}
        </ActionButton>
      ) : (
        <p className="font-mono text-meta text-concrete-500">
          This browser can&rsquo;t make passkeys. Email links still work.
        </p>
      )}
    </div>
  );
}
