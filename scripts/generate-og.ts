// Social card + apple-touch-icon, rendered into build/client after `react-router build` (not committed, absent in dev).
// Fonts are committed TTFs: resvg can't read woff2, and a build shouldn't download a typeface.
// `og/default.png` must match OG_IMAGE_PATH in src/lib/seo.ts (scripts can't import app aliases).

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

type Profile = { name: string; roles: string[] }

const root = new URL('../', import.meta.url)
const path = (rel: string) => fileURLToPath(new URL(rel, root))
const clientDir = path('build/client/')

const font = {
  fontFiles: [
    'Geist-Regular.ttf',
    'Geist-Medium.ttf',
    'GeistMono-Medium.ttf',
    'CormorantGaramond-Medium.ttf',
    'CormorantGaramond-SemiBold.ttf',
  ].map((name) => path(`scripts/fonts/${name}`)),
  loadSystemFonts: false,
  defaultFontFamily: 'Geist',
}

// Dark palette, in sync with :root in src/styles/index.css.
const C = {
  bg: '#0a0c0c',
  surface: '#121616',
  fg: '#f1ede5',
  muted: '#a29e96',
  rule: '#262a2a',
  accent: '#c6ae7b',
}

const W = 1200
const H = 630
const PAD = 80
const SERIF = 'Cormorant Garamond'

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

/** Rendered width, measured by resvg itself so it can't drift from the final PNG. */
function measure(text: string, size: number, family: string, weight: number) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 4}" height="${size * 3}">` +
    `<text x="0" y="${size * 2}" font-family="${family}" font-weight="${weight}" font-size="${size}">` +
    `${escapeXml(text)}</text></svg>`

  return new Resvg(svg, { font }).getBBox()?.width ?? 0
}

/** Largest size that fits one line; falls back to the smallest rather than failing the deploy. */
function fitSize(text: string, sizes: number[], maxWidth: number) {
  return sizes.find((size) => measure(text, size, SERIF, 500) <= maxWidth) ?? sizes.at(-1)!
}

function meta(text: string, x: number, y: number, { anchor = 'start', fill = C.muted } = {}) {
  return (
    `<text x="${x}" y="${y}" font-family="Geist Mono" font-weight="500" font-size="20" letter-spacing="2.8" ` +
    `text-anchor="${anchor}" fill="${fill}">${escapeXml(text.toUpperCase())}</text>`
  )
}

function card({ name, roles }: Profile, host: string) {
  const size = fitSize(name, [150, 132, 116, 100, 88], W - PAD * 2)
  const nameBaseline = H / 2 + size * 0.28
  const ruleY = nameBaseline + 44
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><radialGradient id="glow" cx="0.2" cy="0.5" r="0.9">` +
    `<stop offset="0" stop-color="${C.surface}"/><stop offset="1" stop-color="${C.bg}"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#glow)"/>` +
    `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${C.rule}" stroke-width="1.5"/>` +
    // Favicon mark, so card and tab read as one identity.
    `<rect x="${PAD}" y="${PAD - 8}" width="52" height="52" fill="none" stroke="${C.accent}" stroke-width="1.5"/>` +
    `<text x="${PAD + 26}" y="${PAD + 27}" text-anchor="middle" font-family="${SERIF}" font-weight="600" ` +
    `font-size="26" fill="${C.fg}">${escapeXml(initials)}</text>` +
    meta('Portfolio', W - PAD, PAD + 26, { anchor: 'end' }) +
    `<text x="${PAD - 4}" y="${nameBaseline}" font-family="${SERIF}" font-weight="500" font-size="${size}" ` +
    `letter-spacing="${-size * 0.015}" fill="${C.fg}">${escapeXml(name)}</text>` +
    `<line x1="${PAD}" y1="${ruleY}" x2="${PAD + 72}" y2="${ruleY}" stroke="${C.accent}" stroke-width="2"/>` +
    meta(roles.join('  ·  '), PAD, ruleY + 52, { fill: C.fg }) +
    meta(host, PAD, H - PAD + 8) +
    `</svg>`
  )
}

async function main() {
  if (!existsSync(clientDir)) {
    throw new Error('build/client not found — run `react-router build` before generate-og.')
  }

  const profile = JSON.parse(await readFile(path('src/data/profile.json'), 'utf8')) as Profile
  const host = (process.env.VITE_SITE_URL ?? 'https://imran-khan-director.netlify.app').replace(
    /^https?:\/\/|\/+$/g,
    '',
  )

  const og = new Resvg(card(profile, host), { font, fitTo: { mode: 'width', value: W } })
    .render()
    .asPng()
  const touch = new Resvg(await readFile(path('public/favicon.svg'), 'utf8'), {
    font,
    fitTo: { mode: 'width', value: 180 },
  })
    .render()
    .asPng()

  await mkdir(`${clientDir}og`, { recursive: true })
  await Promise.all([
    writeFile(`${clientDir}og/default.png`, og),
    writeFile(`${clientDir}apple-touch-icon.png`, touch),
  ])

  console.log('generate-og: og/default.png + apple-touch-icon.png → build/client')
}

await main()
