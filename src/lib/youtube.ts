export const CHANNEL_URL = 'https://www.youtube.com/@ImranKhan-pc6ih'

/** Privacy-enhanced embed; only ever created after a click. */
export function embedUrl(id: string) {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

export function watchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

export function playlistUrl(id: string) {
  return `https://www.youtube.com/playlist?list=${id}`
}

/** 272 → "4:32". */
export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')

  return `${m}:${s}`
}

/** 272 → "PT4M32S", for `<time dateTime>`. */
export function isoDuration(seconds: number) {
  return `PT${Math.floor(seconds / 60)}M${seconds % 60}S`
}
