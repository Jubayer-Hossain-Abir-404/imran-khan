import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMotionSafe } from '@/components/motion/useMotionSafe'
import { cn } from '@/lib/utils'
import type { HeroMedia } from '@/types'

// Below this width only `mobileMp4` plays; without it, the poster stays.
const DESKTOP_QUERY = '(min-width: 768px)'

type Sources = { webm?: string; mp4: string }

/**
 * Poster always; the looping preview mounts client-side, only when motion is OK and a source fits.
 * The pause control (WCAG 2.2.2) is a sibling of the media layer so it stacks above the overlays.
 */
export function HeroVideo({ media, className }: { media: HeroMedia; className?: string }) {
  const motionSafe = useMotionSafe()
  // `null` until mounted, so the prerendered HTML and hydration never include the video.
  const [desktop, setDesktop] = useState<boolean | null>(null)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
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

  const toggle = () => {
    const el = videoRef.current

    if (!el) return
    // Rejects when autoplay is blocked (iOS Low Power Mode); the poster stays.
    if (el.paused) el.play().catch(() => undefined)
    else el.pause()
  }

  return (
    <>
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
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            poster={poster.src}
            onPlaying={() => {
              setPlaying(true)
              setPaused(false)
            }}
            onPause={() => setPaused(true)}
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

      {sources && playing ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? 'Play background video' : 'Pause background video'}
          data-print="hide"
          className="absolute right-gutter bottom-5 z-10 grid size-9 place-items-center rounded-full border border-fg/30 text-fg/80 transition-colors hover:border-fg hover:text-fg"
        >
          {paused ? (
            <Play aria-hidden className="size-3.5 translate-x-px fill-current" />
          ) : (
            <Pause aria-hidden className="size-3.5 fill-current" />
          )}
        </button>
      ) : null}
    </>
  )
}
