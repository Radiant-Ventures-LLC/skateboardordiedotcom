# skateAF ★

**A constructivist-agitprop design system for skate culture.**
Skate. Organize. Repeat.

> ### skateboardordie.com — *Just another day in Paradise.*

skateAF is the toolkit behind [skateboardordie.com](https://skateboardordie.com) — a React
+ Tailwind component library built for skaters, socialists, and everyone who treats the
plaza like paradise. Bright poster inks, hard paste-up shadows, condensed agitprop type.
Not doom and gloom — solidarity as *joy*.

> the site code for skateboardordie.com. i dare you to hack it

---

## Install

```bash
npm install skateaf
```

```ts
// 1. the stylesheet (once, at your app root)
import 'skateaf/styles.css';

// 2. the components
import { Button, Marquee, Sticker } from 'skateaf';
```

```tsx
export function Plaza() {
  return (
    <>
      <Marquee items={['SKATE', 'ORGANIZE', 'REPEAT']} />
      <Sticker tone="flag" slap>★ Property of the People</Sticker>
      <Button variant="flag" size="lg">Drop In</Button>
    </>
  );
}
```

## Use the tokens in your own markup

skateAF ships a Tailwind **preset** — the whole design vocabulary (colors, spacing,
fonts, hard shadows, animations). Point your `tailwind.config` at it and compose freely:

```js
// tailwind.config.js
module.exports = {
  presets: [require('skateaf/preset')],
  content: ['./src/**/*.{ts,tsx}'],
};
```

```tsx
<div className="bg-paper text-ink border-3 border-void shadow-hard p-lg font-display">
  built from the same tokens as the library
</div>
```

## The vocabulary

| Kind | Tokens |
|------|--------|
| **Color** | `flag` (revolutionary red, primary) · `gold` (sun) · `sky` · `palm` · `void` · `paper` · `concrete-{50..900}` |
| **Type** | `font-poster` (heavy slab), `font-display` (condensed), `font-body`, `font-mono` |
| **Spacing** | `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 40 · `2xl` 64 · `3xl` 96 |
| **Shadow** | `shadow-hard`, `shadow-hard-lg`, `shadow-hard-flag`, `shadow-hard-gold` (blur-less paste-up offsets) |
| **Motion** | `animate-marquee`, `animate-marquee-fast`, `animate-slap-in` |
| **Texture** | `.skate-stripes` (gold caution band) · `.skate-halftone` (dot paper) |

Use the **names**, never raw hex — that's what keeps every design on-brand.

## Components (16)

`Button` · `Heading` · `Sticker` · `Tag` · `Card` · `Input` · `Avatar` · `Divider` ·
`Navbar` · `Modal` · `Toast` · `Tabs` · `Progress` · `Grid` · `Marquee` · `Toggle`
— plus the `Star`, `Fist`, and `Wheel` motifs.

## Develop

```bash
npm install
npm run build       # bundle JS + types (tsup) and compile the CSS (tailwind)
npm run typecheck   # tsc --noEmit
npm run dev:css     # watch-compile the stylesheet
```

Build output lands in `dist/`:

- `dist/index.js` / `dist/index.cjs` / `dist/index.d.ts` — the components
- `dist/skateAF.css` — the compiled stylesheet
- `tailwind-preset.cjs` — the design tokens (shipped as-is)

## License

MIT. Free to build with. Free to spread. The gate's always open.
