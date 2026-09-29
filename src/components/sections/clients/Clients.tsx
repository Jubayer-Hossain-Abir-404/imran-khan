import type { CSSProperties } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { externalLinkProps, sectionHeadingId } from '@/lib/links'
import type { Client, SectionCopy } from '@/types'

type ClientsProps = {
  copy: SectionCopy
  clients: Client[]
}

// Brand colour always. Data height on mobile, 1.2× from sm; width follows the intrinsic ratio.
const LOGO = 'h-(--logo-h) w-auto max-w-none object-contain sm:h-[calc(var(--logo-h)*1.2)]'

function LogoList({ clients, clone }: { clients: Client[]; clone?: boolean }) {
  return (
    <ul
      data-list
      data-clone={clone ? '' : undefined}
      aria-hidden={clone || undefined}
      className="flex shrink-0 items-center gap-x-14 pr-14 sm:gap-x-20 sm:pr-20"
    >
      {clients.map((client) => {
        const logo = (
          <img
            src={client.logo}
            alt={clone ? '' : client.name}
            width={client.width}
            height={client.height}
            loading="lazy"
            style={{ '--logo-h': `${client.height}px` } as CSSProperties}
            className={LOGO}
          />
        )

        return (
          <li key={client.logo} className="shrink-0">
            {client.href ? (
              <a
                href={client.href}
                tabIndex={clone ? -1 : undefined}
                className="block"
                {...externalLinkProps(client.href)}
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Looping logo marquee, paused on hover; reduced motion → static wrap. */
export function Clients({ copy, clients }: ClientsProps) {
  if (clients.length === 0) return null

  return (
    <Section id={copy.id} warm>
      <SectionHeader
        label={copy.label}
        title={copy.title}
        lede={copy.lede}
        headingId={sectionHeadingId(copy.id)}
      />

      <Reveal step={1} className="mt-stack">
        <div className="-mx-gutter marquee">
          {/* Two identical lists; the track slides one list-width, then loops. */}
          <div data-track className="flex w-max py-4">
            <LogoList clients={clients} />
            <LogoList clients={clients} clone />
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
