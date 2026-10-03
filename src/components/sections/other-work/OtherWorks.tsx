import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { sectionHeadingId } from '@/lib/links'
import type { OtherWork, SectionCopy } from '@/types'
import { OtherWorkCard } from './OtherWorkCard'

export function OtherWorks({ copy, works }: { copy: SectionCopy; works: OtherWork[] }) {
  if (works.length === 0) return null

  return (
    <Section id={copy.id} tone={copy.tone}>
      <SectionHeader
        label={copy.label}
        title={copy.title}
        lede={copy.lede}
        headingId={sectionHeadingId(copy.id)}
      />

      <ul className="mt-stack grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {works.map((work, index) => (
          <Reveal as="li" key={work.id} step={index % 4}>
            <OtherWorkCard work={work} />
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
