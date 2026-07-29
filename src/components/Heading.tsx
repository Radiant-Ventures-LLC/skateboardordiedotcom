import { forwardRef, type HTMLAttributes, type ElementType } from 'react';
import { cn } from '../lib/cn';

export type HeadingLevel = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  /** Poster slab face for maximum agitprop weight. */
  poster?: boolean;
  /** Show the red accent bar to the left — the flag mark. */
  bar?: boolean;
  /** Render as a different tag while keeping the visual level. */
  as?: ElementType;
}

const LEVEL_SIZE: Record<HeadingLevel, string> = {
  1: 'text-h1 md:text-display',
  2: 'text-h2',
  3: 'text-h3',
};

/**
 * Heading — condensed, uppercase, balanced. The voice of the manifesto.
 * Add `bar` for the red flag accent, `poster` for the heavy slab face.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, poster = false, bar = false, as, className, children, ...props },
  ref
) {
  const Tag = (as ?? (`h${level}` as ElementType)) as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn(
        'uppercase tracking-slogan text-ink',
        poster ? 'font-poster' : 'font-display font-700',
        LEVEL_SIZE[level],
        bar && 'flex items-center gap-md before:content-[""] before:block before:w-2 before:self-stretch before:min-h-[0.8em] before:bg-flag',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
});
