import { Play } from 'lucide-react'
import type { MouseEvent } from 'react'
import { externalLinkProps } from '@/lib/links'
import { formatDuration, isoDuration, watchUrl } from '@/lib/youtube'
import type { Film } from '@/types'

type FilmCardProps = {
  film: Film
  onPlay: (film: Film, opener: HTMLElement) => void
}

/** Plain left-click opens the modal; modified clicks and no-JS fall through to YouTube. */
function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** Stretched-link card: the title link covers the tile, so the heading stays navigable. */
export function FilmCard({ film, onPlay }: FilmCardProps) {
  const href = watchUrl(film.youtubeId)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return

    event.preventDefault()
    onPlay(film, event.currentTarget)
  }

  return (
    <article className="group relative isolate flex aspect-[2.39/1] flex-col justify-end overflow-hidden bg-surface outline-offset-3 outline-accent has-focus-visible:outline-2">
      <img
        src={film.thumbnail}
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        style={film.objectPosition ? { objectPosition: film.objectPosition } : undefined}
        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-cinema motion-safe:group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/35 to-black/5 transition-opacity duration-500 group-hover:opacity-90"
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
        <div className="min-w-0">
          <p className="truncate meta text-fg/75">{film.category}</p>

          <h3 className="mt-1.5 line-clamp-2 display text-xl leading-tight text-fg md:text-2xl">
            <a
              href={href}
              onClick={handleClick}
              className="outline-none after:absolute after:inset-0 after:content-['']"
              {...externalLinkProps(href)}
            >
              <span className="sr-only">Play </span>
              {film.title}
            </a>
          </h3>
        </div>

        <span
          aria-hidden
          className="pointer-events-none grid size-10 shrink-0 place-items-center rounded-full border border-fg/50 bg-black/30 text-fg backdrop-blur-sm transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg"
        >
          <Play className="size-3.5 translate-x-px fill-current" />
        </span>
      </div>
    </article>
  )
}
