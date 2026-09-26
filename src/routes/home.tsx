import { Footer } from '@/components/layout/Footer'
import { Loader } from '@/components/layout/Loader'
import { Navbar, type NavItem } from '@/components/layout/Navbar'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Hero } from '@/components/sections/Hero'
import { getFilms, getProfile, getSections, getSocial } from '@/lib/content'
import { ANCHORS, SECTION_IDS, sectionHeadingId, type SectionId } from '@/lib/links'
import { pageMeta, structuredData } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { Route } from './+types/home'

// Module-level so the navbar's scroll effect keeps a stable reference.
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', id: ANCHORS.top },
  { label: 'Work', id: SECTION_IDS.work },
  { label: 'About', id: SECTION_IDS.about },
  { label: 'Clients', id: SECTION_IDS.clients },
  { label: 'Contact', id: ANCHORS.contact },
]

// Paper-toned sections, per the mockup.
const WARM: SectionId[] = [SECTION_IDS.about, SECTION_IDS.clients]

export async function loader() {
  const [profile, social, films, sections] = await Promise.all([
    getProfile(),
    getSocial(),
    getFilms(),
    getSections(),
  ])

  return { profile, social, films, sections }
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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { profile, social, sections } = loaderData

  return (
    <>
      <Loader name={profile.name} />
      <Navbar name={profile.name} items={NAV_ITEMS} social={social} />

      <main id={ANCHORS.main}>
        <Hero profile={profile} />

        {/* Section bodies land in Phases 4–5; headers now so anchors and landmarks work. */}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={sectionHeadingId(section.id)}
            className={cn('py-section', WARM.includes(section.id) && 'tone-warm')}
          >
            <div className="mx-auto max-w-7xl px-gutter">
              <SectionHeader
                label={section.label}
                title={section.title}
                lede={section.lede}
                headingId={sectionHeadingId(section.id)}
              />
            </div>
          </section>
        ))}
      </main>

      <Footer name={profile.name} roles={profile.roles} email={profile.email} social={social} />
    </>
  )
}
