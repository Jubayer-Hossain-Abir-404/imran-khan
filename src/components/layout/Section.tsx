import type { ReactNode } from 'react'
import { sectionHeadingId, type SectionId } from '@/lib/links'
import { cn } from '@/lib/utils'

type SectionProps = {
  id: SectionId
  /** Paper tone, per the mockup. */
  warm?: boolean
  className?: string
  children: ReactNode
}

/** Landmark named by its SectionHeader (`sectionHeadingId`), with the page container inside. */
export function Section({ id, warm, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={sectionHeadingId(id)}
      className={cn('py-section', warm && 'tone-warm', className)}
    >
      <div className="mx-auto max-w-7xl px-gutter">{children}</div>
    </section>
  )
}
