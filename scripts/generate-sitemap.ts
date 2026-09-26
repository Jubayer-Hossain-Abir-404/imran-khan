// sitemap.xml + robots.txt, written into build/client (both need the deployed origin).
// Paths mirror `prerender` in react-router.config.ts — a sitemap URL the build didn't generate is a soft 404.

import { stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const clientDir = fileURLToPath(new URL('../build/client/', import.meta.url))
const origin = (process.env.VITE_SITE_URL ?? 'https://imran-khan-director.netlify.app').replace(
  /\/+$/,
  '',
)
const PATHS = ['/']

/** lastmod = mtime of the HTML the build just wrote, never a hand-kept date. */
async function lastmod(route: string) {
  const file = `${clientDir}${route === '/' ? 'index.html' : `${route.slice(1)}/index.html`}`

  try {
    return (await stat(file)).mtime.toISOString().slice(0, 10)
  } catch {
    return null
  }
}

async function main() {
  if (!existsSync(clientDir)) {
    throw new Error('build/client not found — run `react-router build` before generate-sitemap.')
  }

  const entries = await Promise.all(
    PATHS.map(async (route) => {
      const date = await lastmod(route)

      return `  <url>\n    <loc>${origin}${route}</loc>\n${date ? `    <lastmod>${date}</lastmod>\n` : ''}  </url>`
    }),
  )

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${entries.join('\n')}\n</urlset>\n`
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`

  await Promise.all([
    writeFile(`${clientDir}sitemap.xml`, sitemap),
    writeFile(`${clientDir}robots.txt`, robots),
  ])

  console.log(`generate-sitemap: ${PATHS.length} URL(s) at ${origin}`)
}

await main()
