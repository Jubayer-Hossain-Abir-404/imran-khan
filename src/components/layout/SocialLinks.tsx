import { Mail } from 'lucide-react'
import { externalLinkProps, mailto } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Social } from '@/types'
import { SocialIcon } from './SocialIcon'

type SocialLinksProps = {
  social: Social[]
  /** Distinguishes multiple lists for screen readers. */
  label: string
  /** Adds a leading mail icon. */
  email?: string | null
  className?: string
}

const ICON_LINK =
  'flex size-9 items-center justify-center text-muted transition-colors hover:text-fg'

export function SocialLinks({ social, label, email, className }: SocialLinksProps) {
  if (social.length === 0 && !email) return null

  return (
    <ul aria-label={label} className={cn('flex items-center', className)}>
      {email ? (
        <li>
          <a href={mailto(email)} aria-label={`Email ${email}`} title={email} className={ICON_LINK}>
            <Mail aria-hidden className="size-4" />
          </a>
        </li>
      ) : null}
      {social.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={ICON_LINK}
            {...externalLinkProps(item.href)}
          >
            <SocialIcon kind={item.kind} className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  )
}
