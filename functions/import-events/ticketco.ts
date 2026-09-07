/**
 * Parser for TicketCo — brukes av Kultur i Nærøysund.
 *
 * TicketCo server-rendrer sidene og legger ut hvert arrangement som
 * schema.org-JSON-LD. Det er den ryddigste av de tre kildene: vi trenger bare
 * å plukke ut `<script type="application/ld+json">`-blokkene og lese Event-
 * objektene. Merk at taggene bruker enkle anførselstegn.
 */
import type {SourceEvent} from './types'
import {parseLocalDateTime} from './time'
import {htmlToParagraphs, toSummary} from './text'
import {normalizeImageUrl} from './images'

type JsonLdEvent = {
  '@type'?: string
  name?: string
  description?: string
  url?: string
  image?: string
  startDate?: string
  endDate?: string
  eventStatus?: string
  location?: {name?: string}
}

export async function fetchTicketcoEvents(pageUrl: string): Promise<SourceEvent[]> {
  const response = await fetch(pageUrl, {
    headers: {'user-agent': 'Kulturkompasset-import/1.0 (+https://kulturkompasset.no)'},
  })

  if (!response.ok) {
    throw new Error(`Kildesiden svarte ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const blocks = html.matchAll(
    /<script[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi,
  )

  const events: SourceEvent[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    let parsed: unknown
    try {
      parsed = JSON.parse(block[1].trim())
    } catch {
      continue // Ikke alle ld+json-blokker på siden er arrangement.
    }

    const data = parsed as JsonLdEvent
    if (data['@type'] !== 'Event') continue

    const startsAt = parseLocalDateTime(data.startDate)
    if (!data.name || !startsAt) continue

    // TicketCo har ingen egen ID i JSON-LD-en; URL-en er stabil og unik.
    const externalId = data.url || `${data.name}-${data.startDate}`
    if (seen.has(externalId)) continue
    seen.add(externalId)

    const paragraphs = htmlToParagraphs(data.description)

    events.push({
      externalId,
      title: data.name,
      startsAt,
      endsAt: parseLocalDateTime(data.endDate) || undefined,
      venueName: data.location?.name,
      paragraphs,
      summary: toSummary(paragraphs),
      url: data.url,
      imageUrl: normalizeImageUrl(data.image),
    })
  }

  return events
}
