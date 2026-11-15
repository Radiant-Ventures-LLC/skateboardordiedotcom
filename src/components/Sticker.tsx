import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type StickerTone = 'flag' | 'gold' | 'sky' | 'palm' | 'void' | 'paper';
export type StickerSize = 'sm' | 'md' | 'lg';

export interface StickerProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StickerTone;
  /** sm = label-size (default); md and lg for heroes and headers. */
  size?: StickerSize;
  /** Slap it on at an angle, like a real board sticker. */
  tilt?: boolean;
  /** Play the slap-in entrance animation. */
  slap?: boolean;
}

const SIZES: Record<StickerSize, string> = {
  sm: 'text-micro px-sm py-xs',
  md: 'text-meta px-sm py-xs',
  lg: 'text-body px-md py-xs',
};

const TONES: Record<StickerTone, string> = {
  flag: 'bg-flag text-paper border-void',
  gold: 'bg-gold text-void border-void',
  sky: 'bg-sky text-void border-void',
  palm: 'bg-palm text-void border-void',
  void: 'bg-void text-paper border-void',
  paper: 'bg-paper text-ink border-void',
};

/**
 * Sticker — a slapped-on badge / label. The currency of skate culture:
 * free to make, free to spread. Tilt and slap it for board-deck energy.
 */
export const Sticker = forwardRef<HTMLSpanElement, StickerProps>(function Sticker(
  { tone = 'flag', size = 'sm', tilt = true, slap = false, className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-xs border-3',
        'font-mono font-bold uppercase tracking-stamp shadow-hard',
        SIZES[size],
        TONES[tone],
        tilt && '-rotate-2',
        slap && 'animate-slap-in',
        className
      )}
      {...props}
    />
  );
});
