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
import type { Video } from '@/types'

/** A Film fits as is; other videos pass an eyebrow as `category` and omit the rest. */
export type PlayableVideo = Video & {
  category?: string
  playlistId?: string
  year?: string
  client?: string
  credits?: string
}

type VideoModalProps = {
  video: PlayableVideo | null
  onClose: () => void
  /** Focus returns here; Safari doesn't focus links on click, so "previously focused" is unreliable. */
  opener: RefObject<HTMLElement | null>
}

const LINK =
  'inline-flex items-center gap-1.5 text-sm text-fg/80 underline decoration-fg/25 underline-offset-4 transition-colors hover:text-fg hover:decoration-accent'

/** The iframe exists only while open; closing unmounts it, which stops playback. */
export function VideoModal({ video, onClose, opener }: VideoModalProps) {
  // Keep the last video through the exit animation.
  const [current, setCurrent] = useState(video)

  if (video && video !== current) setCurrent(video)

  const eyebrow = current
    ? [current.category, current.year, current.client].filter(Boolean).join(' · ')
    : ''

  return (
    <Dialog open={video !== null} onOpenChange={(open) => !open && onClose()}>
      {current ? (
        <DialogContent
          showCloseButton={false}
          finalFocus={opener}
          overlayClassName="bg-black/85"
          className="w-[min(calc(100vw-2rem),calc((100svh-11rem)*16/9),72rem)] max-w-none gap-4 rounded-none bg-transparent p-0 text-fg ring-0 sm:max-w-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? <p className="meta text-muted">{eyebrow}</p> : null}
              <DialogTitle className="mt-1.5 display text-h3 leading-tight">
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

          {/* Wraps by modal width, not viewport: on landscape phones the modal is height-bound. */}
          {/* No YouTube title here: the header and the player already show it. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {current.credits ? (
              <DialogDescription className="min-w-0 flex-[1_1_16rem] text-sm text-fg/80">
                {current.credits}
              </DialogDescription>
            ) : (
              <span aria-hidden className="flex-[1_1_16rem]" />
            )}
            <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
              {current.playlistId ? (
                <a
                  href={playlistUrl(current.playlistId)}
                  className={LINK}
                  {...externalLinkProps(playlistUrl(current.playlistId))}
                >
                  {current.category ? `${current.category} playlist` : 'Playlist'}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              ) : null}
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
