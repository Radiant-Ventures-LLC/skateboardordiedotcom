import { endSession } from "../../../_lib/auth";
import { badOrigin, json, sameOrigin } from "../../../_lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badOrigin();
  await endSession(req);
  return json({ ok: true });
}
