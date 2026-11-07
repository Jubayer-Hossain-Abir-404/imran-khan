import { Play } from 'lucide-react'
import type { MouseEvent } from 'react'
import { clipWatchUrl } from '@/lib/clip'
import { externalLinkProps, isPlainClick } from '@/lib/links'
import { cn } from '@/lib/utils'
import { formatDuration, isoDuration } from '@/lib/youtube'
import type { Clip } from '@/types'
import { HoverFrame } from './HoverFrame'

/** Anything with an eyebrow: films, campaign videos. */
type CardVideo = Clip & { category: string }

type FilmCardProps<T extends CardVideo> = {
  film: T
  /** Appended to the eyebrow, e.g. "2022 · WorldFish Bangladesh". */
  meta?: string
  /** Roles. Hover: crossfades in for the title; touch: small line under it. */
  credit?: string
  onPlay: (film: T, opener: HTMLElement) => void
}

// Hover swap is a pure crossfade: the credit overlay is absolute, so layout never moves. Keyboard focus too.
const FADE = 'transition-opacity duration-300 ease-out-quart'
// From md only: below it the caption sits under the still, with nothing to swap with.
const OUT = 'md:group-hover:opacity-0 md:can-hover:group-has-focus-visible:opacity-0'
const IN = 'opacity-0 group-hover:opacity-100 can-hover:group-has-focus-visible:opacity-100'

/**
 * Stretched-link card: the title link covers the tile, so the heading stays navigable.
 * Plain left click opens the modal; modified clicks and no-JS fall through to the video's page.
 */
export function FilmCard<T extends CardVideo>({ film, meta, credit, onPlay }: FilmCardProps<T>) {
  const href = clipWatchUrl(film)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return

    event.preventDefault()
    onPlay(film, event.currentTarget)
  }

  return (
    // Raised while hovered, so the scaled tile sits over its neighbours. Container: titles size to the card.
    <div className="group @container relative hover:z-10">
      <HoverFrame>
        {/* Below md the caption sits under the still, on the section's own tone; from md it overlays the scrim. */}
        <article className="relative flex flex-col outline-offset-3 outline-accent has-focus-visible:outline-2 md:isolate md:aspect-[2.39/1] md:justify-end md:overflow-hidden md:bg-surface">
          {/* Still box below md; from md `contents`, so its layers position against the <article>. Dark tokens: overlays sit on the scrim. */}
          <div className="relative isolate aspect-[2.39/1] overflow-hidden bg-surface tone-dark md:contents">
            <img
              src={film.thumbnail}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              style={film.objectPosition ? { objectPosition: film.objectPosition } : undefined}
              className="absolute inset-0 -z-10 size-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/35 to-black/5 transition-opacity duration-700 group-hover:opacity-90"
            />

            {film.durationSeconds ? (
              <time
                dateTime={isoDuration(film.durationSeconds)}
                className="pointer-events-none absolute top-3 right-3 bg-black/55 px-1.5 py-0.5 text-xs text-fg/85 tabular-nums"
              >
                {formatDuration(film.durationSeconds)}
              </time>
            ) : null}

            <PlayButton className="absolute right-3 bottom-3 grid md:hidden" />

            {/* Hover overlay, bottom-anchored at its own height; right padding clears the play button (size-10 + gap-4). */}
            {credit ? (
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-x-0 bottom-0 hidden p-5 pr-19 md:can-hover:block',
                  FADE,
                  IN,
                )}
              >
                <p className="line-clamp-2 meta text-fg/75">
                  {film.category}
                  {meta ? ` · ${meta}` : null}
                </p>
                {/* Same serif and size as the title, so the swap doesn't read as a shrink. */}
                <p className="mt-1.5 line-clamp-2 display text-card-title text-fg">{credit}</p>
              </div>
            ) : null}
          </div>

          {/* In flow, not positioned: the link's ::after must resolve to the <article> to cover the tile. */}
          <div className="flex items-end justify-between gap-4 pt-3 md:p-5 md:tone-dark">
            <div className={cn('min-w-0', credit && [FADE, OUT])}>
              {/* Wraps rather than truncates, so a long role is never cut; hover devices keep one line when meta moves to the overlay. */}
              <p
                className={cn('line-clamp-2 meta text-fg/75', meta && 'md:can-hover:line-clamp-1')}
              >
                {film.category}
                {/* Hover devices read it from the overlay; kept for screen readers. */}
                {meta ? <span className="md:can-hover:sr-only"> · {meta}</span> : null}
              </p>

              <h3 className="mt-1.5 display text-card-title text-fg">
                <a
                  href={href}
                  onClick={handleClick}
                  className="outline-none after:absolute after:inset-0 after:content-['']"
                  {...externalLinkProps(href)}
                >
                  <span className="sr-only">Play </span>
                  {/* Desktop shows up to three lines; elsewhere two, as the meta and credit lines show there. */}
                  <span className="line-clamp-2 md:can-hover:line-clamp-3">{film.title}</span>
                </a>
              </h3>

              {credit ? (
                <p className="mt-1 line-clamp-2 text-xs text-fg/85 md:can-hover:sr-only">
                  {credit}
                </p>
              ) : null}
            </div>

            <PlayButton className="hidden md:grid" />
          </div>
        </article>
      </HoverFrame>
    </div>
  )
}

function PlayButton({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none size-10 shrink-0 place-items-center rounded-full border border-fg/50 bg-black/30 text-fg backdrop-blur-sm transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-bg',
        className,
      )}
    >
      <Play className="size-3.5 translate-x-px fill-current" />
    </span>
  )
}
