/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Site origin, no trailing slash. Set by netlify.toml from `$URL`. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
