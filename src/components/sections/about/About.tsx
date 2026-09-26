import { Camera, Clapperboard, MapPin, PenLine, Quote, type LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { sectionHeadingId } from '@/lib/links'
import type { FactIcon, Profile, SectionCopy } from '@/types'
import { ReadMore } from './ReadMore'

const ICONS: Record<FactIcon, LucideIcon> = {
  camera: Camera,
  pen: PenLine,
  clapperboard: Clapperboard,
  'map-pin': MapPin,
}

/** Portrait | bio | facts + quote. */
export function About({ copy, profile }: { copy: SectionCopy; profile: Profile }) {
  const { portrait } = profile

  return (
    <Section id={copy.id} warm>
      <div className="grid gap-12 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,15rem)]">
        {portrait ? (
          <Reveal className="max-w-72 md:max-w-none">
            <img
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              decoding="async"
              className="aspect-4/5 w-full bg-surface object-cover"
            />
          </Reveal>
        ) : null}

        <div className="max-w-xl">
          <SectionHeader
            label={copy.label}
            title={copy.title ?? profile.name}
            headingId={sectionHeadingId(copy.id)}
          />
          <Reveal step={1}>
            <p className="mt-6 text-lead text-pretty">{profile.summary}</p>
            <ReadMore paragraphs={profile.about} />
          </Reveal>
        </div>

        <Reveal
          step={2}
          // Below xl: facts under the portrait, quote under the bio (same columns).
          className="border-t border-rule pt-10 md:col-span-2 md:grid md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-x-12 lg:gap-x-14 xl:col-span-1 xl:block xl:border-t-0 xl:border-l xl:pt-2 xl:pl-10"
        >
          <ul className="space-y-3.5">
            {profile.facts.map((fact) => {
              const Icon = ICONS[fact.icon]

              return (
                <li key={fact.label} className="flex items-center gap-3.5 text-sm">
                  <Icon aria-hidden className="size-4 shrink-0 text-accent" />
                  {fact.label}
                </li>
              )
            })}
          </ul>

          {profile.quote ? (
            <figure className="mt-10 flex max-w-xl gap-3.5 md:mt-0 xl:mt-10">
              <Quote aria-hidden className="size-4 shrink-0 fill-current text-accent" />
              <div>
                <blockquote className="display text-xl leading-snug text-pretty">
                  <p>“{profile.quote}”</p>
                </blockquote>
                <figcaption className="mt-3 text-xs text-muted">— {profile.name}</figcaption>
              </div>
            </figure>
          ) : null}
        </Reveal>
      </div>
    </Section>
  )
}
