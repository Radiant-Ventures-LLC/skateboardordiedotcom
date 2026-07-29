import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type StickerTone = 'flag' | 'gold' | 'sky' | 'palm' | 'void' | 'paper';

export interface StickerProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StickerTone;
  /** Slap it on at an angle, like a real board sticker. */
  tilt?: boolean;
  /** Play the slap-in entrance animation. */
  slap?: boolean;
}

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
  { tone = 'flag', tilt = true, slap = false, className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-xs border-3 px-sm py-xs',
        'font-mono font-700 text-micro uppercase tracking-stamp shadow-hard',
        TONES[tone],
        tilt && '-rotate-2',
        slap && 'animate-slap-in',
        className
      )}
      {...props}
    />
  );
});
