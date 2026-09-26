import type { Draftable } from './common'

/** A YouTube video shown as a poster card. */
export type Video = {
  youtubeId: string
  /** Cleaned display title. */
  title: string
  /** YouTube title, verbatim — shown in the video modal. */
  youtubeTitle: string
  /** From the watch page's `lengthSeconds`. */
  durationSeconds?: number
  /** Self-hosted still from `scripts/fetch-thumbnails.ts`. */
  thumbnail: string
  /** CSS `object-position` for the 2.39:1 crop; defaults to centre. */
  objectPosition?: string
}

/** One featured film per YouTube playlist, curated by hand — no YouTube API. */
export type Film = Draftable &
  Video & {
    /** Playlist name. */
    category: string
    playlistId: string
    year?: string
  }
