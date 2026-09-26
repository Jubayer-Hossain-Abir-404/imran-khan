import { cn } from '@/lib/utils'
import { externalLinkProps } from '@/lib/links'
import type { Social } from '@/types'
import { SocialIcon } from './SocialIcon'

type SocialLinksProps = {
  social: Social[]
  /** Distinguishes multiple lists for screen readers. */
  label: string
  className?: string
}

export function SocialLinks({ social, label, className }: SocialLinksProps) {
  if (social.length === 0) return null

  return (
    <ul aria-label={label} className={cn('flex items-center', className)}>
      {social.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className="flex size-9 items-center justify-center text-muted transition-colors hover:text-fg"
            {...externalLinkProps(item.href)}
          >
            <SocialIcon kind={item.kind} className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  )
}
