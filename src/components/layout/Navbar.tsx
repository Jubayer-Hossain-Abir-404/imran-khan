import { Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ANCHORS, hash } from '@/lib/links'
import { cn } from '@/lib/utils'

export type NavItem = {
  label: string
  /** Target element id; the first item's element must start at the page top. */
  id: string
}

type NavbarProps = {
  name: string
  items: NavItem[]
}

// Past this scroll offset the bar goes solid.
const SOLID_AFTER = 24
// A section is active once its top crosses this fraction of the viewport.
const SPY_LINE = 0.4

/** Last item whose element has crossed the spy line; the last item at page bottom. */
function activeId(items: NavItem[]) {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

  if (atBottom) return items.at(-1)?.id

  const line = window.innerHeight * SPY_LINE
  let current = items[0]?.id

  for (const item of items) {
    const el = document.getElementById(item.id)

    if (el && el.getBoundingClientRect().top <= line) current = item.id
  }

  return current
}

export function Navbar({ name, items }: NavbarProps) {
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState<string | undefined>(items[0]?.id)
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // One accent line that slides to the active link; `null` until measured.
  const [indicator, setIndicator] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current

    if (!list) return

    const measure = () => {
      const link = active ? list.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null

      setIndicator(link ? { left: link.offsetLeft + 12, width: link.offsetWidth - 24 } : null)
    }

    measure()
    // Fonts swapping in shift the link widths.
    void document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [active])

  // One rAF-throttled passive listener drives both the solid state and the scroll spy.
  useEffect(() => {
    let frame = 0

    const sync = () => {
      frame = 0
      setSolid(window.scrollY > SOLID_AFTER)
      setActive(activeId(items))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  // Mobile menu closes on Escape or an outside click.
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const links = (variant: 'bar' | 'menu') =>
    items.map((item) => {
      const current = item.id === active
      // In the bar, Contact is the outlined CTA at the end (no underline).
      const cta = variant === 'bar' && item.id === ANCHORS.contact

      return (
        <li key={item.id}>
          <a
            href={hash(item.id)}
            aria-current={current ? 'location' : undefined}
            data-nav={variant === 'bar' && !cta ? item.id : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              'relative block text-sm transition-colors hover:text-fg',
              current || cta ? 'text-fg' : 'text-muted',
              variant === 'menu' && 'flex items-center gap-3 py-3',
              variant === 'bar' && !cta && 'px-3 py-2',
              cta && 'ml-4 border border-fg/30 px-4 py-2 hover:border-fg',
            )}
          >
            {variant === 'menu' ? (
              <span
                aria-hidden
                className={cn('size-1 rounded-full bg-accent', !current && 'opacity-0')}
              />
            ) : null}
            {item.label}
          </a>
        </li>
      )
    })

  return (
    <header
      ref={headerRef}
      data-print="hide"
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-cinema',
        solid || open
          ? 'border-rule bg-bg/80 backdrop-blur-md backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      {/* Condenses once solid. Signature left; links + Contact CTA right. */}
      <div
        className={cn(
          'mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-gutter transition-[height] duration-500 ease-cinema',
          solid ? 'h-14' : 'h-nav',
        )}
      >
        <a
          href={hash(ANCHORS.top)}
          aria-label={`${name}, back to top`}
          className="justify-self-start pt-2.5 signature text-[2.375rem] whitespace-nowrap transition-colors duration-300 hover:text-accent"
        >
          {name}
        </a>

        <div className="flex items-center gap-2 justify-self-end">
          <nav aria-label="Primary" className="hidden md:block">
            <ul ref={listRef} className="relative flex items-center">
              {links('bar')}
              <li
                aria-hidden
                className={cn(
                  'pointer-events-none absolute bottom-0.5 h-px bg-accent transition-[left,width,opacity] duration-500 ease-cinema',
                  !indicator && 'opacity-0',
                )}
                style={indicator ?? undefined}
              />
            </ul>
          </nav>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className="-mr-2 flex size-10 items-center justify-center text-fg md:hidden"
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Primary"
        hidden={!open}
        className="border-t border-rule px-gutter pb-4 md:hidden"
      >
        <ul className="divide-y divide-rule">{links('menu')}</ul>
      </nav>
    </header>
  )
}
