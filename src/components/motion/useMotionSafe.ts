import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function read(): boolean {
  return typeof window === 'undefined' ? false : !window.matchMedia(QUERY).matches
}

/** `false` when the visitor prefers reduced motion. Tracks live changes to the setting. */
export function useMotionSafe(): boolean {
  const [safe, setSafe] = useState(read)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const sync = () => setSafe(!media.matches)

    sync()
    media.addEventListener('change', sync)

    return () => media.removeEventListener('change', sync)
  }, [])

  return safe
}
