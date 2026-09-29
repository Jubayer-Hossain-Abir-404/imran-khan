import { Play } from 'lucide-react'
import type { MouseEvent } from 'react'
import { externalLinkProps, isPlainClick } from '@/lib/links'
import { cn } from '@/lib/utils'
import { formatDuration, isoDuration, watchUrl } from '@/lib/youtube'
import type { Video } from '@/types'
import { HoverFrame } from './HoverFrame'

/** Anything with an eyebrow: films, writing videos. */
type CardVideo = Video & { category: string }

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
const OUT = 'group-hover:opacity-0 can-hover:group-has-focus-visible:opacity-0'
const IN = 'opacity-0 group-hover:opacity-100 can-hover:group-has-focus-visible:opacity-100'

/**
 * Stretched-link card: the title link covers the tile, so the heading stays navigable.
 * Plain left click opens the modal; modified clicks and no-JS fall through to YouTube.
 */
export function FilmCard<T extends CardVideo>({ film, meta, credit, onPlay }: FilmCardProps<T>) {
  const href = watchUrl(film.youtubeId)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return

    event.preventDefault()
    onPlay(film, event.currentTarget)
  }

  return (
    // Raised while hovered, so the scaled tile sits over its neighbours.
    <div className="group relative hover:z-10">
      <HoverFrame>
        <article className="relative isolate flex aspect-[2.39/1] flex-col justify-end overflow-hidden bg-surface outline-offset-3 outline-accent has-focus-visible:outline-2">
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

          {/* In flow, not positioned: the link's ::after must resolve to the <article> to cover the tile. */}
          <div className="flex items-end justify-between gap-4 p-4 md:p-5">
            <div className={cn('min-w-0', credit && [FADE, OUT])}>
              {/* Touch: wraps rather than truncates, so the client is never cut. */}
              <p
                className={cn(
                  'meta text-fg/75',
                  meta ? 'line-clamp-2 can-hover:line-clamp-1' : 'truncate',
                )}
              >
                {film.category}
                {/* Hover devices read it from the overlay; kept for screen readers. */}
                {meta ? <span className="can-hover:sr-only"> · {meta}</span> : null}
              </p>

              <h3 className="mt-1.5 display text-xl leading-tight text-fg md:text-2xl">
                <a
                  href={href}
                  onClick={handleClick}
                  className="outline-none after:absolute after:inset-0 after:content-['']"
                  {...externalLinkProps(href)}
                >
                  <span className="sr-only">Play </span>
                  <span className="line-clamp-2">{film.title}</span>
                </a>
              </h3>

              {credit ? (
                <p className="mt-1 line-clamp-2 text-xs text-fg/85 can-hover:sr-only">{credit}</p>
              ) : null}
            </div>

            <span
              aria-hidden
              className="pointer-events-none grid size-10 shrink-0 place-items-center rounded-full border border-fg/50 bg-black/30 text-fg backdrop-blur-sm transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-bg"
            >
              <Play className="size-3.5 translate-x-px fill-current" />
            </span>
          </div>

          {/* Hover overlay, bottom-anchored at its own height; right padding clears the play button (size-10 + gap-4). */}
          {credit ? (
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 hidden p-4 pr-18 md:p-5 md:pr-19 can-hover:block',
                FADE,
                IN,
              )}
            >
              <p className="line-clamp-2 meta text-fg/75">
                {film.category}
                {meta ? ` · ${meta}` : null}
              </p>
              {/* Same serif and size as the title, so the swap doesn't read as a shrink. */}
              <p className="mt-1.5 line-clamp-2 display text-xl leading-tight text-fg md:text-2xl">
                {credit}
              </p>
            </div>
          ) : null}
        </article>
      </HoverFrame>
    </div>
  )
}
