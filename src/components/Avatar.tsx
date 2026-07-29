import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Fallback initials shown when there's no image. */
  initials?: string;
  size?: AvatarSize;
  /** Round instead of the default square. */
  round?: boolean;
  tone?: 'flag' | 'gold' | 'sky' | 'palm' | 'void';
}

const SIZES: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-meta',
  md: 'w-12 h-12 text-body',
  lg: 'w-16 h-16 text-lede',
};

const TONES: Record<NonNullable<AvatarProps['tone']>, string> = {
  flag: 'bg-flag text-paper',
  gold: 'bg-gold text-void',
  sky: 'bg-sky text-void',
  palm: 'bg-palm text-void',
  void: 'bg-void text-paper',
};

/**
 * Avatar — a bordered portrait for crew members. Square by default (deck
 * shape); pass `round` for a wheel. Falls back to stamped initials.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt = '', initials, size = 'md', round = false, tone = 'flag', className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center overflow-hidden border-3 border-void shadow-hard select-none',
        'font-display font-700 uppercase leading-none',
        round ? 'rounded-full' : 'rounded-none',
        !src && TONES[tone],
        SIZES[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span aria-label={alt || undefined}>{initials?.slice(0, 2) ?? '★'}</span>
      )}
    </span>
  );
});
