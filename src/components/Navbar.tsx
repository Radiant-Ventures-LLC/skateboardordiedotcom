'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Star } from './Motifs';

export interface NavLink {
  label: ReactNode;
  href?: string;
  /** Mark the current page. */
  active?: boolean;
  onClick?: () => void;
}

export interface NavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Wordmark / brand. Defaults to the skateAF lockup. */
  brand?: ReactNode;
  links?: NavLink[];
  /** Slot on the right — a Button, avatar, etc. */
  action?: ReactNode;
}

/**
 * Navbar — the top masthead. Red banner, star lockup, condensed links.
 * The front page of the plaza.
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { brand, links = [], action, className, ...props },
  ref
) {
  return (
    <nav
      ref={ref}
      className={cn(
        'flex items-center gap-lg border-b-4 border-void bg-flag px-lg py-md text-paper',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-sm font-poster text-h3 uppercase leading-none">
        {brand ?? (
          <>
            <Star size="1.1em" className="text-gold" />
            <span>
              skate<span className="text-gold">AF</span>
            </span>
          </>
        )}
      </div>

      <ul className="ml-auto hidden items-center gap-lg md:flex">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link.href}
              onClick={link.onClick}
              aria-current={link.active ? 'page' : undefined}
              className={cn(
                'font-display font-semibold uppercase tracking-slogan text-body transition-colors',
                'hover:text-gold',
                link.active && 'text-gold underline decoration-3 underline-offset-4'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {action != null && <div className={cn(links.length ? '' : 'ml-auto')}>{action}</div>}
    </nav>
  );
});
