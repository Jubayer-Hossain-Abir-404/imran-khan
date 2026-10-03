import channelData from '@/data/channel.json'
import clientsData from '@/data/clients.json'
import filmsData from '@/data/films.json'
import otherWorkData from '@/data/other-work.json'
import profileData from '@/data/profile.json'
import sectionsData from '@/data/sections.json'
import socialData from '@/data/social.json'
import writingData from '@/data/writing.json'
import { isFactIcon, isSectionId, isSectionTone, isSocialKind } from '@/types'
import type {
  Channel,
  Client,
  Draftable,
  Film,
  OtherWork,
  Profile,
  SectionCopy,
  Social,
  WritingPiece,
} from '@/types'

// The only module that knows where content lives. Async so an API swap only changes these bodies.

// Vite built-in: true under `npm run dev`, false in production builds.
const DEV = import.meta.env.DEV

/** Drafts render in dev only; production builds drop them and warn. */
function published<T extends Draftable>(source: string, entries: T[]): T[] {
  if (DEV) return entries

  const drafts = entries.filter((entry) => entry.draft).length

  if (drafts > 0) console.warn(`[content] ${source}: ${drafts} draft(s) hidden from production`)

  return entries.filter((entry) => !entry.draft)
}

// JSON widens literals to `string`; narrowed here so a typo fails the build.
const profile: Profile = {
  ...profileData,
  facts: profileData.facts.map((fact) => {
    if (!isFactIcon(fact.icon)) throw new Error(`profile.json: unknown fact icon "${fact.icon}"`)

    return { label: fact.label, icon: fact.icon }
  }),
}

if (!DEV && profile.unverified.length > 0) {
  console.warn(`[content] profile.json unverified: ${profile.unverified.join(', ')}`)
}

const sections: SectionCopy[] = sectionsData.map((entry) => {
  if (!isSectionId(entry.id)) throw new Error(`sections.json: unknown section id "${entry.id}"`)

  const tone = entry.tone ?? 'dark'
  if (!isSectionTone(tone))
    throw new Error(`sections.json: unknown tone "${tone}" on "${entry.id}"`)

  return { id: entry.id, label: entry.label, title: entry.title, lede: entry.lede, tone }
})

const social = published<Social>(
  'social.json',
  socialData.map((entry) => {
    if (!isSocialKind(entry.kind)) throw new Error(`social.json: unknown kind "${entry.kind}"`)

    // Cast: the inferred JSON type drops `draft` when no entry sets it.
    const { draft } = entry as { draft?: boolean }

    return { label: entry.label, href: entry.href, kind: entry.kind, draft }
  }),
)

const films = published<Film>('films.json', filmsData)
const writing = published<WritingPiece>('writing.json', writingData)
const otherWork = published<OtherWork>('other-work.json', otherWorkData)
const clients = published<Client>('clients.json', clientsData)
const [channel = null] = published<Channel>('channel.json', [channelData])

export async function getProfile(): Promise<Profile> {
  return profile
}

/** Render order. */
export async function getSections(): Promise<SectionCopy[]> {
  return sections
}

export async function getSocial(): Promise<Social[]> {
  return social
}

export async function getFilms(): Promise<Film[]> {
  return films
}

export async function getWriting(): Promise<WritingPiece[]> {
  return writing
}

/** `null` when Shonggolpo has no published entry. */
export async function getChannel(): Promise<Channel | null> {
  return channel
}

export async function getOtherWork(): Promise<OtherWork[]> {
  return otherWork
}

export async function getClients(): Promise<Client[]> {
  return clients
}
