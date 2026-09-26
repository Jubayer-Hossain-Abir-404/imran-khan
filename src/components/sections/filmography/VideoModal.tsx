import { ArrowUpRight, XIcon } from 'lucide-react'
import { useState, type RefObject } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { externalLinkProps } from '@/lib/links'
import { embedUrl, playlistUrl, watchUrl } from '@/lib/youtube'
import type { Film } from '@/types'

type VideoModalProps = {
  film: Film | null
  onClose: () => void
  /** Focus returns here; Safari doesn't focus links on click, so "previously focused" is unreliable. */
  opener: RefObject<HTMLElement | null>
}

const LINK =
  'inline-flex items-center gap-1.5 text-sm text-fg/80 underline decoration-fg/25 underline-offset-4 transition-colors hover:text-fg hover:decoration-accent'

/** The iframe exists only while open; closing unmounts it, which stops playback. */
export function VideoModal({ film, onClose, opener }: VideoModalProps) {
  // Keep the last film through the exit animation.
  const [current, setCurrent] = useState(film)

  if (film && film !== current) setCurrent(film)

  return (
    <Dialog open={film !== null} onOpenChange={(open) => !open && onClose()}>
      {current ? (
        <DialogContent
          showCloseButton={false}
          finalFocus={opener}
          overlayClassName="bg-black/85"
          className="w-[min(calc(100vw-2rem),calc((100svh-11rem)*16/9),72rem)] max-w-none gap-4 rounded-none bg-transparent p-0 text-fg ring-0 sm:max-w-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="meta text-muted">{current.category}</p>
              <DialogTitle className="mt-1.5 display text-h3 leading-tight font-medium">
                {current.title}
              </DialogTitle>
            </div>
            <DialogClose
              aria-label="Close video"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-fg/30 text-fg/80 transition-colors hover:border-fg hover:text-fg"
            >
              <XIcon aria-hidden className="size-4" />
            </DialogClose>
          </div>

          <div className="aspect-video w-full bg-black">
            <iframe
              src={embedUrl(current.youtubeId)}
              title={current.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              // Cross-origin, so scripts + same-origin is safe; popups for the player's YouTube link.
              // oxlint-disable-next-line react/iframe-missing-sandbox
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
              // YouTube rejects embeds without a referrer (error 153).
              referrerPolicy="strict-origin-when-cross-origin"
              className="size-full"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DialogDescription className="truncate text-xs text-muted">
              {current.youtubeTitle}
            </DialogDescription>
            <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
              <a
                href={playlistUrl(current.playlistId)}
                className={LINK}
                {...externalLinkProps(playlistUrl(current.playlistId))}
              >
                {current.category} playlist
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
              <a
                href={watchUrl(current.youtubeId)}
                className={LINK}
                {...externalLinkProps(watchUrl(current.youtubeId))}
              >
                Watch on YouTube
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
