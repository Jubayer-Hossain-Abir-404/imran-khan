import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { useVideoModal } from '@/components/video/useVideoModal'
import { VideoModal } from '@/components/video/VideoModal'
import { externalLinkProps, sectionHeadingId } from '@/lib/links'
import { CHANNEL_URL } from '@/lib/youtube'
import type { Film, SectionCopy } from '@/types'
import { FilmCard } from '@/components/video/FilmCard'

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

export function Filmography({ copy, films }: { copy: SectionCopy; films: Film[] }) {
  const { selected, play, close, opener } = useVideoModal<Film>()

  if (films.length === 0) return null

  // Derived, so it can't drift from the data.
  const categories = new Set(films.map((film) => film.category)).size
  const tally = `${plural(categories, 'category', 'categories')}, ${plural(films.length, 'story', 'stories')}`

  return (
    <Section id={copy.id}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          label={copy.label}
          title={copy.title}
          lede={copy.lede}
          headingId={sectionHeadingId(copy.id)}
        />

        <Reveal step={2} className="flex items-center gap-8 text-sm text-muted">
          <p className="flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-rule" />
            {tally}
          </p>
          <a
            href={CHANNEL_URL}
            className="group hidden items-center gap-2 py-1 transition-colors hover:text-fg md:inline-flex"
            {...externalLinkProps(CHANNEL_URL)}
          >
            Watch on YouTube
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>
      </div>

      <ul className="mt-stack grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {films.map((film, index) => (
          // Stagger per row position, so each row cascades left to right.
          <Reveal as="li" key={film.youtubeId} step={index % 3}>
            <FilmCard film={film} onPlay={play} />
          </Reveal>
        ))}
      </ul>

      <div className="mt-stack flex items-center gap-6">
        <span aria-hidden className="h-px flex-1 bg-rule" />
        <a
          href={CHANNEL_URL}
          className="group inline-flex h-11 items-center gap-3 border border-fg/30 px-5 text-sm font-medium transition-colors hover:border-fg"
          {...externalLinkProps(CHANNEL_URL)}
        >
          <SocialIcon kind="youtube" className="size-4 text-[#ff0033]" />
          Watch on YouTube
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </a>
        <span aria-hidden className="h-px flex-1 bg-rule" />
      </div>

      <VideoModal video={selected} onClose={close} opener={opener} />
    </Section>
  )
}
