import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  items: NavItem[]
  social: Social[]
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

export function Navbar({ name, items, social }: NavbarProps) {
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState<string | undefined>(items[0]?.id)
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

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
            onClick={() => setOpen(false)}
            className={cn(
              'relative block text-sm transition-colors hover:text-fg',
              current ? 'text-fg' : 'text-muted',
              variant === 'bar'
                ? 'px-3 py-2 after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-cinema'
                : 'py-3',
              variant === 'bar' && (current ? 'after:scale-x-100' : 'after:scale-x-0'),
            )}
          >
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
          ? 'border-rule bg-bg/85 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-nav max-w-7xl items-center justify-between gap-6 px-gutter">
        <a
          href={hash(ANCHORS.top)}
          className="display text-2xl leading-none whitespace-nowrap transition-colors hover:text-accent"
        >
          {name}
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center">{links('bar')}</ul>
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks social={social} label="Social" className="-mr-2 hidden lg:flex" />

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
