import type { Draftable, Media } from './common'
import type { Video } from './film'

/** A channel video credited as writing / creative supervision; shown with the film card. */
export type WritingPiece = Draftable &
  Video & {
    /** Card eyebrow, e.g. the client or project. */
    category: string
    year?: string
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

export type Testimonial = Draftable & {
  quote: string
  name: string
  role?: string
  organization?: string
}
