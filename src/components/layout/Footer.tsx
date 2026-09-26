import { ArrowUp } from 'lucide-react'
import { ANCHORS, hash, mailto } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Social } from '@/types'
import { SocialLinks } from './SocialLinks'
import { Wordmark } from './Wordmark'

type FooterProps = {
  name: string
  roles: string[]
  email: string | null
  social: Social[]
}

const HEADING_ID = 'contact-heading'

const ARROW = 'absolute inset-0 size-4 transition-transform duration-500 ease-out-expo'

export function Footer({ name, roles, email, social }: FooterProps) {
  // Fixed at build time (prerendered); correct as long as the site rebuilds yearly.
  const year = new Date().getFullYear()

  return (
    <footer id={ANCHORS.contact} aria-labelledby={HEADING_ID} className="border-t border-rule">
      <div className="mx-auto max-w-7xl px-gutter py-10 md:py-12">
        <h2 id={HEADING_ID} className="sr-only">
          Contact
        </h2>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-3xl md:text-4xl">
              <Wordmark name={name} />
            </p>
            <p className="mt-2 text-sm text-muted">{roles.join(' · ')}</p>
          </div>

          {social.length > 0 || email ? (
            <div className="flex flex-col gap-3 md:items-end">
              {email ? (
                <a href={mailto(email)} className="self-start link-wipe text-lead md:self-auto">
                  {email}
                </a>
              ) : null}
              <SocialLinks
                social={social}
                email={email}
                label="Contact links"
                className="-ml-2 md:-mr-2 md:ml-0"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-6 border-t border-rule pt-5">
          <p className="text-sm text-muted">
            © {year} {name}
          </p>

          <a
            href={hash(ANCHORS.top)}
            aria-label="Back to top"
            data-print="hide"
            className="group flex size-9 items-center justify-center rounded-[0.5rem] border border-rule text-muted transition-colors hover:border-fg hover:bg-fg hover:text-bg focus-visible:border-fg focus-visible:text-fg"
          >
            {/* Arrow exits upward, a copy rises in from below. */}
            <span aria-hidden className="relative size-4 overflow-hidden">
              <ArrowUp className={cn(ARROW, 'group-hover:-translate-y-full')} />
              <ArrowUp className={cn(ARROW, 'translate-y-full group-hover:translate-y-0')} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
