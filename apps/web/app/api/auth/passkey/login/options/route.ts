import { getCloudflareContext } from "@opennextjs/cloudflare";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { saveChallenge, site } from "../../../../../_lib/auth";
import { badOrigin, json, sameOrigin, tooMany, underLimit } from "../../../../../_lib/http";

export const dynamic = "force-dynamic";

/**
 * POST → options for a passkey sign-in. No email needed: passkeys are
 * discoverable, so the device offers whichever ones it has for this site.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env } = getCloudflareContext();
  if (!(await underLimit(env, "auth-passkey", req))) return tooMany();

  const options = await generateAuthenticationOptions({
    rpID: site(req).rpID,
    userVerification: "preferred",
  });
  const challengeId = await saveChallenge("login", options.challenge, null);
  return json({ ok: true, options, challengeId });
}
