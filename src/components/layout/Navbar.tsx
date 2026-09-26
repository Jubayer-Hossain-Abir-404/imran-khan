import { Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ANCHORS, hash } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Social } from '@/types'
import { SocialLinks } from './SocialLinks'

export type NavItem = {
  label: string
  /** Target element id; the first item's element must start at the page top. */
  id: string
}

type NavbarProps = {
  name: string
  /** Small line under the name, e.g. the first role. */
  tagline?: string
  items: NavItem[]
  social: Social[]
}

// Past this scroll offset the bar goes solid.
const SOLID_AFTER = 24
// A section is active once its top crosses this fraction of the viewport.
const SPY_LINE = 0.4

/** Initials for the monogram: "Imran Khan" → "IK". */
function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

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

export function Navbar({ name, tagline, items, social }: NavbarProps) {
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

      return (
        <li key={item.id}>
          <a
            href={hash(item.id)}
            aria-current={current ? 'location' : undefined}
            data-nav={variant === 'bar' ? item.id : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              'relative block text-sm transition-colors hover:text-fg',
              current ? 'text-fg' : 'text-muted',
              variant === 'bar' ? 'px-3 py-2' : 'flex items-center gap-3 py-3',
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
      {/* Condenses once solid. Three columns keep the links centred on the page, not between siblings. */}
      <div
        className={cn(
          'mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-gutter transition-[height] duration-500 ease-cinema md:grid-cols-[1fr_auto_1fr]',
          solid ? 'h-14' : 'h-nav',
        )}
      >
        <a
          href={hash(ANCHORS.top)}
          aria-label={`${name}, back to top`}
          className="group flex items-center gap-3 justify-self-start"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center border border-fg/35 font-serif text-[0.9375rem] font-semibold tracking-[0.06em] transition-colors duration-300 group-hover:border-accent group-hover:text-accent"
          >
            {initials(name)}
          </span>
          <span aria-hidden className="flex flex-col gap-1">
            <span className="display text-xl leading-none whitespace-nowrap">{name}</span>
            {tagline ? (
              <span className="text-[0.625rem] leading-none font-medium tracking-[0.28em] text-muted uppercase">
                {tagline}
              </span>
            ) : null}
          </span>
        </a>

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

        <div className="flex items-center gap-2 justify-self-end">
          {social.length > 0 ? (
            <div className="hidden items-center gap-3 lg:flex">
              <span aria-hidden className="h-5 w-px bg-rule" />
              <SocialLinks social={social} label="Social" className="-mr-2" />
            </div>
          ) : null}

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
        <SocialLinks social={social} label="Social" className="mt-2 -ml-2" />
      </nav>
    </header>
  )
}
