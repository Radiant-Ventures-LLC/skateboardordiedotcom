import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
export type GridGap = 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count at the largest breakpoint. Collapses responsively. */
  cols?: GridCols;
  gap?: GridGap;
}

// Static maps so Tailwind can see every class at build time.
const COLS: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

const GAP: Record<GridGap, string> = {
  sm: 'gap-sm',
  md: 'gap-md',
  lg: 'gap-lg',
  xl: 'gap-xl',
};

/**
 * Grid — a responsive layout scaffold on the token spacing scale. The
 * blueprint under every poster.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { cols = 3, gap = 'lg', className, ...props },
  ref
) {
  return <div ref={ref} className={cn('grid', COLS[cols], GAP[gap], className)} {...props} />;
});
