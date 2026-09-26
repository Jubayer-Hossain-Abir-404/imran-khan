import type { MetaDescriptor } from 'react-router'
import type { Film, Profile, Social } from '@/types'
import { isExternal } from './links'
import { isoDuration, watchUrl } from './youtube'

// Crawlers drop relative og:image URLs, so the origin must be known at build time.
const FALLBACK_ORIGIN = 'https://imran-khan-director.netlify.app'

export const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_ORIGIN).replace(/\/+$/, '')

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

/** Must match the file `scripts/generate-og.ts` writes. */
export const OG_IMAGE_PATH = '/og/default.png'

type PageMetaInput = {
  title: string
  description: string
  path: string
  siteName: string
}

/** Title, description, canonical, Open Graph and Twitter as one block, so none go missing. */
export function pageMeta({ title, description, path, siteName }: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(path)
  const image = absoluteUrl(OG_IMAGE_PATH)

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: String(OG_IMAGE_SIZE.width) },
    { property: 'og:image:height', content: String(OG_IMAGE_SIZE.height) },
    { property: 'og:image:alt', content: title },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]
}

/** Google structured data (JSON-LD): a `Person` and their featured videos. Only facts visible on the page. */
export function structuredData(profile: Profile, social: Social[], films: Film[]): MetaDescriptor {
  const personId = absoluteUrl('/#person')

  return {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': personId,
          name: profile.name,
          jobTitle: profile.roles,
          description: profile.summary,
          url: absoluteUrl('/'),
          ...(profile.portrait ? { image: absoluteUrl(profile.portrait.src) } : {}),
          sameAs: social.filter((entry) => isExternal(entry.href)).map((entry) => entry.href),
        },
        ...films.map((film) => ({
          '@type': 'VideoObject',
          name: film.title,
          genre: film.category,
          thumbnailUrl: absoluteUrl(film.thumbnail),
          url: watchUrl(film.youtubeId),
          embedUrl: `https://www.youtube.com/embed/${film.youtubeId}`,
          ...(film.durationSeconds ? { duration: isoDuration(film.durationSeconds) } : {}),
          creator: { '@id': personId },
        })),
      ],
    },
  }
}
