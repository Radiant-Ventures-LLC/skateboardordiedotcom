import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'flag' | 'gold' | 'sky' | 'palm' | 'void' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Color/emphasis. `flag` (red) is the primary call-to-action. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  flag: 'bg-flag text-paper border-void shadow-hard hover:bg-flag-600',
  gold: 'bg-gold text-void border-void shadow-hard hover:bg-gold-600',
  sky: 'bg-sky text-void border-void shadow-hard hover:bg-sky-600',
  palm: 'bg-palm text-void border-void shadow-hard hover:bg-palm-600',
  void: 'bg-void text-paper border-void shadow-hard-flag hover:bg-concrete-700',
  outline: 'bg-paper text-ink border-void shadow-hard hover:bg-concrete-50',
  ghost: 'bg-transparent text-ink border-transparent shadow-none hover:bg-void/10',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-meta px-md py-xs gap-xs',
  md: 'text-body px-lg py-sm gap-sm',
  lg: 'text-lede px-xl py-md gap-sm',
};

/**
 * Button — the primary action. Loud, condensed, uppercase, with a hard
 * paste-up shadow that lifts on press. Skate. Organize. Repeat.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'flag', size = 'md', block = false, className, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center border font-display font-semibold uppercase tracking-slogan leading-none',
        'transition-[transform,box-shadow,background-color] duration-100',
        'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className
      )}
      {...props}
    />
  );
});
