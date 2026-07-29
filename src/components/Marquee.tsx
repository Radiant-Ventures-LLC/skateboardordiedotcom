import { forwardRef, type HTMLAttributes, Children } from 'react';
import { cn } from '../lib/cn';
import { voice } from '../voice';

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Slogans/items to scroll. Strings get the ★ separator automatically. */
  items?: string[];
  tone?: 'flag' | 'gold' | 'sky' | 'palm' | 'void';
  /** Faster scroll for urgent agitprop. */
  fast?: boolean;
}

const TONES: Record<NonNullable<MarqueeProps['tone']>, string> = {
  flag: 'bg-flag text-paper',
  gold: 'bg-gold text-void',
  sky: 'bg-sky text-void',
  palm: 'bg-palm text-void',
  void: 'bg-void text-paper',
};

// The plaza chants by default — the lock-in language (see voice.ts).
const DEFAULT_ITEMS = [...voice.chants];

/**
 * Marquee — an infinite scrolling ticker banner. The chant of the plaza.
 * Duplicated inline so the loop is seamless; respects reduced motion.
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  { items = DEFAULT_ITEMS, tone = 'flag', fast = false, className, children, ...props },
  ref
) {
  const content =
    children != null
      ? Children.toArray(children)
      : items.flatMap((item, i) => [
          <span key={`t-${i}`}>{item}</span>,
          <span key={`s-${i}`} aria-hidden className="opacity-70">
            ★
          </span>,
        ]);

  const track = (
    <div
      className={cn(
        'flex shrink-0 items-center gap-lg pr-lg font-display font-700 uppercase tracking-slogan text-lede',
        'motion-safe:animate-marquee',
        fast && 'motion-safe:animate-marquee-fast'
      )}
    >
      {content}
    </div>
  );

  return (
    <div
      ref={ref}
      className={cn('flex w-full overflow-hidden border-y-3 border-void py-sm', TONES[tone], className)}
      {...props}
    >
      {track}
      <div aria-hidden className="contents">
        {track}
      </div>
    </div>
  );
});
