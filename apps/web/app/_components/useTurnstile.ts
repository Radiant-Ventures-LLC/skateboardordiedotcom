"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TURNSTILE_SITEKEY } from "../_lib/turnstileSitekey";

// Explicitly rendered Turnstile widget. Works after client-side navigation
// too, unlike the implicit `.cf-turnstile` auto-render.

type TurnstileApi = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
};

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function api(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

function load(): Promise<TurnstileApi> {
  const ready = api();
  if (ready) return Promise.resolve(ready);
  return new Promise((resolve, reject) => {
    let s = document.querySelector<HTMLScriptElement>("script[data-sod-turnstile]");
    if (!s) {
      s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.dataset.sodTurnstile = "";
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => {
      const t = api();
      if (t) resolve(t);
      else reject(new Error("turnstile missing"));
    });
    s.addEventListener("error", () => reject(new Error("turnstile failed to load")));
  });
}

export function useTurnstile(action: string) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((t) => {
        if (cancelled || !ref.current) return;
        widget.current = t.render(ref.current, {
          sitekey: TURNSTILE_SITEKEY,
          action,
          theme: "light",
          callback: (tok: string) => setToken(tok),
          "expired-callback": () => setToken(null),
          "error-callback": () => setToken(null),
        });
      })
      .catch(() => setToken(null));
    return () => {
      cancelled = true;
      if (widget.current) api()?.remove(widget.current);
      widget.current = null;
    };
  }, [action]);

  // Tokens are single-use: get a fresh one after every submit.
  const reset = useCallback(() => {
    setToken(null);
    if (widget.current) api()?.reset(widget.current);
  }, []);

  return { ref, token, reset };
}
