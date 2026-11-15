import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's default scale. Unknown `text-*` names
 * count as colors, so without this `text-body text-paper` loses the size, and
 * `shadow-hard` reads as a shadow color. Keep these lists in step with
 * tailwind-preset.cjs.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    classGroups: {
      'font-size': [{ text: ['micro', 'meta', 'body', 'lede', 'h3', 'h2', 'h1', 'display'] }],
      'font-family': [{ font: ['display', 'poster', 'body', 'mono'] }],
      shadow: [{ shadow: ['hard', 'hard-lg', 'hard-flag', 'hard-gold'] }],
      tracking: [{ tracking: ['slogan', 'stamp'] }],
      animate: [{ animate: ['marquee', 'marquee-fast', 'slap-in'] }],
    },
  },
});

/** Merge Tailwind class strings, resolving conflicts (last wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
