// WCAG contrast check, parsed from index.css (`:root` = dark, `tone-warm` = warm) so it can't drift.

import { readFile } from 'node:fs/promises'

type Tokens = Record<string, string>

const css = await readFile(new URL('../src/styles/index.css', import.meta.url), 'utf8')

function tokensIn(block: string): Tokens {
  return Object.fromEntries(
    [...block.matchAll(/--ik-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
  )
}

function blockAfter(marker: string): string {
  const at = css.indexOf(marker)

  if (at === -1) throw new Error(`index.css: "${marker}" not found`)

  const start = css.indexOf('{', at)

  return css.slice(start, css.indexOf('}', start))
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string): number {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)

  return (hi + 0.05) / (lo + 0.05)
}

const tones: Record<string, Tokens> = {
  dark: tokensIn(blockAfter(':root')),
  warm: tokensIn(blockAfter('@utility tone-warm')),
}

// Accent carries link text, so it gets the body-text bar too.
const TEXT = ['fg', 'muted', 'accent']
const BACKGROUNDS = ['bg', 'surface']
const MIN = 4.5

let failed = false

for (const [tone, tokens] of Object.entries(tones)) {
  for (const bg of BACKGROUNDS) {
    for (const fg of TEXT) {
      const back = tokens[bg]
      const fore = tokens[fg]

      if (!back || !fore) {
        console.error(`${tone}: missing --ik-${bg} or --ik-${fg}`)
        failed = true
        continue
      }

      const value = ratio(fore, back)
      const ok = value >= MIN

      failed ||= !ok
      console.log(
        `${ok ? 'pass' : 'FAIL'}  ${tone.padEnd(4)}  ${fg.padEnd(7)} on ${bg.padEnd(7)}  ${value.toFixed(2)}:1`,
      )
    }
  }
}

process.exit(failed ? 1 : 0)
