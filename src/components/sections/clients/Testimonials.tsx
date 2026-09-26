import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types'

// Horizontal drag (px) that counts as a swipe.
const SWIPE = 40

const CONTROL =
  'grid size-9 place-items-center text-muted transition-colors hover:text-fg disabled:opacity-40'

function byline({ name, role, organization }: Testimonial) {
  return [name, role, organization].filter(Boolean).join(', ')
}

/** Manual carousel (no autoplay, so no pause control needed). One quote → no controls. */
export function Testimonials({ items, headingId }: { items: Testimonial[]; headingId: string }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const many = items.length > 1

  const go = (step: number) => setIndex((current) => (current + step + items.length) % items.length)

  const onPointerDown = (event: PointerEvent) => {
    startX.current = event.clientX
  }

  const onPointerUp = (event: PointerEvent) => {
    if (startX.current === null) return

    const dx = event.clientX - startX.current

    startX.current = null
    if (Math.abs(dx) > SWIPE) go(dx < 0 ? 1 : -1)
  }

  return (
    <div
      role={many ? 'region' : undefined}
      aria-roledescription={many ? 'carousel' : undefined}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="text-sm font-medium">
        What they say
      </h3>

      {/* Sliding track; flex rows stretch, so the box keeps the tallest quote's height. */}
      <div
        aria-live={many ? 'polite' : undefined}
        onPointerDown={many ? onPointerDown : undefined}
        onPointerUp={many ? onPointerUp : undefined}
        className="mt-5 touch-pan-y overflow-hidden"
      >
        <div
          className="flex transition-transform duration-700 ease-cinema"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <figure
              key={item.quote}
              role={many ? 'group' : undefined}
              aria-roledescription={many ? 'slide' : undefined}
              aria-label={many ? `${i + 1} of ${items.length}` : undefined}
              inert={i !== index}
              className={cn(
                'flex w-full shrink-0 gap-3.5 transition-opacity duration-700 ease-cinema',
                i !== index && 'opacity-30',
              )}
            >
              <Quote aria-hidden className="mt-1 size-4 shrink-0 fill-current text-accent" />
              <div>
                <blockquote className="display text-xl leading-snug text-pretty">
                  <p>“{item.quote}”</p>
                </blockquote>
                <figcaption className="mt-3 text-xs text-muted">— {byline(item)}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      {many ? (
        <div className="mt-6 -ml-2.5 flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => go(-1)}
            className={CONTROL}
          >
            <ArrowLeft aria-hidden className="size-4" />
          </button>

          <div className="flex items-center">
            {items.map((item, i) => (
              <button
                key={item.quote}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
                className="grid size-6 place-items-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full transition-colors',
                    i === index ? 'bg-fg' : 'bg-fg/25 hover:bg-fg/50',
                  )}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => go(1)}
            className={CONTROL}
          >
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
