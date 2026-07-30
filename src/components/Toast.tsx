'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ToastTone = 'flag' | 'gold' | 'sky' | 'palm' | 'void';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: ToastTone;
  title?: ReactNode;
  /** Optional leading icon/motif. */
  icon?: ReactNode;
  onDismiss?: () => void;
}

const TONES: Record<ToastTone, string> = {
  flag: 'bg-flag text-paper',
  gold: 'bg-gold text-void',
  sky: 'bg-sky text-void',
  palm: 'bg-palm text-void',
  void: 'bg-void text-paper',
};

/**
 * Toast — a slapped-on notification. Announces itself politely to screen
 * readers, dismissable, with the signature hard shadow.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { tone = 'palm', title, icon, onDismiss, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-sm border-3 border-void px-md py-sm shadow-hard motion-safe:animate-slap-in',
        TONES[tone],
        className
      )}
      {...props}
    >
      {icon != null && <span className="mt-[2px] shrink-0 text-lede leading-none">{icon}</span>}
      <div className="flex-1">
        {title != null && (
          <p className="font-display font-700 uppercase tracking-slogan text-body leading-tight">
            {title}
          </p>
        )}
        {children != null && <p className="font-body text-meta">{children}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 font-mono font-700 leading-none hover:opacity-70"
        >
          ✕
        </button>
      )}
    </div>
  );
});
