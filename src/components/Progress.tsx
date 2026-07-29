import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value, 0–max. */
  value: number;
  max?: number;
  tone?: 'flag' | 'gold' | 'sky' | 'palm';
  /** Show the percentage stamped on the right. */
  showValue?: boolean;
  /** Optional label stamped above the bar. */
  label?: string;
}

const TONES: Record<NonNullable<ProgressProps['tone']>, string> = {
  flag: 'bg-flag',
  gold: 'bg-gold',
  sky: 'bg-sky',
  palm: 'bg-palm',
};

/**
 * Progress — a chunky meter. Fund drives, quotas, XP, the road to the
 * revolution. Hard border, no rounding, honest fill.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, tone = 'palm', showValue = false, label, className, ...props },
  ref
) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div ref={ref} className={cn('flex flex-col gap-xs', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between font-mono text-micro uppercase tracking-stamp text-concrete-500">
          {label && <span>{label}</span>}
          {showValue && <span className="text-ink">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-5 w-full border-3 border-void bg-paper p-[2px]"
      >
        <div
          className={cn('h-full transition-[width] duration-300', TONES[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
});
