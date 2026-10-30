import type { Draftable, Media } from './common'
import type { Clip, Video } from './film'

/** An ad or campaign video; the card's title is the client. */
export type WritingPiece = Draftable &
  Clip & {
    /** Card eyebrow: the role, e.g. "Copywriter & Content Writer". */
    category: string
    year?: string
    /** Hover line and modal credit, e.g. "Agency: 360 One". */
    credits?: string
  }

/** Shonggolpo. */
export type Channel = Draftable & {
  /** Block heading, e.g. "Content Creator". */
  label: string
  name: string
  href: string
  /** Channel picture, self-hosted by `scripts/fetch-thumbnails.ts`; without it a YouTube disc shows. */
  avatar?: string
  description: string
  /** Hand-picked (most viewed); links out, never embedded on load. */
  featured?: Video
}

export type OtherWork = Draftable & {
  id: string
  title: string
  description: string
  image: Media | null
  /** Shown as "Visit" inside the detail dialog. */
  href?: string
  year?: string
}

export type Client = Draftable & {
  name: string
  /** SVG preferred. */
  logo: string
  /** Display size in px, tuned per logo so they read at the same visual weight. */
  width: number
  height: number
  href?: string
}
