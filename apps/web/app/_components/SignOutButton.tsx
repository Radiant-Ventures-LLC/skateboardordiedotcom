"use client";

import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { postJson, type ApiResult } from "./postJson";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <ActionButton
      variant="outline"
      size="md"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await postJson<ApiResult>("/api/auth/sign-out", {});
        window.location.assign("/");
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </ActionButton>
  );
}
