// Client-side POST helper for the auth API. Network failures come back as
// a normal { ok: false } so callers have one error path.
export type ApiResult = { ok: boolean; error?: string } & Record<string, unknown>;

export async function postJson<T extends ApiResult>(url: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "No signal. Check your connection and try again." } as T;
  }
}
