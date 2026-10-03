import { SECTION_IDS, type SectionId } from '@/lib/links'

/** Section background: page dark, raised dark, or light paper. Touching sections of one tone get a hairline. */
export const SECTION_TONES = ['dark', 'surface', 'paper'] as const

export type SectionTone = (typeof SECTION_TONES)[number]

/** Homepage section copy. Array order in `sections.json` is render order. */
export type SectionCopy = {
  id: SectionId
  label: string
  title?: string
  lede?: string
  /** Optional in JSON; defaults to `dark`. */
  tone: SectionTone
}

export function isSectionTone(value: string): value is SectionTone {
  return (SECTION_TONES as readonly string[]).includes(value)
}

/** JSON widens `id` to `string`; an unknown id fails the build instead of rendering nothing. */
export function isSectionId(value: string): value is SectionId {
  return Object.values(SECTION_IDS).includes(value as SectionId)
}
