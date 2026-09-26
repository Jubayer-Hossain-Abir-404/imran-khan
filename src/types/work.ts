import type { Draftable, Media } from './common'
import type { Video } from './film'

export type WritingPiece = Draftable & {
  id: string
  title: string
  kind: string
  image: Media | null
  href?: string
  year?: string
}

/** Shongolpo. */
export type Channel = Draftable & {
  name: string
  /** Name in its original script, e.g. "সংগল্প". */
  nativeName?: string
  href: string
  description: string
  /** Hand-picked (most viewed); links out, never embedded on load. */
  featured?: Video
}

export type OtherWork = Draftable & {
  id: string
  title: string
  description: string
  image: Media | null
  /** No link → non-interactive card, no arrow. */
  href?: string
  year?: string
}

export type Client = Draftable & {
  name: string
  /** SVG preferred. */
  logo: string
  href?: string
}

export type Testimonial = Draftable & {
  quote: string
  name: string
  role?: string
  organization?: string
}
