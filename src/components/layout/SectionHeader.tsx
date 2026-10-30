import { Aperture, Film, Handshake, PenLine, Shapes, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import type { SectionIcon } from '@/types'

const ICONS: Record<SectionIcon, LucideIcon> = {
  film: Film,
  pen: PenLine,
  aperture: Aperture,
  shapes: Shapes,
  handshake: Handshake,
}

type SectionHeaderProps = {
  label: string
  /** Inline before the label, so it costs no height. */
  icon?: SectionIcon
  title?: ReactNode
  lede?: string
  className?: string
  /** Lands on the <h2> so the section can use `aria-labelledby`. */
  headingId?: string
}

/** Eyebrow + serif title. Always exactly one <h2>: the title, or the label when there is none. */
export function SectionHeader({
  label,
  icon,
  title,
  lede,
  className,
  headingId,
}: SectionHeaderProps) {
  const Icon = icon ? ICONS[icon] : null
  const eyebrow = (
    <>
      {Icon ? <Icon aria-hidden className="size-4 shrink-0 text-accent" /> : null}
      {label}
    </>
  )

  return (
    <header className={className}>
      {title ? (
        <>
          <Reveal as="p" className="flex items-center gap-2.5 meta text-muted">
            {eyebrow}
          </Reveal>
          <Reveal as="h2" id={headingId} step={1} className="mt-3 display text-h2 text-balance">
            {title}
          </Reveal>
        </>
      ) : (
        <Reveal as="h2" id={headingId} className="flex items-center gap-2.5 meta text-muted">
          {eyebrow}
        </Reveal>
      )}

      {lede ? (
        <Reveal as="p" step={2} className="mt-5 max-w-2xl text-lead text-pretty text-muted">
          {lede}
        </Reveal>
      ) : null}
    </header>
  )
}
