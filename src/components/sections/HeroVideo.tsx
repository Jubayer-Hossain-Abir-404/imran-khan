import { useEffect, useState } from 'react'
import { useMotionSafe } from '@/components/motion/useMotionSafe'
import { cn } from '@/lib/utils'
import type { HeroMedia } from '@/types'

// Below this width only `mobileMp4` plays; without it, the poster stays.
const DESKTOP_QUERY = '(min-width: 768px)'

type Sources = { webm?: string; mp4: string }

/** Poster always; the looping preview mounts client-side, only when motion is OK and a source fits. */
export function HeroVideo({ media, className }: { media: HeroMedia; className?: string }) {
  const motionSafe = useMotionSafe()
  // `null` until mounted, so the prerendered HTML and hydration never include the video.
  const [desktop, setDesktop] = useState<boolean | null>(null)
  const [playing, setPlaying] = useState(false)
  const { poster, posterMobile, video } = media

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setDesktop(query.matches)

    sync()
    query.addEventListener('change', sync)

    return () => query.removeEventListener('change', sync)
  }, [])

  const sources: Sources | null =
    !video || !motionSafe || desktop === null
      ? null
      : desktop
        ? video
        : video.mobileMp4
          ? { mp4: video.mobileMp4 }
          : null

  return (
    <div className={cn('overflow-hidden', className)}>
      <picture>
        {posterMobile ? (
          <source
            media="(max-width: 767px)"
            srcSet={posterMobile.src}
            width={posterMobile.width}
            height={posterMobile.height}
          />
        ) : null}
        <img
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          fetchPriority="high"
          decoding="async"
          data-hero-poster
          className="size-full object-cover"
        />
      </picture>

      {sources ? (
        <video
          // Remount when the source set changes so the browser re-picks.
          key={sources.mp4}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          poster={poster.src}
          onPlaying={() => setPlaying(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-1000',
            playing ? 'opacity-100' : 'opacity-0',
          )}
        >
          {sources.webm ? <source src={sources.webm} type="video/webm" /> : null}
          <source src={sources.mp4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  )
}
