import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Avatar } from './Avatar';
import { Sticker } from './Sticker';

export interface ClipCardProps extends HTMLAttributes<HTMLElement> {
  /** Skater's handle, without the @. */
  handle: string;
  avatarUrl?: string;
  spotName: string;
  thumbnailUrl?: string;
  caption?: string;
  /** Already formatted, e.g. "2h" or "Mar 3". */
  postedAgo?: string;
  durationSeconds?: number;
  visibility?: 'public' | 'crew';
  status?: 'processing' | 'ready' | 'failed';
}

function formatDuration(s: number) {
  const total = Math.max(0, Math.round(s));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function PlayMark() {
  return (
    <span
      aria-hidden
      className="flex h-14 w-14 items-center justify-center border-3 border-void bg-flag text-paper shadow-hard"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M7 4.5v15l12.5-7.5z" />
      </svg>
    </span>
  );
}

function PinMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="shrink-0">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

/**
 * ClipCard — a clip in a feed: the thumbnail, who posted it, where, and
 * the caption. Playback is the app's job; wrap the card in a link or
 * button that opens the player.
 */
export const ClipCard = forwardRef<HTMLElement, ClipCardProps>(function ClipCard(
  {
    handle,
    avatarUrl,
    spotName,
    thumbnailUrl,
    caption,
    postedAgo,
    durationSeconds,
    visibility = 'public',
    status = 'ready',
    className,
    ...props
  },
  ref
) {
  return (
    <article
      ref={ref}
      className={cn('flex flex-col border-3 border-void bg-paper text-ink shadow-hard', className)}
      {...props}
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b-3 border-void bg-void">
        {thumbnailUrl && status !== 'failed' && (
          <img src={thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}

        {status === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayMark />
          </div>
        )}
        {status === 'processing' && (
          <div className="skate-stripes absolute inset-0 flex items-center justify-center opacity-90">
            <Sticker tone="paper" size="md">Processing</Sticker>
          </div>
        )}
        {status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-flag/90">
            <Sticker tone="void" size="md">Upload failed</Sticker>
          </div>
        )}

        {visibility === 'crew' && (
          <Sticker tone="void" tilt={false} className="absolute left-sm top-sm">
            Crew only
          </Sticker>
        )}
        {durationSeconds != null && status === 'ready' && (
          <span className="absolute bottom-sm right-sm border-2 border-void bg-void px-xs py-[1px] font-mono text-micro font-bold text-paper">
            {formatDuration(durationSeconds)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-sm p-md">
        <div className="flex items-center gap-sm">
          <Avatar src={avatarUrl} alt={avatarUrl ? `@${handle}` : undefined} initials={handle.slice(0, 2)} size="sm" />
          <span className="min-w-0 truncate font-mono text-meta font-bold text-ink">@{handle}</span>
          {postedAgo && (
            <span className="ml-auto shrink-0 font-mono text-micro uppercase tracking-stamp text-concrete-500">
              {postedAgo}
            </span>
          )}
        </div>
        {caption && <p className="line-clamp-2 text-body text-ink">{caption}</p>}
        <p className="flex items-center gap-xs font-display text-meta font-semibold uppercase tracking-slogan text-flag">
          <PinMark />
          <span className="truncate">{spotName}</span>
        </p>
      </div>
    </article>
  );
});
