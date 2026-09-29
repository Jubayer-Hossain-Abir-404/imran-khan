import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { RollLink } from '@/components/motion/RollLink'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { useVideoModal } from '@/components/video/useVideoModal'
import { VideoModal } from '@/components/video/VideoModal'
import { externalLinkProps, sectionHeadingId } from '@/lib/links'
import { CHANNEL_URL } from '@/lib/youtube'
import type { Film, SectionCopy } from '@/types'
import { FilmCard } from '@/components/video/FilmCard'

export function Filmography({ copy, films }: { copy: SectionCopy; films: Film[] }) {
  const { selected, play, close, opener } = useVideoModal<Film>()

  if (films.length === 0) return null

  return (
    <Section id={copy.id}>
      <SectionHeader
        label={copy.label}
        title={copy.title}
        lede={copy.lede}
        headingId={sectionHeadingId(copy.id)}
      />

      <ul className="mt-stack grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {films.map((film, index) => (
          // Stagger per row position, so each row cascades left to right.
          <Reveal as="li" key={film.youtubeId} step={index % 3}>
            <FilmCard
              film={film}
              meta={`${film.year} · ${film.client}`}
              credit={film.credits}
              onPlay={play}
            />
          </Reveal>
        ))}
      </ul>

      <div className="mt-stack flex items-center gap-6">
        <span aria-hidden className="h-px flex-1 bg-rule" />
        <RollLink variant="outline" href={CHANNEL_URL} {...externalLinkProps(CHANNEL_URL)}>
          <SocialIcon kind="youtube" className="size-4 text-[#ff0033]" />
          Watch on YouTube
          <ArrowRight aria-hidden className="size-4" />
        </RollLink>
        <span aria-hidden className="h-px flex-1 bg-rule" />
      </div>

      <VideoModal video={selected} onClose={close} opener={opener} />
    </Section>
  )
}
