// Runs work after the response is sent and logs failures instead of
// throwing. Awaiting inside an async wrapper (rather than calling .catch)
// also handles bindings that hand back a bare thenable, as the local
// `next dev` email binding does.
export function inBackground(
  ctx: { waitUntil(p: Promise<unknown>): void },
  label: string,
  work: () => PromiseLike<unknown>,
) {
  ctx.waitUntil(
    (async () => {
      try {
        await work();
      } catch (err) {
        const e = err as { code?: string; message?: string };
        console.error(`${label} failed`, e.code, e.message);
      }
    })(),
  );
}
