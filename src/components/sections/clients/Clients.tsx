import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { externalLinkProps, sectionHeadingId } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Client, SectionCopy, Testimonial } from '@/types'
import { Testimonials } from './Testimonials'

type ClientsProps = {
  copy: SectionCopy
  clients: Client[]
  testimonials: Testimonial[]
}

// Monochrome at rest, brand colour on hover. Size comes from the data (per-logo optical sizing).
const LOGO =
  'max-w-none object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0'

/** Logo row ‖ testimonials. */
export function Clients({ copy, clients, testimonials }: ClientsProps) {
  if (clients.length === 0 && testimonials.length === 0) return null

  const hasBoth = clients.length > 0 && testimonials.length > 0

  return (
    <Section id={copy.id} warm>
      <div
        className={cn(
          // Explicit minmax(0,1fr) column: the carousel track's min-content would widen an auto column.
          'grid grid-cols-1 gap-12',
          hasBoth && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-0',
        )}
      >
        <div className={cn(hasBoth && 'lg:pr-14')}>
          <SectionHeader
            label={copy.label}
            title={copy.title}
            lede={copy.lede}
            headingId={sectionHeadingId(copy.id)}
          />

          {clients.length > 0 ? (
            <ul className="mt-stack flex flex-wrap items-center gap-x-10 gap-y-6">
              {clients.map((client, index) => {
                const logo = (
                  <img
                    src={client.logo}
                    alt={client.name}
                    width={client.width}
                    height={client.height}
                    loading="lazy"
                    className={LOGO}
                  />
                )

                return (
                  <Reveal as="li" key={client.logo} delay={index * 60} className="group">
                    {client.href ? (
                      <a href={client.href} className="block" {...externalLinkProps(client.href)}>
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </Reveal>
                )
              })}
            </ul>
          ) : null}
        </div>

        {testimonials.length > 0 ? (
          <Reveal
            delay={120}
            className={cn(
              hasBoth && 'border-t border-rule pt-12 lg:border-t-0 lg:border-l lg:pt-1 lg:pl-12',
            )}
          >
            <Testimonials items={testimonials} headingId={`${copy.id}-testimonials`} />
          </Reveal>
        ) : null}
      </div>
    </Section>
  )
}
