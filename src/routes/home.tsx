import { getFilms, getProfile, getSocial } from '@/lib/content'
import { ANCHORS } from '@/lib/links'
import { pageMeta, structuredData } from '@/lib/seo'
import type { Route } from './+types/home'

export async function loader() {
  const [profile, social, films] = await Promise.all([getProfile(), getSocial(), getFilms()])

  return { profile, social, films }
}

export function meta({ loaderData }: Route.MetaArgs) {
  const { profile, social, films } = loaderData

  return [
    ...pageMeta({
      title: `${profile.name} — ${profile.roles.join(', ')}`,
      description: profile.summary,
      path: '/',
      siteName: profile.name,
    }),
    structuredData(profile, social, films),
  ]
}

// Phase 0 shell — sections land in Phase 3+.
export default function Home({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData

  return (
    <main id={ANCHORS.main} className="mx-auto max-w-7xl px-gutter py-section">
      <p className="meta text-muted">{profile.eyebrow}</p>
      <h1 className="mt-6 display text-display">{profile.name}</h1>
    </main>
  )
}
