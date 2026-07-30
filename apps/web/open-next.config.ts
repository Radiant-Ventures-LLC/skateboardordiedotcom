import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal starter config. Add an incremental cache override (e.g. R2) here
// once ISR / on-demand revalidation is needed:
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   incrementalCache: r2IncrementalCache,
export default defineCloudflareConfig({});
