import type { Draftable, Link, Media } from './common'

export const FACT_ICONS = ['camera', 'pen', 'clapperboard', 'map-pin'] as const

export type FactIcon = (typeof FACT_ICONS)[number]

export function isFactIcon(value: string): value is FactIcon {
  return (FACT_ICONS as readonly string[]).includes(value)
}

/** One line of the About sidebar. */
export type Fact = {
  label: string
  icon: FactIcon
}

/** Only the poster is required, so the hero works at every stage of the asset pipeline. */
export type HeroMedia = {
  poster: Media
  posterMobile?: Media
  video?: {
    webm?: string
    mp4: string
    /** Without it, narrow screens get the poster only. */
    mobileMp4?: string
  }
}

export type Profile = {
  name: string
  roles: string[]
  eyebrow: string
  /** About lede, meta description and JSON-LD. */
  summary: string
  /** Shown by "Read more"; empty hides the control. */
  about: string[]
  location: string
  /** `null` hides the Contact link. */
  email: string | null
  portrait: Media | null
  quote?: string
  facts: Fact[]
  hero: HeroMedia
  /** Fields still holding placeholder copy; the build warns about each. */
  unverified: string[]
}

export const SOCIAL_KINDS = ['youtube', 'facebook', 'instagram', 'linkedin', 'x', 'other'] as const

export type SocialKind = (typeof SOCIAL_KINDS)[number]

export function isSocialKind(value: string): value is SocialKind {
  return (SOCIAL_KINDS as readonly string[]).includes(value)
}

export type Social = Draftable &
  Link & {
    kind: SocialKind
  }
