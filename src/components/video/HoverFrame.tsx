import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const ON =
  'group-hover:-inset-1.5 group-hover:opacity-100 group-has-focus-visible:-inset-1.5 group-has-focus-visible:opacity-100'

/**
 * Thumbnail hover: tile springs to 110% (aaronallsop.com), corner brackets close in from 14 px to
 * 6 px (theartofdocumentary.com). Reacts to the nearest `group` ancestor.
 */
export function HoverFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative transition-transform duration-500 ease-spring motion-safe:group-hover:scale-110',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -inset-3.5 brackets text-fg opacity-0 transition-[inset,opacity] duration-200 ease-out-quart',
          ON,
        )}
      />
      {children}
    </div>
  )
}
