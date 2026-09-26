import type { Config } from '@react-router/dev/config'

// SSG: `/` is prerendered to static HTML at build time; no server at runtime.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/'],
} satisfies Config
