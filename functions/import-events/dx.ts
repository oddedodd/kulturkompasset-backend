/**
 * Parser for DX-plattformen (Gatsby) — brukes av både Namsos kulturhus og
 * Kulturhuset Kuben i Grong. De to sidene kjører identisk oppsett.
 *
 * Programmet er ikke server-rendret og finnes ikke som eget API. Det ligger i
 * Gatsbys sidedata på `/page-data/kulturprogram/page-data.json`, nøstet inne i
 * sidens blokker. Vi leter derfor etter postene i stedet for å låse oss til en
 * bestemt sti, slik at en ny blokkrekkefølge hos kilden ikke ødelegger importen.
 */
import type {SourceEvent} from './types'
import {parseLocalDateTime} from './time'
import {htmlToParagraphs, toSummary} from './text'
import {normalizeImageUrl} from './images'

type DxTicket = {
  id?: string | null
  date?: string | null
  location?: string | null
}

type DxEvent = {
  id: string
  title?: string | null
  image?: string | null
  description?: string | null
  link?: string | null
  category?: string | null
  begin?: string | null
  tickets?: DxTicket[] | null
}

const EVENT_ID = /^\d+_culture_culture$/

/** Går gjennom hele sidedataen og samler alle objekter som er arrangementsposter. */
function collectEvents(node: unknown, found: DxEvent[] = []): DxEvent[] {
  if (Array.isArray(node)) {
    for (const item of node) collectEvents(item, found)
  } else if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (typeof record.id === 'string' && EVENT_ID.test(record.id)) {
      found.push(record as DxEvent)
    } else {
      for (const value of Object.values(record)) collectEvents(value, found)
    }
  }
  return found
}

export async function fetchDxEvents(baseUrl: string): Promise<SourceEvent[]> {
  const response = await fetch(`${baseUrl}/page-data/kulturprogram/page-data.json`, {
    headers: {'user-agent': 'Kulturkompasset-import/1.0 (+https://kulturkompasset.no)'},
  })

  if (!response.ok) {
    throw new Error(`Programdataen svarte ${response.status} ${response.statusText}`)
  }

  const posts = collectEvents(await response.json())

  if (posts.length === 0) {
    throw new Error(
      'Fant ingen arrangement i programdataen. Kildesiden kan ha byttet oppsett — parseren må oppdateres.',
    )
  }

  const events: SourceEvent[] = []
  const seen = new Set<string>()

  for (const post of posts) {
    const title = post.title ?? undefined
    const startsAt = parseLocalDateTime(post.begin ?? undefined)
    if (!title || !startsAt) continue

    const link = post.link ?? undefined
    const paragraphs = htmlToParagraphs(post.description ?? undefined)

    const shared = {
      title,
      category: post.category ?? undefined,
      paragraphs,
      summary: toSummary(paragraphs),
      url: link && link.startsWith('/') ? `${baseUrl}${link}` : link,
      imageUrl: normalizeImageUrl(post.image ?? undefined),
    }

    // Ett arrangement kan ha flere forestillinger, hver med sin egen dato og
    // sitt eget sted — «Allehelgenskonsert» spilles i Steinkjer Kirke 31.10 og
    // Namsos Kirke 01.11. Dato og sted må derfor leses i par fra samme
    // oppføring i tickets[], og hver forestilling blir sitt eget arrangement.
    const showings = (post.tickets ?? []).filter((ticket) => ticket.id && ticket.date)

    if (showings.length === 0) {
      // Uten billettoppføringer har vi bare toppnivådatoen å gå på.
      if (seen.has(post.id)) continue
      seen.add(post.id)
      events.push({...shared, externalId: post.id, startsAt})
      continue
    }

    for (const showing of showings) {
      const showingStart = parseLocalDateTime(showing.date ?? undefined)
      if (!showingStart) continue

      const externalId = `${post.id}:${showing.id}`
      if (seen.has(externalId)) continue
      seen.add(externalId)

      events.push({
        ...shared,
        externalId,
        startsAt: showingStart,
        venueName: showing.location ?? undefined,
      })
    }
  }

  return events
}
