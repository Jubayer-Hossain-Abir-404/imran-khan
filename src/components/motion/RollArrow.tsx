import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ARROW = 'absolute inset-0 size-4 transition-transform duration-500 ease-out-expo'

/** Arrow that slides out right and a copy slides in from the left, on hover of a `group`. */
export function RollArrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('relative size-4 shrink-0 overflow-hidden', className)}>
      <ArrowRight className={cn(ARROW, 'group-hover:translate-x-full')} />
      <ArrowRight className={cn(ARROW, '-translate-x-full group-hover:translate-x-0')} />
    </span>
  )
}
