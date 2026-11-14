import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "../../../../_lib/auth";
import { badOrigin, clean, json, readJson, sameOrigin } from "../../../../_lib/http";

export const dynamic = "force-dynamic";

/** POST { id } → removes one of the signed-in skater's passkeys. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  const user = await getSessionUser();
  if (!user) return json({ ok: false, error: "Sign in first." }, 401);

  const body = await readJson<{ id?: unknown }>(req);
  const id = clean(body?.id, 1024);
  if (!id) return json({ ok: false, error: "Which passkey?" }, 400);

  const { env } = getCloudflareContext();
  await env.DB.prepare(`DELETE FROM passkeys WHERE id = ?1 AND user_id = ?2`)
    .bind(id, user.id)
    .run();
  return json({ ok: true });
}
