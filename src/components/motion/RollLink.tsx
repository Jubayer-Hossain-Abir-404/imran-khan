import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Fill = the colour that wipes in; `over` = label colour on top of it.
// Outline uses an inset ring, not a border: the fill then covers the full box, so no seam between
// border and fill at fractional zoom (Firefox at 125/150%).
const VARIANT = {
  solid: {
    root: 'border border-fg bg-fg text-bg transition-colors',
    fill: 'bg-bg',
    over: 'text-fg',
  },
  outline: {
    root: 'text-fg ring-1 ring-fg/30 transition-[color,box-shadow] ring-inset hover:ring-fg aria-[current]:ring-fg',
    fill: 'bg-fg',
    over: 'text-bg',
  },
}

// Padding is shared by both labels, so the copy lines up with the original.
const SIZE = { md: 'h-11 px-5', sm: 'h-9 px-4' }

// Centred, so both labels line up when the link is stretched (hero pair on mobile).
const LABEL = 'flex items-center justify-center gap-2.5 transition duration-500 ease-out-expo'

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
        'roll relative isolate inline-flex items-center justify-center overflow-hidden rounded-[0.5rem] text-sm font-medium',
        pad,
        css.root,
        className,
      )}
      {...props}
    >
      {/* Origin flips on hover, so it grows from the top and shrinks to the bottom.
          -inset-px overshoots the clip, so rounding never leaves a gap at the edges. */}
      <span
        aria-hidden
        className={cn(
          'absolute -inset-px -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-out-quart roll-on:origin-top roll-on:scale-y-100',
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
