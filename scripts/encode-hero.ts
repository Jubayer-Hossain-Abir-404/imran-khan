// Encodes the hero reel into web background loops + posters in public/media/hero/. Needs ffmpeg (libx264, libvpx-vp9, libwebp).
// Run: `npm run encode:hero -- <input> [--start 0] [--duration 40] [--poster-at 0] [--crop w:h] [--segments a-b,…]`, then paste the printed JSON into profile.json `hero`.

import { spawnSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    start: { type: 'string', default: '0' },
    duration: { type: 'string' },
    'poster-at': { type: 'string', default: '0' },
    // Centred ffmpeg crop, e.g. `iw:1740` strips letterbox bars from mixed-ratio reels.
    crop: { type: 'string' },
    // `1-3,11.6-14.3,…` joins source ranges with crossfades; overrides --start/--duration.
    segments: { type: 'string' },
  },
})

const input = positionals[0]

if (!input || !existsSync(input)) {
  throw new Error(
    'Usage: npm run encode:hero -- <input> [--start s] [--duration s] [--poster-at s] [--crop w:h] [--segments a-b,…]',
  )
}

if (spawnSync('ffmpeg', ['-version']).error) throw new Error('ffmpeg not found on PATH.')

const OUT = '/media/hero'
const outDir = fileURLToPath(new URL(`../public${OUT}/`, import.meta.url))
// `a-b` source ranges in seconds, joined in order.
const segments = values.segments?.split(',').map((range) => {
  const [a = NaN, b = NaN] = range.split('-').map(Number)
  if (!(b > a)) throw new Error(`Bad segment "${range}"; expected start-end seconds.`)
  return { a, b }
})
const XFADE = 0.4
const trim = segments
  ? []
  : ['-ss', values.start, ...(values.duration ? ['-t', values.duration] : [])]
// Muted background loop: no audio, 24 fps is plenty, even dimensions for yuv420p.
const COMMON = '-an -r 24 -pix_fmt yuv420p'
const X264 = '-c:v libx264 -preset slow -movflags +faststart'
const WEBP = '-frames:v 1 -c:v libwebp'
const cropped = (filter: string) => (values.crop ? `crop=${values.crop},${filter}` : filter)
// Filter graph as one argv entry; flags are space-split. No shell, so `\\,` reaches ffmpeg as `\,`.
const vf = (filter: string, flags: string) => ['-vf', cropped(filter), ...flags.split(' ')]
// Never upscale: cap at the source height.
const scale = (height: number) => `scale=-2:min(${height}\\,ih):flags=lanczos`

/**
 * Crossfades the segments, loop seam included: the first segment's opening XFADE seconds
 * are moved to the end and faded into, so the last frame flows into the first.
 */
function joined(filter: string, flags: string) {
  if (!segments) return vf(filter, flags)

  const [first, ...rest] = segments
  const parts = [
    { a: first!.a + XFADE, b: first!.b },
    ...rest,
    { a: first!.a, b: first!.a + XFADE },
  ]
  const graph = [
    `[0:v]${cropped(filter)},split=${parts.length}${parts.map((_, i) => `[i${i}]`).join('')}`,
  ]
  parts.forEach(({ a, b }, i) =>
    graph.push(`[i${i}]trim=${a}:${b},setpts=PTS-STARTPTS,fps=24[s${i}]`),
  )

  let length = parts[0]!.b - parts[0]!.a
  let prev = 's0'
  for (let i = 1; i < parts.length; i++) {
    graph.push(
      `[${prev}][s${i}]xfade=duration=${XFADE}:offset=${(length - XFADE).toFixed(3)}[x${i}]`,
    )
    length += parts[i]!.b - parts[i]!.a - XFADE
    prev = `x${i}`
  }

  return ['-filter_complex', graph.join(';'), '-map', `[${prev}]`, ...flags.split(' ')]
}

type Job = { file: string; args: string[] }

const jobs: Job[] = [
  // Large screens only; a notch more compression than 720p keeps it near 2× the size.
  {
    file: 'reel-1080.webm',
    args: joined(scale(1080), `${COMMON} -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -deadline good`),
  },
  { file: 'reel-1080.mp4', args: joined(scale(1080), `${COMMON} ${X264} -crf 27 -profile:v high`) },
  {
    file: 'reel-720.webm',
    args: joined(scale(720), `${COMMON} -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good`),
  },
  { file: 'reel-720.mp4', args: joined(scale(720), `${COMMON} ${X264} -crf 26 -profile:v high`) },
  { file: 'reel-360.mp4', args: joined(scale(360), `${COMMON} ${X264} -crf 28 -profile:v main`) },
]

// Poster = the loop's first frame by default, so the fade from poster to video doesn't jump.
const loopStart = segments ? segments[0]!.a + XFADE : Number(values.start)
const posterAt = String(loopStart + Number(values['poster-at']))
const posters: Job[] = [
  { file: 'poster.webp', args: vf(scale(1080), `${WEBP} -quality 72`) },
  // ~9:16 centre crop for phones.
  {
    file: 'poster-mobile.webp',
    args: vf(`${scale(900)},crop=min(iw\\,ih*9/16):ih`, `${WEBP} -quality 70`),
  },
]

function run(job: Job, seek: string[]) {
  const out = `${outDir}${job.file}`
  const args = ['-y', '-loglevel', 'error', ...seek, '-i', input!, ...job.args, out]

  if (spawnSync('ffmpeg', args, { stdio: 'inherit' }).status !== 0) {
    throw new Error(`ffmpeg failed on ${job.file}`)
  }
  console.log(`${job.file.padEnd(20)} ${(statSync(out).size / 1024).toFixed(0)} KB`)
}

function dimensions(file: string) {
  const args = '-v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0'
  const probe = spawnSync('ffprobe', [...args.split(' '), file], { encoding: 'utf8' })
  const [width = 0, height = 0] = probe.stdout.trim().split(',').map(Number)

  return { width, height }
}

await mkdir(outDir, { recursive: true })

for (const job of jobs) run(job, trim)
for (const job of posters) run(job, ['-ss', posterAt])

const poster = dimensions(`${outDir}poster.webp`)
const mobile = dimensions(`${outDir}poster-mobile.webp`)

console.log(
  '\nprofile.json → "hero" (write the alt text):\n' +
    JSON.stringify(
      {
        poster: { src: `${OUT}/poster.webp`, alt: '', ...poster },
        posterMobile: { src: `${OUT}/poster-mobile.webp`, alt: '', ...mobile },
        video: {
          webm: `${OUT}/reel-720.webm`,
          mp4: `${OUT}/reel-720.mp4`,
          mobileMp4: `${OUT}/reel-360.mp4`,
          large: { webm: `${OUT}/reel-1080.webm`, mp4: `${OUT}/reel-1080.mp4` },
        },
      },
      null,
      2,
    ),
)
