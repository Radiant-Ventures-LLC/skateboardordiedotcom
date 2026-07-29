import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style: a solid rule, or the gold caution stripes. */
  variant?: 'solid' | 'stripes';
  /** Optional centered label stamped into the rule. */
  label?: ReactNode;
}

/**
 * Divider — a thick section break. `stripes` renders the gold/black caution
 * band; `solid` is a heavy rule, optionally with a stamped label.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { variant = 'solid', label, className, ...props },
  ref
) {
  if (variant === 'stripes') {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn('skate-stripes h-4 w-full border-y-3 border-void', className)}
        {...props}
      />
    );
  }

  if (label != null) {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn('flex items-center gap-md text-concrete-500', className)}
        {...props}
      >
        <span className="h-[3px] flex-1 bg-void" />
        <span className="font-mono text-micro uppercase tracking-stamp">{label}</span>
        <span className="h-[3px] flex-1 bg-void" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      className={cn('h-[3px] w-full bg-void', className)}
      {...props}
    />
  );
});
