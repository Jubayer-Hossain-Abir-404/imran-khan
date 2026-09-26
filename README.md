# Imran Khan — Portfolio

Single-page portfolio for Imran Khan, director and screenwriter. It's a statically prerendered React site deployed on Netlify: a hero with a background reel, a filmography of YouTube films, writer/creator work, about, other works, clients and a contact footer.

---

## Tech stack

| Area              | Choice                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framework         | React 19 + React Router 8 (framework mode, `ssr: false`, `prerender: ['/']`), so `/` ships as real HTML                    |
| Build             | Vite 8, TypeScript 6                                                                                                       |
| Styling           | Tailwind CSS 4 (tokens in `@theme`), `tw-animate-css`                                                                      |
| UI primitives     | shadcn on Base UI (`Dialog`, `Button` in `src/components/ui/`)                                                             |
| Icons             | `lucide-react`. Brand icons are inline Simple Icons paths (CC0) because Lucide v1 has none                                 |
| Fonts             | Fontsource, self-hosted: Cormorant Garamond 500/600 (display), Geist Variable (body), Mrs Saint Delafield (signature only) |
| Video             | YouTube `youtube-nocookie.com` embeds, created on click. Self-hosted MP4/WebM for the hero loop                            |
| Quality           | oxlint, Prettier (+ Tailwind plugin), `tsc`, a custom WCAG contrast check                                                  |
| Build-time assets | `@resvg/resvg-js` for the OG image and the apple-touch-icon                                                                |
| Hosting           | Netlify (`netlify.toml`)                                                                                                   |

There is no backend, no CMS and no `.env`. All content is JSON in the repo.

---

## Setup

Requirements: **Node 24+**. The scripts in `scripts/` are `.ts` files that Node runs directly using native type stripping.

```bash
npm install
npm run dev          # http://localhost:5173
```

### Commands

| Command                         | What it does                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                   | Dev server. **Draft content is visible**                                                                      |
| `npm run build`                 | `react-router build`, then `build:assets` (OG image, touch icon, sitemap, robots) into `build/client/`        |
| `npm run start`                 | Preview the production build                                                                                  |
| `npm run typecheck`             | Route typegen + `tsc --noEmit`                                                                                |
| `npm run lint` / `lint:fix`     | oxlint (0 warnings expected)                                                                                  |
| `npm run format`                | Prettier                                                                                                      |
| `npm run check:contrast`        | WCAG contrast for every text/background token pair, parsed from `index.css`                                   |
| `npm run fetch:thumbnails`      | Downloads YouTube stills for films, writing and the channel feature into `public/media/`                      |
| `npm run encode:hero -- <file>` | Encodes the hero reel and its posters (needs ffmpeg). See [Replacing the hero reel](#replacing-the-hero-reel) |

Before pushing, run `lint`, `typecheck`, `build` and `check:contrast`.

### Environment

The only custom variable is `VITE_SITE_URL`, the absolute origin used for canonical URLs, `og:image` and the sitemap. On Netlify, `netlify.toml` sets it from `$URL`. Locally it falls back to `https://imran-khan.netlify.app` (see `src/lib/seo.ts`, `scripts/generate-*.ts`).

### Deploy

When you push, Netlify builds with `VITE_SITE_URL=$URL npm run build` and publishes `build/client`. Only `/` is prerendered, and any other path returns a real 404. Deploy previews and branch deploys get `X-Robots-Tag: noindex`.

---

## Project structure

```
netlify.toml               build, 404 rule, security + cache headers, noindex previews
react-router.config.ts     ssr:false, prerender ['/']
scripts/
  check-contrast.ts        WCAG check over --ik-* tokens
  fetch-thumbnails.ts      YouTube stills → public/media/{films,writing,channel}/
  encode-hero.ts           reel → WebM/MP4 loops + posters (ffmpeg)
  generate-og.ts           og/default.png + apple-touch-icon.png (build output)
  generate-sitemap.ts      sitemap.xml + robots.txt (build output)
  fonts/                   TTFs for resvg (it can't read woff2)
public/
  favicon.svg
  media/                   hero/, films/, writing/, channel/, clients/, placeholders/, portrait
src/
  root.tsx                 document shell, loader script, font preloads, skip link, error boundary
  routes/home.tsx          loader (content → sections + nav), meta, JSON-LD, section switch
  data/*.json              ALL content (see below)
  types/                   content types + type guards
  lib/
    content/               repository: the only module allowed to import src/data
    links.ts               section ids, anchors, link helpers
    seo.ts                 SITE_URL, pageMeta(), structuredData(), OG_IMAGE_PATH
    youtube.ts             embed/watch/playlist URLs, duration formatting
  styles/index.css         design tokens, tone-warm, utilities (meta, display, reveal, grain, loader)
  components/
    layout/                Navbar, Footer, Loader, Section, SectionHeader, social links
    motion/                Reveal (scroll reveal), useMotionSafe
    video/                 FilmCard, VideoModal, useVideoModal
    sections/<section>/    hero, filmography, writer-creator, about, other-work, clients
    ui/                    shadcn primitives
```

Components are grouped by the section they belong to. Anything shared across sections lives in `layout/`, `video/` or `motion/`.

---

## Content

### Flow

```
src/data/*.json  →  src/lib/content/repository.ts  →  routes/home.tsx loader  →  section components
```

- **The repository is the only door.** A lint rule (`no-restricted-imports`) blocks `@/data` imports anywhere else. The repository's functions are async, so moving content to an API later only changes their bodies.
- **Validated at build.** JSON widens literals to `string`, so enum-like fields (`icon`, `kind`, section `id`) are narrowed with type guards. A typo fails the build.
- **Drafts.** An entry with `"draft": true` renders in `npm run dev` only. Production drops it, and the build prints `[content] <file>: N draft(s) hidden`.
- **Unverified.** `profile.json` is a singleton, so instead of `draft` it has `unverified: string[]`. Those fields still ship, and the build lists them as a reminder.
- **Empty sections disappear.** The home loader computes `hasContent` per section and removes empty sections and their nav items. For example, Clients drops out when every client is a draft.
- **Section copy** (eyebrow label, title, lede) lives in `sections.json`, and its order is the render order.

### Files

| File                                 | Holds                                                                                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile.json`                       | Name, roles, eyebrow, summary, bio, portrait, quote, facts, email, **hero media**, `unverified`                                                                |
| `films.json`                         | Selected Works: `youtubeId`, `title` (cleaned), `youtubeTitle` (verbatim), `category`, `playlistId`, `durationSeconds`, `thumbnail`, optional `objectPosition` |
| `writing.json`                       | Writer/Creator videos (same `Video` shape + `category`)                                                                                                        |
| `channel.json`                       | Shongolpo channel: description, URL, featured video                                                                                                            |
| `other-work.json`                    | Other Works cards (image, description, optional `href`)                                                                                                        |
| `clients.json` / `testimonials.json` | Logos (with display `width`/`height`) and quotes                                                                                                               |
| `social.json`                        | Footer social links                                                                                                                                            |
| `sections.json`                      | Per-section copy and order                                                                                                                                     |

### Adding a film

1. Add an entry to `films.json` with `youtubeId`, `title`, `youtubeTitle`, `category`, `durationSeconds` and `"thumbnail": "/media/films/<id>.webp"`.
2. Run `npm run fetch:thumbnails`. It tries YouTube's `maxresdefault` and falls back to `sddefault`.
3. If the thumbnail has baked-in letterbox bars or the subject sits near an edge, set `objectPosition` (for example `"center 30%"`). Cards are cropped to 2.39:1.

---

## How media is displayed

The rule throughout is that **nothing heavy loads before it's needed, and nothing moves for visitors who ask for reduced motion.**

### Hero: poster first, loop second

`src/components/sections/hero/HeroVideo.tsx`, fed by `profile.hero`:

```jsonc
"hero": {
  "poster":       { "src", "alt", "width", "height" },  // required
  "posterMobile": { ... },                             // optional, ≤767 px
  "video": { "webm"?, "mp4", "mobileMp4"? }            // optional
}
```

Only the poster is required, so the hero works at every stage of the asset pipeline.

1. **The poster is always rendered**, including in the prerendered HTML: a `<picture>` with `fetchPriority="high"`, plus an optional `posterMobile` `<source>` for ≤767 px. This is what first paint and crawlers see.
2. **The video never exists in the prerendered HTML.** Its viewport state starts as `null` and is only set after mount, so SSR output and hydration match.
3. **After mount, the source is chosen:**

   | Condition                                       | Result                      |
   | ----------------------------------------------- | --------------------------- |
   | No `video`, or `prefers-reduced-motion: reduce` | Poster only                 |
   | Viewport ≥ 768 px                               | `webm` (if present) + `mp4` |
   | Viewport < 768 px and `mobileMp4` set           | `mobileMp4` only            |
   | Viewport < 768 px, no `mobileMp4`               | Poster only                 |

   The choice follows live changes to viewport size and to the motion setting. The `<video>` is keyed by its source, so a breakpoint change remounts it and the browser picks again.

4. **The video is `autoplay muted loop playsInline aria-hidden`**, sits over the poster at opacity 0, and **fades in (1 s) only on the `playing` event**. A slow or failed video never replaces a good poster with a black frame.
5. **A pause/play button** (WCAG 2.2.2) appears once the video is playing. It's a sibling of the media layer, so it stacks above the gradient overlays.

Measured on the production build, throttled to slow 4G with 4× CPU: the mobile reel starts downloading around 2.2 s, well after LCP (~1.1–1.5 s, the hero `<h1>`). The loop never competes with first paint.

### Intro loader

`src/components/layout/Loader.tsx`. A split-panel intro (the name rises out of a mask and a hairline draws under it) that runs **before hydration**:

- A self-contained inline `<head>` script (`intro.toString()` + a `TIMING` JSON) only toggles `data-loading` on `<html>`. It has no imports, no async/await and no spread, because it's serialised as-is.
- It's ready when **fonts are loaded and the hero poster is decoded**, held for at least 700 ms and capped at 1100 ms. A 3 s safety timeout always clears it.
- Exit: `data-loading="exit"` → content fades up → panels part. The hero's `rise` animation starts as they open.
- It's **skipped** for reduced motion and on repeat visits in the same session (`sessionStorage['ik-intro']`).

The display and body fonts are `<link rel="preload">`-ed in `root.tsx`, so they download alongside the CSS. That shortens both the loader and LCP.

### Film and video cards → modal

`components/video/FilmCard.tsx`, `VideoModal.tsx`, `useVideoModal.ts`. Selected Works, Writer/Creator and the channel feature all use this pattern:

- **Thumbnails are self-hosted** WebP (`public/media/...`, 16–130 KB) with `loading="lazy"`, so the page makes no third-party image requests.
- **The card is a real `<a href="youtube.com/watch?...">`.** A plain left click opens the modal. Modified clicks (new tab, etc.) and no-JS visitors go to YouTube.
- **The iframe exists only while the modal is open.** It uses `youtube-nocookie.com` with autoplay, and closing unmounts it, which stops playback. Until a click, the page loads no YouTube scripts or cookies.
- On close, focus returns to the card that opened the modal (`finalFocus` = opener ref, since Safari doesn't focus links on click).
- The modal footer shows the verbatim YouTube title, a playlist link (films only) and "Watch on YouTube".

### Other images

- **Other Works:** image cards. The whole card opens a detail dialog, with a "Visit" link when `href` is set.
- **Client logos:** SVGs with explicit `width`/`height` in `clients.json`, which prevents layout shift.
- **Portrait:** explicit dimensions, lazy.

### Motion

- `Reveal` fades and rises content on scroll with one stagger scale (`step × 80 ms`).
- There are two transition speeds: 300 ms for UI (Tailwind's default, remapped) and 700 ms for images and reveals, both on `ease-cinema`.
- A global `prefers-reduced-motion` rule sets every transition and animation to ~0. The loader and hero loop are skipped entirely.

### Replacing the hero reel

```bash
npm run encode:hero -- path/to/reel.mov --start 2 --duration 35
```

The script writes `public/media/hero/`:

- `reel-720.webm`: VP9 at 720p
- `reel-720.mp4`: H.264 at 720p, faststart
- `reel-360.mp4`: H.264 at 360p, for mobile
- `poster.webp`: up to 1080p
- `poster-mobile.webp`: 9:16 centre crop

Every output is muted, 24 fps and never upscaled. **The poster is taken from the loop's first frame by default** (`--poster-at` to change it), so the fade from poster to video doesn't jump. The script prints the `hero` JSON to paste into `profile.json`. Fill in the `alt` text, then delete the old files and remove the hero entries from `unverified`.

Needs `ffmpeg` and `ffprobe` on `PATH`, built with libx264, libvpx-vp9 and libwebp.

---

## SEO and social

- `pageMeta()` in `seo.ts` emits the title, description, canonical, Open Graph and Twitter tags as one block.
- `structuredData()` emits JSON-LD: a `Person` plus a `VideoObject` for each film.
- `scripts/generate-og.ts` renders a 1200×630 `og/default.png` (name, roles, favicon mark on the dark palette) and `apple-touch-icon.png` at build time. They're build output, not committed, and they don't exist under `npm run dev`.
- `scripts/generate-sitemap.ts` writes `sitemap.xml` and `robots.txt`. Its path list must match `prerender` in `react-router.config.ts`.

---

## Conventions

- **Design tokens** are `--ik-*` in `src/styles/index.css`. The palette is fixed dark, with no theme toggle. The `tone-warm` utility re-points the same tokens for the paper sections (About, Clients). After any token change, run `npm run check:contrast`.
- **Spacing rhythm:** `py-section` between sections and `mt-stack` from header to content. Avoid ad-hoc gaps.
- **Imports:** use the `@/` alias. Never import `@/data` outside the repository.
- **Scripts:** `.ts` only, with erasable syntax (`import type`, no enums), so Node can strip the types.
- **Comments:** short and precise, one line where possible.
