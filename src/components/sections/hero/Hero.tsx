import { ArrowRight, Play } from 'lucide-react'
import { Fragment, type CSSProperties } from 'react'
import { RollLink } from '@/components/motion/RollLink'
import { hash, SECTION_IDS } from '@/lib/links'
import type { Profile } from '@/types'
import { HeroVideo } from './HeroVideo'

const HEADING_ID = 'hero-heading'

/** Stagger for the CSS `rise` entrance, which waits for the loader. */
function rise(delay: number) {
  return { '--rise-delay': `${delay}ms` } as CSSProperties
}

export function Hero({ profile }: { profile: Profile }) {
  const { name, roles, eyebrow, hero } = profile

  return (
    // Full height on landscape screens; portrait ones are capped by width (phones ≈7:8, tablets 4:3),
    // so the next section shows and tall screens get no empty band.
    <section
      aria-labelledby={HEADING_ID}
      className="relative isolate flex min-h-[min(100svh,max(26rem,115vw))] items-end overflow-hidden sm:min-h-[min(100svh,max(28rem,75vw))]"
    >
      <HeroVideo media={hero} className="absolute inset-0 -z-20" />

      {/* Readability: dark from the left for the text, fade into the page at the bottom. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-bg/90 via-bg/45 to-bg/10"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-t from-bg to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-bg/70 to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-gutter pt-nav pb-12 sm:pb-[clamp(3rem,min(10vh,8vw),8rem)]">
        <p className="rise meta text-fg/80" style={rise(0)}>
          {eyebrow}
        </p>

        <h1
          id={HEADING_ID}
          className="mt-4 rise name text-hero-name text-balance lowercase sm:mt-5"
          style={rise(90)}
        >
          {/* Lowercase by CSS only: the DOM, SEO and screen readers keep "Imran Khan". */}
          {name}
        </h1>

        {/* One line from sm (size fits the container); below, wraps only after a separator. */}
        <p
          className="mt-4 rise font-roles text-hero-roles font-semibold tracking-[0.02em] text-fg/90 sm:mt-5 sm:whitespace-nowrap"
          style={rise(180)}
        >
          {roles.map((role, index) => (
            <Fragment key={role}>
              {index > 0 ? (
                <>
                  {/* Right margin is smaller: the wrap-point space after the dot makes up the rest. */}
                  <span aria-hidden className="mr-[0.05em] ml-[0.3em] text-accent">
                    ·
                  </span>{' '}
                </>
              ) : null}
              <span className="whitespace-nowrap">{role}</span>
            </Fragment>
          ))}
        </p>

        {/* Mobile: equal-width pair (stacks if under 2 × 10rem). From sm: reel on the right edge. */}
        <div
          className="mt-8 grid rise grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-between"
          style={rise(270)}
        >
          <RollLink href={hash(SECTION_IDS.work)}>
            View Work
            <ArrowRight aria-hidden className="size-4" />
          </RollLink>
          {hero.fullReel ? (
            <RollLink
              href={hero.fullReel}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              data-print="hide"
            >
              <Play aria-hidden className="size-3.5 fill-current" />
              View Full Reel
            </RollLink>
          ) : null}
        </div>
      </div>
    </section>
  )
}
