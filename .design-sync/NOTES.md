# skateAF design-sync notes

Repo-specific gotchas for future syncs. One bullet per gotcha.

- **Package manager: pnpm.** Environment installs with pnpm (`pnpm-lock.yaml` + `pnpm-workspace.yaml` present). Do NOT `npm install` — it creates a competing `package-lock.json`. Build with `pnpm run build`.
- **Build entry:** `package.json` `module` → `./dist/index.js` (ESM). Pass `--entry ./dist/index.js` to the converter. CJS is `./dist/index.cjs`.
- **CSS:** the whole stylesheet is compiled by the tailwind CLI to `dist/skateAF.css` (`cfg.cssEntry`). Tokens live in `tailwind-preset.cjs` (a JS preset), not in separate token CSS files — there is no `tokensGlob`.
- **Fonts:** `src/styles/index.css` `@import`s Google Fonts (Oswald, Archivo Black, Space Mono, Inter) via a remote `@import url(...)`. Expect `[FONT_REMOTE]` (informational) — the families load at runtime, nothing to ship. Fallback stacks are defined in the preset.
- **node_modules for `--node-modules`:** this is the DS's own repo, so `node_modules/skateaf` doesn't exist (hence `--entry`). Point `--node-modules` at the repo-root `./node_modules` where `react`/`react-dom` resolve.

## Re-sync risks

- The remote Google-Fonts `@import` means previews depend on network at render time. If offline, fonts fall back to the preset's system stacks (Impact/Arial Narrow/etc.) — not a failure, but note it if a render looks off.
