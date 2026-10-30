import type { Clip, FacebookVideo } from '@/types'
import { embedUrl, watchUrl } from './youtube'

export function isFacebook(clip: Clip): clip is FacebookVideo {
  return 'facebookUrl' in clip
}

/** The video's own page: modified clicks, no-JS and the modal's "Watch on" link. */
export function clipWatchUrl(clip: Clip) {
  return isFacebook(clip) ? clip.facebookUrl : watchUrl(clip.youtubeId)
}

/** Player URL, only ever loaded after a click. Facebook has no cookie-free player. */
export function clipEmbedUrl(clip: Clip) {
  if (!isFacebook(clip)) return embedUrl(clip.youtubeId)

  const params = new URLSearchParams({
    href: clip.facebookUrl,
    show_text: 'false',
    autoplay: 'true',
  })

  return `https://www.facebook.com/plugins/video.php?${params}`
}

export function clipPlatform(clip: Clip) {
  return isFacebook(clip) ? 'Facebook' : 'YouTube'
}
