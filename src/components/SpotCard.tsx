import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Star } from './Motifs';
import { Tag } from './Tag';
import { Sticker } from './Sticker';

export type SpotCondition = 'skateable' | 'rough' | 'blocked';

export interface SpotCardProps extends HTMLAttributes<HTMLElement> {
  name: string;
  /** Neighbourhood or city, e.g. "East Austin". */
  area?: string;
  photoUrl?: string;
  photoAlt?: string;
  /** e.g. ['ledge', 'rail', 'DIY']. Shows the first four. */
  tags?: string[];
  condition?: SpotCondition;
  /** 0 nobody cares · 1 sometimes · 2 usually · 3 instant kick-out. */
  bust?: 0 | 1 | 2 | 3;
  clipCount?: number;
  visibility?: 'public' | 'approximate' | 'crew';
  /** 'gone' = knobbed or demolished. */
  status?: 'active' | 'gone';
  /** Heading level for the spot name, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
}

const CONDITION: Record<SpotCondition, { label: string; className: string }> = {
  skateable: { label: 'Skateable', className: 'bg-palm text-void' },
  rough: { label: 'Rough', className: 'bg-gold text-void' },
  blocked: { label: 'Blocked', className: 'bg-flag text-paper' },
};

const BUST_WORD = ['Chill', 'Sometimes', 'Usually', 'Instant'] as const;

/** Three blocks, filled up to the bust factor. */
function BustMeter({ level }: { level: 0 | 1 | 2 | 3 }) {
  return (
    <span
      role="img"
      aria-label={`Bust factor ${level} of 3: ${BUST_WORD[level].toLowerCase()}`}
      className="inline-flex items-center gap-xs font-mono text-micro uppercase tracking-stamp text-concrete-500"
    >
      Bust
      <span aria-hidden className="inline-flex gap-[2px]">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn('h-3 w-2 border-2 border-void', n <= level ? 'bg-flag' : 'bg-paper')} />
        ))}
      </span>
    </span>
  );
}

/**
 * SpotCard — a spot in a list or on a map sheet: photo, name, area, tags,
 * the latest condition and bust factor, and how many clips it has. Wrap it
 * in a link to make it clickable.
 */
export const SpotCard = forwardRef<HTMLElement, SpotCardProps>(function SpotCard(
  {
    name,
    area,
    photoUrl,
    photoAlt = '',
    tags = [],
    condition,
    bust,
    clipCount = 0,
    visibility = 'public',
    status = 'active',
    headingLevel = 3,
    className,
    ...props
  },
  ref
) {
  const gone = status === 'gone';
  const H = `h${headingLevel}` as const;
  return (
    <article
      ref={ref}
      className={cn('flex flex-col border-3 border-void bg-paper text-ink shadow-hard', className)}
      {...props}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-3 border-void bg-concrete-50">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photoAlt}
            loading="lazy"
            className={cn('h-full w-full object-cover', gone && 'grayscale')}
          />
        ) : (
          <div className="skate-halftone flex h-full w-full items-center justify-center text-concrete-300">
            <Star size={40} />
          </div>
        )}
        {visibility !== 'public' && !gone && (
          <Sticker tone={visibility === 'crew' ? 'void' : 'sky'} tilt={false} className="absolute left-sm top-sm">
            {visibility === 'crew' ? 'Crew only' : 'Approx. spot'}
          </Sticker>
        )}
        {gone && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/30">
            <Sticker tone="flag" size="lg">Gone</Sticker>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-sm p-md">
        <div>
          <H className={cn('font-display text-lede font-bold uppercase leading-none tracking-slogan', gone && 'line-through')}>
            {name}
          </H>
          {area && (
            <p className="mt-xs font-mono text-micro uppercase tracking-stamp text-concrete-500">{area}</p>
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-xs" aria-label="Tags">
            {tags.slice(0, 4).map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-md gap-y-xs pt-xs">
          {condition && !gone && (
            <span
              className={cn(
                'border-2 border-void px-xs py-[1px] font-mono text-micro font-bold uppercase tracking-stamp',
                CONDITION[condition].className
              )}
            >
              {CONDITION[condition].label}
            </span>
          )}
          {bust != null && !gone && <BustMeter level={bust} />}
          <span className="ml-auto font-mono text-micro font-bold uppercase tracking-stamp text-ink">
            {clipCount} {clipCount === 1 ? 'clip' : 'clips'}
          </span>
        </div>
      </div>
    </article>
  );
});
