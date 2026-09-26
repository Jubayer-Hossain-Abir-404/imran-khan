// Downloads the YouTube still (1280×720 WebP) for every film, writing video and the channel's featured video, plus the channel picture, into public/. Run: `npm run fetch:thumbnails`.

import { mkdir, readFile, writeFile } from 'node:fs/promises'

type VideoEntry = { youtubeId: string; thumbnail: string }

const root = new URL('../', import.meta.url)

async function readData<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(new URL(`src/data/${name}.json`, root), 'utf8')) as T
}

const [films, writing, channel] = await Promise.all([
  readData<VideoEntry[]>('films'),
  readData<VideoEntry[]>('writing'),
  readData<{ href: string; avatar?: string; featured?: VideoEntry }>('channel'),
])
const videos = [...films, ...writing, ...(channel.featured ? [channel.featured] : [])]

// maxres is 16:9 without letterboxing; sd is the 4:3 fallback when maxres was never generated.
const SOURCES = ['maxresdefault', 'sddefault']

async function download(video: VideoEntry): Promise<boolean> {
  const out = new URL(`public${video.thumbnail}`, root)

  await mkdir(new URL('.', out), { recursive: true })

  for (const source of SOURCES) {
    // Sequential on purpose: try the next size only if this one is missing.
    // oxlint-disable-next-line no-await-in-loop
    const response = await fetch(`https://i.ytimg.com/vi_webp/${video.youtubeId}/${source}.webp`)

    if (!response.ok) continue

    // oxlint-disable-next-line no-await-in-loop
    const bytes = new Uint8Array(await response.arrayBuffer())

    // oxlint-disable-next-line no-await-in-loop
    await writeFile(out, bytes)
    console.log(`${video.youtubeId}  ${source}  ${(bytes.length / 1024).toFixed(0)} KB`)

    return true
  }

  console.error(`${video.youtubeId}: no thumbnail found`)

  return false
}

// Channel picture from the channel page's og:image, resized to 176 px (4× its 44 px display).
async function downloadAvatar(): Promise<boolean> {
  if (!channel.avatar) return true

  const html = await (await fetch(channel.href)).text()
  const src = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]
  const response = src
    ? await fetch(src.replace(/=s\d+[^"]*$/, '=s176-c-k-c0x00ffffff-no-rj'))
    : null

  if (!response?.ok) {
    console.error('channel avatar: not found')

    return false
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  const out = new URL(`public${channel.avatar}`, root)

  await mkdir(new URL('.', out), { recursive: true })
  await writeFile(out, bytes)
  console.log(`avatar  ${(bytes.length / 1024).toFixed(0)} KB`)

  return true
}

const results = await Promise.all([...videos.map(download), downloadAvatar()])

if (results.includes(false)) process.exitCode = 1
