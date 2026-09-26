/** Shared primitives. Everything under `src/types` stays JSON-serializable. */

export type Link = {
  label: string
  href: string
}

/** `width`/`height` are the file's real pixels — they reserve the box and prevent layout shift. */
export type Media = {
  src: string
  alt: string
  width: number
  height: number
}

/** Placeholder content: rendered in dev, dropped from production builds. */
export type Draftable = {
  draft?: boolean
}
