import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// Timings from navigation start.
const TIMING = {
  minMs: 700,
  capMs: 1100,
  // Content leaves first, then the panels part.
  contentOutMs: 300,
  panelDelayMs: 150,
  panelMs: 600,
  // Clears the attribute even if something throws mid-run.
  safetyMs: 3000,
  storageKey: 'ik-intro',
}

type Timing = typeof TIMING

/**
 * The whole intro, inlined in <head> via `toString()` — so it must stay self-contained (no imports,
 * no async/await or spread helpers). Runs from first paint, before hydration.
 * Reduced motion or already shown this session → no loader (head cleanup still runs).
 */
function intro(t: Timing) {
  try {
    const root = document.documentElement

    // Hosts (Netlify) inject comments + whitespace into <head>; React's hydration rejects them.
    for (const node of Array.from(document.head.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) node.remove()
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (sessionStorage.getItem(t.storageKey)) return

    sessionStorage.setItem(t.storageKey, '1')
    root.setAttribute('data-loading', '')

    const end = () => root.removeAttribute('data-loading')
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)))

    setTimeout(end, t.safetyMs)

    // Fonts + hero poster decoded, or capMs — whichever first — and never before minMs.
    const ready = () => {
      const poster = document.querySelector<HTMLImageElement>('img[data-hero-poster]')
      const assets = Promise.all([
        document.fonts.ready,
        poster ? poster.decode().catch(() => undefined) : undefined,
      ])

      Promise.race([assets, wait(t.capMs - performance.now())])
        .then(() => wait(t.minMs - performance.now()))
        .then(() => {
          // CSS runs the exit off this value; hero `rise` starts as the panels part.
          root.setAttribute('data-loading', 'exit')
          setTimeout(end, t.panelDelayMs + t.panelMs)
        })
    }

    // 'interactive' = parsed (poster exists), before module scripts run.
    if (document.readyState === 'loading') {
      document.addEventListener('readystatechange', ready, { once: true })
    } else ready()
  } catch {
    document.documentElement.removeAttribute('data-loading')
  }
}

export const LOADER_SCRIPT = `(${intro.toString()})(${JSON.stringify(TIMING)})`

const PANEL = 'absolute inset-x-0 h-1/2 bg-bg transition-transform ease-cinema'
const panelTiming = {
  transitionDuration: `${TIMING.panelMs}ms`,
  transitionDelay: `${TIMING.panelDelayMs}ms`,
} satisfies CSSProperties
const contentTiming = { transitionDuration: `${TIMING.contentOutMs}ms` } satisfies CSSProperties

/**
 * Split-panel intro: name rises out of a mask while a hairline draws under it. Pure CSS; the head
 * script only flips `data-loading`. The `loader` utility hides it whenever the attribute is absent.
 */
export function Loader({ name, roles }: { name: string; roles: string[] }) {
  return (
    <div
      aria-hidden
      data-print="hide"
      className="fixed inset-0 z-50 loader items-center justify-center"
    >
      <div className={cn(PANEL, 'top-0 loader-exit:-translate-y-full')} style={panelTiming} />
      <div className={cn(PANEL, 'bottom-0 loader-exit:translate-y-full')} style={panelTiming} />

      <div
        className="relative flex flex-col items-center px-gutter text-center transition-[opacity,transform] ease-cinema loader-exit:-translate-y-2 loader-exit:opacity-0"
        style={contentTiming}
      >
        <div className="overflow-hidden pb-1">
          <p className="animate-[ik-mask-up_600ms_var(--ease-cinema)_both] display text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] leading-none">
            {name}
          </p>
        </div>

        <span
          className="mt-6 h-px w-[min(18rem,60vw)] animate-[ik-draw_var(--draw-ms)_var(--ease-cinema)_both] bg-accent"
          style={{ '--draw-ms': `${TIMING.minMs + 200}ms` } as CSSProperties}
        />

        <span className="mt-5 animate-[ik-fade_600ms_ease-out_200ms_both] meta text-balance text-muted">
          {roles.join(' · ')}
        </span>
      </div>
    </div>
  )
}
