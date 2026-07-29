/**
 * Build config for compiling skateAF's own stylesheet (dist/skateAF.css).
 * Consumers don't use this file — they use the preset (tailwind-preset.cjs).
 */
module.exports = {
  presets: [require('./tailwind-preset.cjs')],
  content: ['./src/**/*.{ts,tsx}'],
  // Safelist the full token-driven surface so the shipped stylesheet contains
  // every on-brand utility, even ones only composed at runtime by consumers.
  safelist: [
    { pattern: /^(bg|text|border)-(flag|gold|sky|palm|concrete|void|ink|paper|blood)(-\d+)?$/ },
    { pattern: /^shadow-(hard|hard-lg|hard-flag|hard-gold)$/ },
    { pattern: /^font-(display|poster|body|mono)$/ },
    { pattern: /^animate-(marquee|marquee-fast|slap-in)$/ },
  ],
  theme: {},
  plugins: [],
};
