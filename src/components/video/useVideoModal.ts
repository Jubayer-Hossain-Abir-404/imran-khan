import { useRef, useState } from 'react'
import type { PlayableVideo } from './VideoModal'

/** Modal state + the element focus returns to on close. */
export function useVideoModal<T extends PlayableVideo>() {
  const [selected, setSelected] = useState<T | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const play = (video: T, from: HTMLElement) => {
    opener.current = from
    setSelected(video)
  }

  return { selected, play, close: () => setSelected(null), opener }
}
