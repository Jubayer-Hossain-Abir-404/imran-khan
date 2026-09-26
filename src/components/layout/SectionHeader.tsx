import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

type SectionHeaderProps = {
  label: string
  title?: ReactNode
  lede?: string
  className?: string
  /** Lands on the <h2> so the section can use `aria-labelledby`. */
  headingId?: string
}

/** Eyebrow + serif title. Always exactly one <h2>: the title, or the label when there is none. */
export function SectionHeader({ label, title, lede, className, headingId }: SectionHeaderProps) {
  return (
    <header className={className}>
      {title ? (
        <>
          <Reveal as="p" className="meta text-muted">
            {label}
          </Reveal>
          <Reveal as="h2" id={headingId} delay={60} className="mt-3 display text-h2 text-balance">
            {title}
          </Reveal>
        </>
      ) : (
        <Reveal as="h2" id={headingId} className="meta text-muted">
          {label}
        </Reveal>
      )}

      {lede ? (
        <Reveal as="p" delay={120} className="mt-5 max-w-2xl text-lead text-pretty text-muted">
          {lede}
        </Reveal>
      ) : null}
    </header>
  )
}
