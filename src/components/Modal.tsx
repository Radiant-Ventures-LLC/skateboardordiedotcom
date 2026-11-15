'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Footer slot — usually the action Buttons. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal — a pasted-up dialog over a dimmed plaza. Hard border, gold ribbon
 * title, closes on Escape or backdrop click. Focus-traps lightly and
 * restores focus on close.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-lg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'w-full max-w-lg border-4 border-void bg-paper shadow-hard-lg outline-none',
          'motion-safe:animate-slap-in',
          className
        )}
      >
        {title != null && (
          <div className="flex items-center justify-between border-b-3 border-void bg-gold px-lg py-md">
            <h2 className="font-poster text-h3 uppercase leading-none text-void">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="font-mono text-lede font-bold leading-none text-void hover:text-flag"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-lg font-body text-body text-ink">{children}</div>
        {footer != null && (
          <div className="flex justify-end gap-sm border-t-3 border-void bg-concrete-50 px-lg py-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
