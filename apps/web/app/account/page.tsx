import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Heading, Sticker } from "skateaf";
import { getSessionUser } from "../_lib/auth";
import { PasskeyManager, type PasskeyRow } from "../_components/PasskeyManager";
import { SignOutButton } from "../_components/SignOutButton";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

// D1 timestamps are UTC "YYYY-MM-DD HH:MM:SS".
function day(ts: string | null): string | null {
  if (!ts) return null;
  return new Date(`${ts.replace(" ", "T")}Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const isNew = (await searchParams).new === "1";

  const { env } = getCloudflareContext();
  const rows = await env.DB.prepare(
    `SELECT id, name, created_at, last_used_at FROM passkeys
      WHERE user_id = ?1 ORDER BY created_at`,
  )
    .bind(user.id)
    .all<{ id: string; name: string | null; created_at: string; last_used_at: string | null }>();
  const passkeys: PasskeyRow[] = rows.results.map((r) => ({
    id: r.id,
    name: r.name ?? "Passkey",
    added: day(r.created_at)!,
    lastUsed: day(r.last_used_at),
  }));

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <Sticker tone="gold" tilt>
        Founding Skater
      </Sticker>
      <Heading level={1} bar poster className="mt-6">
        {isNew ? "You're in." : "Your plot."}
      </Heading>
      {isNew && (
        <p className="mt-6 text-lede text-concrete-600">
          Make yourself at home. The whole garden&rsquo;s yours.
        </p>
      )}
      <p className="mt-4 font-mono text-meta uppercase tracking-stamp text-concrete-500">
        Signed in as <span className="normal-case text-ink">{user.email}</span>
      </p>

      <div className="mt-10 border-2 border-void bg-paper p-6 shadow-hard-lg md:p-8">
        <h2 className="font-display text-h3 uppercase tracking-slogan text-ink">Passkeys</h2>
        <div className="mt-4">
          <PasskeyManager passkeys={passkeys} nudge={isNew} />
        </div>
      </div>

      <div className="mt-8 border-2 border-dashed border-void/40 p-6">
        <h2 className="font-display text-h3 uppercase tracking-slogan text-ink">Coming with your wave</h2>
        <p className="mt-2 text-body text-concrete-600">
          Your handle, home spot and crew. Founding skaters get first pick when the map opens.
        </p>
      </div>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </section>
  );
}
