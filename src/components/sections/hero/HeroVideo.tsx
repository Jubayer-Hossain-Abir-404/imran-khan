import { useEffect, useState } from 'react'
import { useMotionSafe } from '@/components/motion/useMotionSafe'
import { cn } from '@/lib/utils'
import type { HeroMedia } from '@/types'

// Below 768px only `mobileMp4` plays; without it, the poster stays.
const QUERIES = {
  desktop: '(min-width: 768px)',
  large: '(min-width: 1600px), (min-width: 1280px) and (min-resolution: 2dppx)',
}

type Tier = 'mobile' | 'desktop' | 'large'
type Sources = { webm?: string; mp4: string }

function currentTier(): Tier {
  if (window.matchMedia(QUERIES.large).matches) return 'large'

  return window.matchMedia(QUERIES.desktop).matches ? 'desktop' : 'mobile'
}

/** Poster always; the looping preview mounts client-side, only when motion is OK and a source fits. */
export function HeroVideo({ media, className }: { media: HeroMedia; className?: string }) {
  const motionSafe = useMotionSafe()
  // `null` until mounted, so the prerendered HTML and hydration never include the video.
  const [tier, setTier] = useState<Tier | null>(null)
  const [playing, setPlaying] = useState(false)
  const { poster, posterMobile, video } = media

  useEffect(() => {
    const queries = Object.values(QUERIES).map((query) => window.matchMedia(query))
    const sync = () => setTier(currentTier())

    sync()
    queries.forEach((query) => query.addEventListener('change', sync))

    return () => queries.forEach((query) => query.removeEventListener('change', sync))
  }, [])

  const sources: Sources | null =
    !video || !motionSafe || tier === null
      ? null
      : tier === 'large'
        ? (video.large ?? video)
        : tier === 'desktop'
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
          {sources.webm ? <source src={sources.webm} type='video/webm; codecs="vp9"' /> : null}
          <source src={sources.mp4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  )
}
