import { ArrowUp } from 'lucide-react'
import { ANCHORS, hash, mailto } from '@/lib/links'
import type { Social } from '@/types'
import { SocialLinks } from './SocialLinks'

type FooterProps = {
  name: string
  roles: string[]
  email: string | null
  social: Social[]
}

const HEADING_ID = 'contact-heading'

export function Footer({ name, roles, email, social }: FooterProps) {
  // Fixed at build time (prerendered); correct as long as the site rebuilds yearly.
  const year = new Date().getFullYear()

  return (
    <footer id={ANCHORS.contact} aria-labelledby={HEADING_ID} className="border-t border-rule">
      <div className="mx-auto max-w-7xl px-gutter py-14">
        <h2 id={HEADING_ID} className="sr-only">
          Contact
        </h2>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="signature text-5xl">{name}</p>
            <p className="mt-3 text-sm text-muted">{roles.join(' · ')}</p>
            {email ? (
              <a
                href={mailto(email)}
                className="mt-6 inline-block text-lead underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent"
              >
                {email}
              </a>
            ) : null}
          </div>

          {social.length > 0 || email ? (
            <div className="flex items-center gap-4">
              <span className="meta text-muted">Connect</span>
              <SocialLinks social={social} email={email} label="Contact links" className="-mr-2" />
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex items-center justify-between gap-6 border-t border-rule pt-6">
          <p className="text-sm text-muted">
            © {year} {name}
          </p>

          <a
            href={hash(ANCHORS.top)}
            aria-label="Back to top"
            data-print="hide"
            className="flex size-9 items-center justify-center border border-rule text-muted transition-colors hover:border-fg hover:text-fg"
          >
            <ArrowUp aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
