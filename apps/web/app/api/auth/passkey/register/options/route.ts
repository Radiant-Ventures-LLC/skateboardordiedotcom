import { getCloudflareContext } from "@opennextjs/cloudflare";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSessionUser, saveChallenge, site } from "../../../../../_lib/auth";
import { badOrigin, json, sameOrigin, tooMany, underLimit } from "../../../../../_lib/http";

export const dynamic = "force-dynamic";

/** POST → options to add a passkey to the signed-in account. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env } = getCloudflareContext();
  if (!(await underLimit(env, "auth-passkey", req))) return tooMany();

  const user = await getSessionUser();
  if (!user) return json({ ok: false, error: "Sign in first." }, 401);

  const existing = await env.DB.prepare(`SELECT id, transports FROM passkeys WHERE user_id = ?1`)
    .bind(user.id)
    .all<{ id: string; transports: string | null }>();

  const options = await generateRegistrationOptions({
    rpName: "skateboardordie.com",
    rpID: site(req).rpID,
    userName: user.email,
    userDisplayName: user.handle ?? user.email,
    // Stable per account, so re-adding on the same device replaces rather
    // than duplicates.
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: existing.results.map((p) => ({
      id: p.id,
      transports: p.transports ? (JSON.parse(p.transports) as string[]) : undefined,
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
  });
  const challengeId = await saveChallenge("register", options.challenge, user.id);
  return json({ ok: true, options, challengeId });
}
