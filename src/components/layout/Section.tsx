import type { ReactNode } from 'react'
import { sectionHeadingId, type SectionId } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { SectionTone } from '@/types'

type SectionProps = {
  id: SectionId
  /** From `sections.json`; `data-tone` drives the same-tone hairline in index.css. */
  tone?: SectionTone
  className?: string
  children: ReactNode
}

// `dark` is the page background itself.
const TONE_CLASS: Record<SectionTone, string> = {
  dark: '',
  surface: 'bg-surface',
  paper: 'tone-warm',
}

/** Landmark named by its SectionHeader (`sectionHeadingId`), with the page container inside. */
export function Section({ id, tone = 'dark', className, children }: SectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      aria-labelledby={sectionHeadingId(id)}
      className={cn('py-section', TONE_CLASS[tone], className)}
    >
      <div className="mx-auto max-w-7xl px-gutter">{children}</div>
    </section>
  )
}
