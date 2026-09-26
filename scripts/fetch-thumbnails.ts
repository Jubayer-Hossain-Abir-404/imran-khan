// Downloads the YouTube still (1280×720 WebP) for every film, writing video and the channel's featured video into public/. Run: `npm run fetch:thumbnails`.

import { mkdir, readFile, writeFile } from 'node:fs/promises'

type VideoEntry = { youtubeId: string; thumbnail: string }

const root = new URL('../', import.meta.url)

async function readData<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(new URL(`src/data/${name}.json`, root), 'utf8')) as T
}

const [films, writing, channel] = await Promise.all([
  readData<VideoEntry[]>('films'),
  readData<VideoEntry[]>('writing'),
  readData<{ featured?: VideoEntry }>('channel'),
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

const results = await Promise.all(videos.map(download))

if (results.includes(false)) process.exitCode = 1
