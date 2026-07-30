'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label, stamped above the input in mono caps. */
  label?: ReactNode;
  /** Helper or error text below the field. */
  hint?: ReactNode;
  /** Render the field in an error state. */
  invalid?: boolean;
}

/**
 * Input — a thick-bordered text field with a stamped mono label. Reads like
 * a form on a union clipboard.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, invalid = false, id, className, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-xs">
      {label != null && (
        <label
          htmlFor={inputId}
          className="font-mono text-micro uppercase tracking-stamp text-concrete-500"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={invalid || undefined}
        aria-describedby={hintId}
        className={cn(
          'w-full border-3 bg-paper px-md py-sm font-body text-body text-ink',
          'placeholder:text-concrete-300',
          'focus:outline-none focus:shadow-hard focus:-translate-y-[1px] transition-transform',
          invalid ? 'border-flag focus:shadow-hard-flag' : 'border-void',
          className
        )}
        {...props}
      />
      {hint != null && (
        <p
          id={hintId}
          className={cn('font-mono text-micro tracking-slogan', invalid ? 'text-flag' : 'text-concrete-400')}
        >
          {hint}
        </p>
      )}
    </div>
  );
});
