import { ArrowRight, Play } from 'lucide-react'
import type { MouseEvent } from 'react'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { externalLinkProps, isPlainClick } from '@/lib/links'
import { cn } from '@/lib/utils'
import { formatDuration, isoDuration, watchUrl } from '@/lib/youtube'
import type { Channel, Video } from '@/types'

type ChannelCardProps = {
  channel: Channel
  onPlay: (video: Video, opener: HTMLElement) => void
  /** Set when the channel is the section's only content: its label becomes the section <h2>. */
  headingId?: string
  /** `until-xl`: back to one column at xl, where it sits in the section's side column. */
  layout?: 'split' | 'until-xl'
}

// Two columns from md: intro + link left, featured video spanning both rows right. Static strings for Tailwind.
const LAYOUT = {
  split: {
    root: 'md:grid md:grid-cols-2 md:gap-x-14 lg:gap-x-20',
    intro: 'md:self-end',
    video: 'md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0',
    link: 'md:mt-8 md:self-start',
  },
  'until-xl': {
    root: 'md:grid md:grid-cols-2 md:gap-x-14 xl:flex',
    intro: 'md:self-end',
    video: 'md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0 xl:mt-6',
    link: 'md:mt-8 md:self-start xl:mt-6 xl:self-auto',
  },
}

/** Introduces the channel: one featured video (modal on click) + a link out. */
export function ChannelCard({ channel, onPlay, headingId, layout = 'split' }: ChannelCardProps) {
  const wide = Boolean(headingId)
  const Heading = wide ? 'h2' : 'h3'
  const css = LAYOUT[layout]
  const { featured } = channel

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!featured || !isPlainClick(event)) return

    event.preventDefault()
    onPlay(featured, event.currentTarget)
  }

  return (
    <div className={cn('flex flex-col', css.root)}>
      <div className={css.intro}>
        <Heading id={headingId} className={cn('display', wide ? 'text-h2' : 'text-h3')}>
          {channel.label}
        </Heading>
        <p className={cn('max-w-md text-pretty text-muted', wide ? 'mt-5' : 'mt-3 text-sm')}>
          {channel.description}
        </p>
      </div>

      {featured ? (
        <article
          className={cn(
            'group relative mt-6 outline-offset-3 outline-accent has-focus-visible:outline-2',
            css.video,
          )}
        >
          <div className="relative aspect-video overflow-hidden bg-bg">
            <img
              src={featured.thumbnail}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-cinema motion-safe:group-hover:scale-[1.03]"
            />
            <div aria-hidden className="absolute inset-0 bg-black/25" />
            <span
              aria-hidden
              className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full border border-fg/60 bg-black/35 text-fg backdrop-blur-sm transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg"
            >
              <Play className="size-4 translate-x-px fill-current" />
            </span>
            {featured.durationSeconds ? (
              <time
                dateTime={isoDuration(featured.durationSeconds)}
                className="absolute right-2 bottom-2 bg-black/60 px-1.5 py-0.5 text-xs text-fg/85 tabular-nums"
              >
                {formatDuration(featured.durationSeconds)}
              </time>
            ) : null}
          </div>

          <p className="mt-3 meta text-muted">Featured</p>
          <h3 className="mt-1 text-sm leading-snug text-fg/90">
            <a
              href={watchUrl(featured.youtubeId)}
              onClick={handleClick}
              className="outline-none after:absolute after:inset-0 after:content-['']"
              {...externalLinkProps(watchUrl(featured.youtubeId))}
            >
              <span className="sr-only">Play </span>
              {featured.title}
            </a>
          </h3>
        </article>
      ) : null}

      <a
        href={channel.href}
        className={cn('group mt-6 flex items-center gap-4 border-t border-rule pt-5', css.link)}
        {...externalLinkProps(channel.href)}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#ff0033] text-white">
          <SocialIcon kind="youtube" className="size-5" />
        </span>
        <span className="flex-1 font-medium">{channel.name}</span>
        <span className="sr-only">on YouTube</span>
        <ArrowRight
          aria-hidden
          className="size-4 text-muted transition-transform duration-300 ease-cinema group-hover:translate-x-0.5 group-hover:text-fg"
        />
      </a>
    </div>
  )
}
