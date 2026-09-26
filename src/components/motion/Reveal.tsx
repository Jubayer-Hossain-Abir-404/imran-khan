import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { useMotionSafe } from './useMotionSafe'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger in ms. */
  delay?: number
  as?: ElementType
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'>

/**
 * Scroll-in fade. The hidden state is set by script only, so prerendered HTML is
 * visible without JS; elements already on screen at load are not animated.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div', ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const motionSafe = useMotionSafe()

  useLayoutEffect(() => {
    const el = ref.current

    if (!el) return

    if (!motionSafe) {
      el.removeAttribute('data-reveal')
      return
    }

    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.dataset.reveal = 'in'
      return
    }

    el.dataset.reveal = 'pending'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        el.dataset.reveal = 'in'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [motionSafe])

  return (
    <Tag
      {...rest}
      ref={ref}
      className={cn('reveal', className)}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
