import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Fill = the colour that wipes in; `over` = label colour on top of it.
const VARIANT = {
  solid: { root: 'border-fg bg-fg text-bg', fill: 'bg-bg', over: 'text-fg' },
  outline: {
    root: 'border-fg/30 text-fg hover:border-fg aria-[current]:border-fg',
    fill: 'bg-fg',
    over: 'text-bg',
  },
}

// Padding is shared by both labels, so the copy lines up with the original.
const SIZE = { md: 'h-11 px-5', sm: 'h-9 px-4' }

const LABEL = 'flex items-center gap-2.5 transition duration-500 ease-out-expo'

type RollLinkProps = ComponentProps<'a'> & {
  variant?: keyof typeof VARIANT
  size?: keyof typeof SIZE
}

/**
 * CTA hover after oddmanproductions.com: fill wipes down from the top, a second label rolls up
 * from below; on leave both carry on downward. Also held while `aria-current` (navbar spy).
 * Pure CSS (`roll-on` variant); the copy is aria-hidden.
 */
export function RollLink({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}: RollLinkProps) {
  const css = VARIANT[variant]
  const pad = SIZE[size]

  return (
    <a
      className={cn(
        // Rounded like oddmanproductions.com (8 px); the theme's rounded-lg is 2 px.
        'roll relative isolate inline-flex items-center overflow-hidden rounded-[0.5rem] border text-sm font-medium transition-colors',
        pad,
        css.root,
        className,
      )}
      {...props}
    >
      {/* Origin flips on hover, so it grows from the top and shrinks to the bottom. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-out-quart roll-on:origin-top roll-on:scale-y-100',
          css.fill,
        )}
      />
      <span className={cn(LABEL, 'roll-on:-translate-y-[200%] roll-on:scale-80')}>{children}</span>
      <span
        aria-hidden
        className={cn(
          LABEL,
          'absolute inset-0 translate-y-full scale-80 delay-75 roll-on:translate-y-0 roll-on:scale-100',
          pad,
          css.over,
        )}
      >
        {children}
      </span>
    </a>
  )
}
