import { ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { RollLink } from '@/components/motion/RollLink'
import { ANCHORS, hash } from '@/lib/links'
import { cn } from '@/lib/utils'
import { Wordmark } from './Wordmark'

export type NavItem = {
  label: string
  /** Target element id; the first item's element must start at the page top. */
  id: string
}

type NavbarProps = {
  name: string
  items: NavItem[]
}

// Mobile menu row: press feedback (touch has no hover), dot + arrow light up on press or when current.
const MENU_LINK =
  '-mx-3 flex items-center gap-3 rounded-[0.5rem] px-3 py-3.5 text-base [-webkit-tap-highlight-color:transparent] active:bg-fg/5 active:text-fg'
const MENU_DOT =
  'size-1.5 rounded-full bg-accent transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-active:scale-100 group-active:opacity-100'
const MENU_ARROW =
  'size-4 -translate-x-2 text-accent opacity-0 transition duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-active:translate-x-0 group-active:opacity-100 group-aria-[current]:translate-x-0 group-aria-[current]:opacity-100'

const MENU_ROW =
  'translate-y-2 opacity-0 transition duration-500 ease-out-expo group-data-open/menu:translate-y-0 group-data-open/menu:opacity-100'

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
  // Hovered or focused bar link; the indicator previews it, then returns to `active`.
  const [hovered, setHovered] = useState<string | null>(null)
  // One accent line that slides to the active link; `null` until measured.
  const [indicator, setIndicator] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current

    if (!list) return

    const target = hovered ?? active

    const measure = () => {
      const link = target ? list.querySelector<HTMLElement>(`[data-nav="${target}"]`) : null

      setIndicator(link ? { left: link.offsetLeft + 12, width: link.offsetWidth - 24 } : null)
    }

    measure()
    // Fonts swapping in shift the link widths.
    void document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [active, hovered])

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
    items.map((item, index) => {
      const current = item.id === active
      // In the bar, Contact is the outlined CTA at the end (no underline).
      const bar = variant === 'bar'
      const cta = bar && item.id === ANCHORS.contact

      if (cta) {
        return (
          <li key={item.id}>
            <RollLink
              variant="outline"
              size="sm"
              href={hash(item.id)}
              aria-current={current ? 'location' : undefined}
              onClick={() => setOpen(false)}
              onPointerEnter={() => setHovered(null)}
              className="ml-4"
            >
              {item.label}
            </RollLink>
          </li>
        )
      }

      return (
        <li
          key={item.id}
          className={bar ? undefined : MENU_ROW}
          // Rows fade up in sequence on open; close is immediate.
          style={bar ? undefined : { transitionDelay: open ? `${100 + index * 50}ms` : '0ms' }}
        >
          <a
            href={hash(item.id)}
            aria-current={current ? 'location' : undefined}
            data-nav={variant === 'bar' ? item.id : undefined}
            onClick={() => setOpen(false)}
            // Mouse only: a tap on a touch laptop would leave the preview stuck.
            onPointerEnter={
              bar ? (e) => e.pointerType === 'mouse' && setHovered(item.id) : undefined
            }
            onFocus={bar ? () => setHovered(item.id) : undefined}
            onBlur={bar ? () => setHovered(null) : undefined}
            className={cn(
              'group relative block text-sm transition-colors hover:text-fg focus-visible:text-fg',
              current ? 'text-fg' : 'text-muted',
              bar ? 'px-3 py-2' : MENU_LINK,
            )}
          >
            {bar ? (
              <RollLabel label={item.label} />
            ) : (
              <>
                <span aria-hidden className={cn(MENU_DOT, !current && 'scale-0 opacity-0')} />
                <span className="flex-1 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 group-active:translate-x-1.5">
                  {item.label}
                </span>
                <ArrowRight aria-hidden className={MENU_ARROW} />
              </>
            )}
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
        // Open menu sits over content: opaque, so nothing bleeds through the links.
        open
          ? 'border-rule bg-bg'
          : solid
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
          className="group justify-self-start py-2 text-xl transition-colors hover:text-accent md:text-[1.375rem]"
        >
          <Wordmark name={name} />
        </a>

        <div className="flex items-center gap-2 justify-self-end">
          <nav aria-label="Primary" className="hidden md:block">
            <ul
              ref={listRef}
              onPointerLeave={() => setHovered(null)}
              className="relative flex items-center"
            >
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
            className="-mr-2 flex size-10 items-center justify-center text-fg transition-transform [-webkit-tap-highlight-color:transparent] active:scale-90 md:hidden"
          >
            {/* Two bars that cross into an X. */}
            <span aria-hidden className="relative block h-[11px] w-5">
              <span
                className={cn(
                  'absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-out-expo',
                  open && 'translate-y-[5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-out-expo',
                  open && '-translate-y-[5px] -rotate-45',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Height animates via grid rows. Closed = inert, not hidden, so it can animate. */}
      <nav
        id="mobile-menu"
        aria-label="Primary"
        inert={!open}
        data-open={open ? '' : undefined}
        className="group/menu grid grid-rows-[0fr] border-t border-transparent transition-[grid-template-rows,border-color] duration-500 ease-cinema md:hidden data-open:grid-rows-[1fr] data-open:border-rule"
      >
        <div className="overflow-hidden">
          <ul className="divide-y divide-rule px-gutter pb-4">{links('menu')}</ul>
        </div>
      </nav>
    </header>
  )
}

/** Label exits upward while a copy rises from below, on hover or focus of a `group`. */
function RollLabel({ label }: { label: string }) {
  const line = 'block transition-transform duration-500 ease-out-expo'

  return (
    <span className="relative block overflow-hidden">
      <span
        className={cn(line, 'group-hover:-translate-y-full group-focus-visible:-translate-y-full')}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          line,
          'absolute inset-0 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0',
        )}
      >
        {label}
      </span>
    </span>
  )
}
