import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { base64url, getSessionUser, site, takeChallenge } from "../../../../../_lib/auth";
import {
  badOrigin,
  clean,
  json,
  readJson,
  sameOrigin,
  tooMany,
  underLimit,
} from "../../../../../_lib/http";
import { passkeyName } from "../../../../../_lib/passkeyNames";

export const dynamic = "force-dynamic";

/** POST { challengeId, response } → saves a new passkey on the account. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env } = getCloudflareContext();
  if (!(await underLimit(env, "auth-passkey", req))) return tooMany();

  const user = await getSessionUser();
  if (!user) return json({ ok: false, error: "Sign in first." }, 401);

  const body = await readJson<{ challengeId?: unknown; response?: RegistrationResponseJSON }>(req);
  const challengeId = clean(body?.challengeId, 100);
  const response = body?.response;
  if (!challengeId || typeof response?.id !== "string") {
    return json({ ok: false, error: "That didn't come through. Try again." }, 400);
  }

  const expectedChallenge = await takeChallenge(challengeId, "register", user.id);
  if (!expectedChallenge) {
    return json({ ok: false, error: "That took too long. Try again." }, 400);
  }

  const { origin, rpID } = site(req);
  let info;
  try {
    const v = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
    if (v.verified) info = v.registrationInfo;
  } catch (err) {
    console.error("passkey register verify failed", (err as Error).message);
  }
  if (!info) {
    return json({ ok: false, error: "Couldn't save that passkey. Try again." }, 400);
  }

  const { credential, credentialDeviceType, credentialBackedUp, aaguid } = info;
  await env.DB.prepare(
    `INSERT INTO passkeys (id, user_id, public_key, counter, transports, device_type, backed_up, name)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT (id) DO NOTHING`,
  )
    .bind(
      credential.id,
      user.id,
      base64url(credential.publicKey),
      credential.counter,
      credential.transports ? JSON.stringify(credential.transports) : null,
      credentialDeviceType,
      credentialBackedUp ? 1 : 0,
      passkeyName(aaguid, credentialBackedUp),
    )
    .run();
  return json({ ok: true });
}
