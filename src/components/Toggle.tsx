import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  tone?: 'flag' | 'gold' | 'sky' | 'palm';
}

const TONES: Record<NonNullable<ToggleProps['tone']>, string> = {
  flag: 'peer-checked:bg-flag',
  gold: 'peer-checked:bg-gold',
  sky: 'peer-checked:bg-sky',
  palm: 'peer-checked:bg-palm',
};

/**
 * Toggle — a hard-edged switch. Blocky knob, thick border, snaps across.
 * On means on: no ambiguity, bro.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, tone = 'palm', id, className, disabled, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-sm select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <span className="relative inline-block">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          disabled={disabled}
          {...props}
        />
        <span
          className={cn(
            'block h-6 w-11 border-3 border-void bg-concrete-200 transition-colors',
            TONES[tone]
          )}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-[2px] top-[2px] h-4 w-4 border-2 border-void bg-paper transition-transform peer-checked:translate-x-5"
        />
      </span>
      {label != null && <span className="font-body text-body text-ink">{label}</span>}
    </label>
  );
});
