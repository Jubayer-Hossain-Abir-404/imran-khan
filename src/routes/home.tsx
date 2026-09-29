import { Footer } from '@/components/layout/Footer'
import { Loader } from '@/components/layout/Loader'
import { Navbar, type NavItem } from '@/components/layout/Navbar'
import { About } from '@/components/sections/about/About'
import { Clients } from '@/components/sections/clients/Clients'
import { Filmography } from '@/components/sections/filmography/Filmography'
import { Hero } from '@/components/sections/hero/Hero'
import { OtherWorks } from '@/components/sections/other-work/OtherWorks'
import { WriterCreator } from '@/components/sections/writer-creator/WriterCreator'
import {
  getChannel,
  getClients,
  getFilms,
  getOtherWork,
  getProfile,
  getSections,
  getSocial,
  getTestimonials,
  getWriting,
} from '@/lib/content'
import { ANCHORS, SECTION_IDS, type SectionId } from '@/lib/links'
import { pageMeta, structuredData } from '@/lib/seo'
import type { SectionCopy } from '@/types'
import type { Route } from './+types/home'

// Nav candidates; section items drop out when their section is hidden.
const NAV: NavItem[] = [
  { label: 'Home', id: ANCHORS.top },
  { label: 'Work', id: SECTION_IDS.work },
  { label: 'About', id: SECTION_IDS.about },
  { label: 'Clients', id: SECTION_IDS.clients },
  { label: 'Contact', id: ANCHORS.contact },
]

export async function loader() {
  const [profile, social, films, allSections, writing, channel, otherWork, clients, testimonials] =
    await Promise.all([
      getProfile(),
      getSocial(),
      getFilms(),
      getSections(),
      getWriting(),
      getChannel(),
      getOtherWork(),
      getClients(),
      getTestimonials(),
    ])

  // A section with nothing published is hidden, along with its nav item.
  const hasContent: Record<SectionId, boolean> = {
    [SECTION_IDS.work]: films.length > 0,
    [SECTION_IDS.writing]: writing.length > 0 || channel !== null,
    [SECTION_IDS.about]: true,
    [SECTION_IDS.other]: otherWork.length > 0,
    [SECTION_IDS.clients]: clients.length > 0 || testimonials.length > 0,
  }

  const sections = allSections.filter((section) => hasContent[section.id])
  const navItems = NAV.filter(
    (item) => !(item.id in hasContent) || hasContent[item.id as SectionId],
  )

  return {
    profile,
    social,
    films,
    sections,
    navItems,
    writing,
    channel,
    otherWork,
    clients,
    testimonials,
  }
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
  const { profile, social, films, sections, navItems } = loaderData

  const renderSection = (copy: SectionCopy) => {
    switch (copy.id) {
      case SECTION_IDS.work:
        return <Filmography key={copy.id} copy={copy} films={films} />
      case SECTION_IDS.writing:
        return (
          <WriterCreator
            key={copy.id}
            copy={copy}
            writing={loaderData.writing}
            channel={loaderData.channel}
          />
        )
      case SECTION_IDS.about:
        return <About key={copy.id} copy={copy} profile={profile} />
      case SECTION_IDS.other:
        return <OtherWorks key={copy.id} copy={copy} works={loaderData.otherWork} />
      case SECTION_IDS.clients:
        return (
          <Clients
            key={copy.id}
            copy={copy}
            clients={loaderData.clients}
            testimonials={loaderData.testimonials}
          />
        )
    }
  }

  return (
    <>
      <Loader name={profile.name} roles={profile.roles} />
      {/* `navItems` comes from loaderData, so its reference is stable for the navbar's effect. */}
      <Navbar name={profile.name} items={navItems} />

      <main id={ANCHORS.main}>
        <Hero profile={profile} />
        {sections.map(renderSection)}
      </main>

      <Footer
        name={profile.name}
        roles={profile.roles}
        location={profile.location}
        email={profile.email}
        social={social}
      />
    </>
  )
}
