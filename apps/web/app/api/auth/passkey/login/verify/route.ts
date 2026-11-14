import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { fromBase64url, site, startSession, takeChallenge } from "../../../../../_lib/auth";
import {
  badOrigin,
  clean,
  json,
  readJson,
  sameOrigin,
  tooMany,
  underLimit,
} from "../../../../../_lib/http";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  public_key: string;
  counter: number;
  transports: string | null;
};

/** POST { challengeId, response } → verifies the passkey and signs in. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const { env } = getCloudflareContext();
  if (!(await underLimit(env, "auth-passkey", req))) return tooMany();

  const body = await readJson<{ challengeId?: unknown; response?: AuthenticationResponseJSON }>(req);
  const challengeId = clean(body?.challengeId, 100);
  const response = body?.response;
  if (!challengeId || typeof response?.id !== "string") {
    return json({ ok: false, error: "That didn't come through. Try again." }, 400);
  }

  const expectedChallenge = await takeChallenge(challengeId, "login", null);
  if (!expectedChallenge) {
    return json({ ok: false, error: "That took too long. Try again." }, 400);
  }

  const cred = await env.DB.prepare(
    `SELECT id, user_id, public_key, counter, transports FROM passkeys WHERE id = ?1`,
  )
    .bind(response.id)
    .first<Row>();
  if (!cred) {
    // Lets the browser hide a passkey we no longer recognize.
    return json(
      {
        ok: false,
        unknownCredential: true,
        error: "We don't know that passkey anymore. Get an email link instead.",
      },
      400,
    );
  }

  const { origin, rpID } = site(req);
  let verified = false;
  let newCounter = cred.counter;
  try {
    const v = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.id,
        publicKey: fromBase64url(cred.public_key),
        counter: cred.counter,
        transports: cred.transports ? (JSON.parse(cred.transports) as string[]) : undefined,
      },
      requireUserVerification: false,
    });
    verified = v.verified;
    newCounter = v.authenticationInfo.newCounter;
  } catch (err) {
    console.error("passkey login verify failed", (err as Error).message);
  }
  if (!verified) {
    return json({ ok: false, error: "Couldn't verify that passkey. Try again." }, 400);
  }

  await env.DB.prepare(
    `UPDATE passkeys SET counter = ?2, last_used_at = datetime('now') WHERE id = ?1`,
  )
    .bind(cred.id, newCounter)
    .run();
  await startSession(req, cred.user_id);
  return json({ ok: true });
}
