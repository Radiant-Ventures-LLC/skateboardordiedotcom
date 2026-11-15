import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional ribbon label pasted across the top of the card. */
  ribbon?: ReactNode;
  /** Ribbon color. */
  ribbonTone?: 'flag' | 'gold' | 'sky' | 'palm' | 'void';
  /** Bigger hard shadow for hero cards. */
  raised?: boolean;
  /** Subtle halftone dot texture on the surface. */
  textured?: boolean;
}

const RIBBON: Record<NonNullable<CardProps['ribbonTone']>, string> = {
  flag: 'bg-flag text-paper',
  gold: 'bg-gold text-void',
  sky: 'bg-sky text-void',
  palm: 'bg-palm text-void',
  void: 'bg-void text-paper',
};

/**
 * Card — a bordered panel with a hard paste-up shadow. The building block
 * for content: a deck spot, a manifesto point, a crew profile.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { ribbon, ribbonTone = 'flag', raised = false, textured = false, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'border-3 border-void bg-paper text-ink',
        raised ? 'shadow-hard-lg' : 'shadow-hard',
        textured && 'skate-halftone',
        className
      )}
      {...props}
    >
      {ribbon != null && (
        <div
          className={cn(
            'border-b-3 border-void px-md py-sm font-display font-bold uppercase tracking-slogan text-body',
            RIBBON[ribbonTone]
          )}
        >
          {ribbon}
        </div>
      )}
      <div className="p-lg">{children}</div>
    </div>
  );
});
