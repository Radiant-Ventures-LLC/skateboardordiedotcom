import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type TagTone = 'flag' | 'gold' | 'sky' | 'palm' | 'void' | 'neutral';
export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  /** sm = label-size (default); md and lg to sit beside bigger type. */
  size?: TagSize;
  /** Solid fill instead of outline. */
  solid?: boolean;
}

const SIZES: Record<TagSize, string> = {
  sm: 'text-micro px-sm py-[2px]',
  md: 'text-meta px-sm py-[2px]',
  lg: 'text-body px-md py-xs',
};

const OUTLINE: Record<TagTone, string> = {
  flag: 'text-flag border-flag',
  gold: 'text-gold-600 border-gold-600',
  sky: 'text-sky-600 border-sky-600',
  palm: 'text-palm-600 border-palm-600',
  void: 'text-void border-void',
  neutral: 'text-concrete-500 border-concrete-300',
};

const SOLID: Record<TagTone, string> = {
  flag: 'bg-flag text-paper border-flag',
  gold: 'bg-gold text-void border-gold',
  sky: 'bg-sky text-void border-sky',
  palm: 'bg-palm text-void border-palm',
  void: 'bg-void text-paper border-void',
  neutral: 'bg-concrete-100 text-ink border-concrete-200',
};

/**
 * Tag — a compact, square category label. Metadata, filters, taxonomy.
 * Smaller and quieter than a Sticker.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = 'neutral', size = 'sm', solid = false, className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-xs border',
        'font-mono uppercase tracking-stamp',
        SIZES[size],
        solid ? SOLID[tone] : OUTLINE[tone],
        className
      )}
      {...props}
    />
  );
});
