import { useEffect, useRef, useState } from 'react'

// Timings from navigation start. The head script's safety timeout (LOADER_SAFETY_MS) outlasts these.
const MIN_MS = 400
const CAP_MS = 700
const EXIT_MS = 550
const STORAGE_KEY = 'ik-intro'
const LOADER_SAFETY_MS = 1800

/**
 * Runs before first paint. Sets `<html data-loading>` unless reduced motion or already shown this
 * session; removes it after LOADER_SAFETY_MS even if hydration never happens. No JS → no loader.
 */
export const LOADER_SCRIPT = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('${STORAGE_KEY}'))return;sessionStorage.setItem('${STORAGE_KEY}','1');d.setAttribute('data-loading','');setTimeout(function(){d.removeAttribute('data-loading')},${LOADER_SAFETY_MS})}catch(e){}})()`

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)))
}

/** Fonts + hero poster decoded, or CAP_MS — whichever comes first — and never before MIN_MS. */
async function ready() {
  const poster = document.querySelector<HTMLImageElement>('img[data-hero-poster]')
  const assets = Promise.all([document.fonts.ready, poster?.decode().catch(() => undefined)]).then(
    () => undefined,
  )

  await Promise.race([assets, wait(CAP_MS - performance.now())])
  await wait(MIN_MS - performance.now())
}

type Phase = 'loading' | 'exit' | 'done'

/** Split-panel intro. Markup is prerendered so it covers the page before hydration. */
export function Loader({ name }: { name: string }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = document.documentElement

    // Not shown this visit: the `loader` utility already hides it.
    if (!root.hasAttribute('data-loading')) return

    let frame = 0
    let shown = 0
    let target = 0
    let finished = false
    let cancelled = false

    // Direct DOM writes: no re-render per frame.
    const paint = () => {
      // Creep toward 90 while waiting; snap toward 100 once ready.
      target = finished ? 100 : Math.min(90, (performance.now() / CAP_MS) * 90)
      shown += (target - shown) * (finished ? 0.35 : 0.12)

      if (finished && target - shown < 0.5) shown = 100

      const value = Math.round(shown)

      if (counterRef.current) counterRef.current.textContent = String(value)
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown / 100})`

      if (value < 100) {
        frame = requestAnimationFrame(paint)
        return
      }

      // Hero entrance starts as the panels part (it is paused only while the value is '').
      root.setAttribute('data-loading', 'exit')
      setPhase('exit')
      setTimeout(() => {
        if (cancelled) return
        root.removeAttribute('data-loading')
        setPhase('done')
      }, EXIT_MS)
    }

    frame = requestAnimationFrame(paint)
    void ready().then(() => {
      finished = true
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [])

  if (phase === 'done') return null

  const exiting = phase === 'exit'
  const panel = 'absolute inset-x-0 h-1/2 bg-bg transition-transform ease-cinema'

  return (
    <div
      aria-hidden
      data-print="hide"
      className="fixed inset-0 z-50 loader items-center justify-center"
    >
      <div
        className={`${panel} top-0 ${exiting ? '-translate-y-full' : ''}`}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
      />
      <div
        className={`${panel} bottom-0 ${exiting ? 'translate-y-full' : ''}`}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
      />

      <div
        className={`relative flex w-[min(20rem,70vw)] flex-col items-center gap-5 transition-opacity duration-200 ${exiting ? 'opacity-0' : ''}`}
      >
        <span className="display text-3xl">{name}</span>
        <span className="relative h-px w-full overflow-hidden bg-rule">
          <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </span>
        <span className="meta text-muted tabular-nums">
          <span ref={counterRef}>0</span>
        </span>
      </div>
    </div>
  )
}
