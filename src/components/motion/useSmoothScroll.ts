import Lenis from 'lenis'
import { useEffect } from 'react'
import { useMotionSafe } from './useMotionSafe'

// theartofdocumentary.com's settings: 1.2 s expo-out glide, faster wheel.
const OPTIONS = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  wheelMultiplier: 1.8,
  autoRaf: true,
  // Hash links glide too; Lenis honours the navbar's scroll-padding-top.
  anchors: true,
  // Pauses while a dialog locks <html> overflow.
  autoToggle: true,
  prevent: (node: HTMLElement) => node.closest('[role="dialog"]') !== null,
}

/** Smoothed wheel scrolling (touch stays native). Off under reduced motion. */
export function useSmoothScroll() {
  const motionSafe = useMotionSafe()

  useEffect(() => {
    if (!motionSafe) return

    const lenis = new Lenis(OPTIONS)

    return () => lenis.destroy()
  }, [motionSafe])
}
