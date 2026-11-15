import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Star } from './Motifs';

export type SpotPinVisibility = 'public' | 'approximate' | 'crew';

export interface SpotPinProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Spot name, read out by screen readers. */
  label: string;
  /**
   * 'public' and 'crew' pins point at the exact spot (anchor the marker at
   * its bottom tip). 'approximate' pins are a ring around the rough area
   * (anchor at the centre). `spotPinAnchor()` returns the right anchor.
   */
  visibility?: SpotPinVisibility;
  /** 'gone' = knobbed or demolished: greyed out, crossed. */
  status?: 'active' | 'gone';
  selected?: boolean;
  /** Clips posted here. Shown as a badge when above zero. */
  count?: number;
}

/** Where a map marker should anchor this pin. */
export function spotPinAnchor(visibility: SpotPinVisibility = 'public'): 'bottom' | 'center' {
  return visibility === 'approximate' ? 'center' : 'bottom';
}

// Fill classes for the exact pin's head and its mark.
function tone(visibility: SpotPinVisibility, status: 'active' | 'gone', selected: boolean) {
  if (status === 'gone') return { head: 'fill-concrete-200', mark: 'stroke-concrete-500' };
  if (selected) return { head: 'fill-gold', mark: 'fill-void' };
  return visibility === 'crew'
    ? { head: 'fill-void', mark: 'fill-gold' }
    : { head: 'fill-flag', mark: 'fill-paper' };
}

// One outline for head + pointer, so the tip is a clean point. The box is
// 38 x 45: the tip sits at its bottom centre (19, 45 with the stroke's
// miter), which is where a map marker anchored at 'bottom' puts the spot.
// The hard shadow is the same outline offset 4px and spills outside the box.
const PIN_PATH = 'M4 2H34V32H25L19 42L13 32H4Z';
const STAR_PATH =
  'M12 1.6l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.34 5.82 20.6 7 13.73l-5-4.87 6.91-1L12 1.6z';

function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="absolute -right-sm -top-sm z-10 min-w-[20px] border-2 border-void bg-void px-[3px] py-[1px] text-center font-mono text-micro font-bold leading-none text-paper"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * SpotPin — a spot on the map. Exact spots get a stamped square with a
 * pointer; approximate spots get a dashed ring, so nobody mistakes a fuzzed
 * position for the real one. Crew-only spots are black with a gold star.
 */
export const SpotPin = forwardRef<HTMLButtonElement, SpotPinProps>(function SpotPin(
  { label, visibility = 'public', status = 'active', selected = false, count = 0, className, ...props },
  ref
) {
  const gone = status === 'gone';
  const name = [
    label,
    visibility === 'approximate' && 'approximate location',
    visibility === 'crew' && 'crew only',
    gone && 'gone',
    count > 0 && `${count} clip${count === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(', ');

  const focus =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600';

  if (visibility === 'approximate') {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={name}
        aria-pressed={selected}
        className={cn(
          'relative inline-flex h-12 w-12 items-center justify-center rounded-full border-3 border-dashed transition-transform',
          gone
            ? 'border-concrete-400 bg-concrete-200/60 text-concrete-500'
            : selected
              ? 'scale-110 border-void bg-gold/50 text-void'
              : 'border-flag bg-flag/15 text-flag',
          focus,
          className
        )}
        {...props}
      >
        {gone ? (
          <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="square">
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        ) : (
          <Star size={18} />
        )}
        {count > 0 && !gone && <CountBadge count={count} />}
      </button>
    );
  }

  const t = tone(visibility, status, selected);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={name}
      aria-pressed={selected}
      className={cn(
        'relative inline-block h-[45px] w-[38px] origin-bottom transition-transform',
        selected && 'scale-110',
        focus,
        className
      )}
      {...props}
    >
      <svg aria-hidden viewBox="0 0 38 45" width="38" height="45" className="overflow-visible">
        <path d={PIN_PATH} transform="translate(4 4)" className="fill-void" />
        <path d={PIN_PATH} strokeWidth={3} strokeLinejoin="miter" className={cn('stroke-void', t.head)} />
        {gone ? (
          <path d="M14 12L24 22M24 12L14 22" strokeWidth={3} strokeLinecap="square" className={t.mark} />
        ) : (
          <path d={STAR_PATH} transform="translate(11 9) scale(0.6667)" className={t.mark} />
        )}
      </svg>
      {count > 0 && !gone && <CountBadge count={count} />}
    </button>
  );
});
