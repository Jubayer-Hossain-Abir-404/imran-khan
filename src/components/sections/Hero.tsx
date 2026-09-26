import { ArrowDown, ArrowRight, Play } from 'lucide-react'
import { Fragment, type CSSProperties } from 'react'
import { hash, externalLinkProps, SECTION_IDS } from '@/lib/links'
import { watchUrl } from '@/lib/youtube'
import type { Profile } from '@/types'
import { HeroVideo } from './HeroVideo'

const HEADING_ID = 'hero-heading'

/** Stagger for the CSS `rise` entrance, which waits for the loader. */
function rise(delay: number) {
  return { '--rise-delay': `${delay}ms` } as CSSProperties
}

export function Hero({ profile }: { profile: Profile }) {
  const { name, roles, eyebrow, hero, reel } = profile
  const reelHref = reel ? watchUrl(reel.youtubeId) : null

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative isolate flex min-h-[max(34rem,100svh)] items-end overflow-hidden"
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

      <div className="mx-auto w-full max-w-7xl px-gutter pt-nav pb-[clamp(4rem,12vh,8rem)]">
        <p className="rise meta text-fg/80" style={rise(0)}>
          {eyebrow}
        </p>

        <h1
          id={HEADING_ID}
          className="mt-5 rise display text-display text-balance"
          style={rise(90)}
        >
          {name}
        </h1>

        <p className="mt-5 rise text-lead text-fg/90" style={rise(180)}>
          {roles.map((role, index) => (
            <Fragment key={role}>
              {index > 0 ? (
                <span aria-hidden className="mx-3 text-accent">
                  ·
                </span>
              ) : null}
              <span className="whitespace-nowrap">{role}</span>
            </Fragment>
          ))}
        </p>

        <div className="mt-10 flex rise flex-wrap items-center gap-3" style={rise(270)}>
          {/* Phase 4 swaps this for the video modal. */}
          {reel && reelHref ? (
            <a
              href={reelHref}
              className="inline-flex h-11 items-center gap-2.5 bg-fg px-5 text-sm font-medium text-bg transition-colors hover:bg-fg/85"
              {...externalLinkProps(reelHref)}
            >
              <Play aria-hidden className="size-3.5 fill-current" />
              Watch Reel
              {reel.durationLabel ? (
                <span className="text-bg/60">({reel.durationLabel})</span>
              ) : null}
            </a>
          ) : null}

          <a
            href={hash(SECTION_IDS.work)}
            className="group inline-flex h-11 items-center gap-2.5 border border-fg/60 px-5 text-sm font-medium transition-colors hover:border-fg hover:bg-fg/5"
          >
            View Work
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-300 ease-cinema group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>

      <a
        href={hash(SECTION_IDS.work)}
        aria-label="Scroll to work"
        data-print="hide"
        className="absolute right-gutter bottom-[clamp(4rem,12vh,8rem)] hidden rise flex-col items-center gap-3 text-muted transition-colors hover:text-fg md:flex"
        style={rise(500)}
      >
        <span className="meta">Scroll</span>
        <span aria-hidden className="h-16 w-px bg-current" />
        <ArrowDown aria-hidden className="-mt-2 size-3.5" />
      </a>
    </section>
  )
}
