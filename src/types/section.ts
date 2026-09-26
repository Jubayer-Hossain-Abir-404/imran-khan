import { SECTION_IDS, type SectionId } from '@/lib/links'

/** Homepage section copy. Array order in `sections.json` is render order. */
export type SectionCopy = {
  id: SectionId
  label: string
  title?: string
  lede?: string
}

/** JSON widens `id` to `string`; an unknown id fails the build instead of rendering nothing. */
export function isSectionId(value: string): value is SectionId {
  return Object.values(SECTION_IDS).includes(value as SectionId)
}
