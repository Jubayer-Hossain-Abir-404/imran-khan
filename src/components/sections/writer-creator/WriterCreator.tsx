import { PenLine } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { FilmCard } from '@/components/video/FilmCard'
import { VIDEO_GRID_GAPS } from '@/components/video/grid'
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

/**
 * Writing videos ‖ Shonggolpo. From xl both sit on the Selected Works grid (videos in two of its three
 * columns, channel in the third), so the cards match in size. Either can be empty; the other takes the width.
 */
export function WriterCreator({ copy, writing, channel }: WriterCreatorProps) {
  const { selected, play, close, opener } = useVideoModal<PlayableVideo>()
  const headingId = sectionHeadingId(copy.id)
  const hasWriting = writing.length > 0

  if (!hasWriting && !channel) return null

  return (
    <Section id={copy.id} tone={copy.tone}>
      <div
        className={cn(
          'grid gap-8 md:gap-14',
          // Column gap = VIDEO_GRID_GAPS at xl, so two of these columns hold two cards exactly.
          hasWriting && channel && 'xl:grid-cols-3 xl:gap-x-12',
        )}
      >
        {hasWriting ? (
          <div className={cn(channel && 'xl:col-span-2')}>
            <Reveal>
              <PenLine aria-hidden className="mb-5 size-5 text-accent" />
            </Reveal>
            <SectionHeader label={copy.label} lede={copy.lede} headingId={headingId} />

            <ul className={cn('mt-stack grid md:grid-cols-2', VIDEO_GRID_GAPS)}>
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
                // xl: divider centred in the column gap, so the channel keeps the full column width.
                'border-t border-rule pt-8 md:pt-14 xl:relative xl:border-t-0 xl:pt-0 xl:before:absolute xl:before:inset-y-0 xl:before:-left-6 xl:before:w-px xl:before:bg-rule',
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
