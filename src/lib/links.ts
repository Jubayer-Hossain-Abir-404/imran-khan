import type { MouseEvent } from 'react'

/** Section anchors, shared by the nav and the sections so they can't drift. */
export const SECTION_IDS = {
  work: 'work',
  writing: 'writing',
  about: 'about',
  other: 'other-work',
  clients: 'clients',
} as const

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS]

/** Non-section anchors. */
export const ANCHORS = {
  top: 'top',
  main: 'main',
  contact: 'contact',
} as const

/** Heading id that names a section landmark via `aria-labelledby`. */
export function sectionHeadingId(id: SectionId) {
  return `${id}-heading`
}

export function hash(id: string) {
  return `#${id}`
}

export function mailto(email: string) {
  return `mailto:${email}`
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href)
}

/** Plain left click; modified clicks keep the browser's default (new tab etc.). */
export function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** External links always open in a new tab with `rel`. */
export function externalLinkProps(href: string) {
  return isExternal(href) ? ({ target: '_blank', rel: 'noreferrer noopener' } as const) : {}
}
