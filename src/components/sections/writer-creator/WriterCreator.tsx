import { PenLine } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { FilmCard } from '@/components/video/FilmCard'
import { useVideoModal } from '@/components/video/useVideoModal'
import { VideoModal, type PlayableVideo } from '@/components/video/VideoModal'
import { sectionHeadingId } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Channel, SectionCopy, WritingPiece } from '@/types'
import { ChannelCard } from './ChannelCard'

type WriterCreatorProps = {
  copy: SectionCopy
  writing: WritingPiece[]
  channel: Channel | null
}

/** Writing videos ‖ Shongolpo (side by side from xl). Either can be empty; the other takes the width. */
export function WriterCreator({ copy, writing, channel }: WriterCreatorProps) {
  const { selected, play, close, opener } = useVideoModal<PlayableVideo>()
  const headingId = sectionHeadingId(copy.id)
  const hasWriting = writing.length > 0

  if (!hasWriting && !channel) return null

  return (
    <Section id={copy.id} className="bg-surface">
      <div
        className={cn(
          'grid gap-8 md:gap-14',
          hasWriting && channel && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:gap-0',
        )}
      >
        {hasWriting ? (
          <div className={cn(channel && 'xl:pr-12')}>
            <Reveal>
              <PenLine aria-hidden className="mb-5 size-5 text-accent" />
            </Reveal>
            <SectionHeader label={copy.label} lede={copy.lede} headingId={headingId} />

            <ul className="mt-stack grid gap-4 md:grid-cols-2 md:gap-5">
              {writing.map((piece, index) => (
                <Reveal as="li" key={piece.youtubeId} step={index % 2}>
                  <FilmCard film={piece} onPlay={play} />
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}

        {channel ? (
          <Reveal
            step={hasWriting ? 2 : 0}
            className={cn(
              hasWriting &&
                'border-t border-rule pt-8 md:pt-14 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-12',
            )}
          >
            <ChannelCard
              channel={channel}
              onPlay={(video, from) => play({ ...video, category: channel.name }, from)}
              headingId={hasWriting ? undefined : headingId}
              layout={hasWriting ? 'until-xl' : 'split'}
            />
          </Reveal>
        ) : null}
      </div>

      <VideoModal video={selected} onClose={close} opener={opener} />
    </Section>
  )
}
