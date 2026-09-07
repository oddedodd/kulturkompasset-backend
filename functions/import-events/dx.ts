/**
 * Parser for DX-plattformen (Gatsby) — brukes av både Namsos kulturhus og
 * Kulturhuset Kuben i Grong. De to sidene kjører identisk oppsett.
 *
 * Programmet er ikke server-rendret og finnes ikke som eget API. Det ligger
 * bakt inn i byggebundelen `path---kulturprogram-<hash>.js` som et minifisert
 * JS-objektliteral. Hashen endres ved hver ny bygging av kildesiden, så den
 * må leses ut av HTML-en først.
 *
 * Vi tolker ikke JS-en, men leser ut de feltene vi trenger med en
 * strengbevisst skanner. Det er mindre skjørt enn regex alene, fordi
 * skanneren håndterer escapede anførselstegn inne i titler og beskrivelser.
 */
import type {SourceEvent} from './types'
import {parseLocalDateTime} from './time'
import {htmlToParagraphs, toSummary} from './text'
import {normalizeImageUrl} from './images'

/** Leser en JS-streng som starter på indeks `i` (på anførselstegnet). */
function readJsString(input: string, i: number): {value: string; end: number} {
  const quote = input[i]
  const out: string[] = []
  let pos = i + 1

  const escapes: Record<string, string> = {
    n: '\n',
    t: '\t',
    r: '\r',
    b: '\b',
    f: '\f',
  }

  while (pos < input.length) {
    const char = input[pos]

    if (char === '\\') {
      const next = input[pos + 1]
      if (next === 'u') {
        out.push(String.fromCharCode(parseInt(input.slice(pos + 2, pos + 6), 16)))
        pos += 6
        continue
      }
      out.push(escapes[next] ?? next)
      pos += 2
      continue
    }

    if (char === quote) return {value: out.join(''), end: pos + 1}

    out.push(char)
    pos += 1
  }

  throw new Error('Uavsluttet streng i kildebundelen')
}

/**
 * Finner `name:"..."` mellom `start` og `end`, og leser verdien.
 *
 * Grensen er vesentlig: felt som `description` kan være `null` i én post. Uten
 * en øvre grense ville søket da fortsatt inn i *neste* arrangement og hentet
 * feil tekst. Derfor avgrenses hvert oppslag til posten det gjelder.
 */
function readField(input: string, start: number, end: number, name: string): string | undefined {
  const window = input.slice(start, end)
  const match = new RegExp(`(?:^|[,{])${name}:("|')`).exec(window)
  if (!match) return undefined

  const at = start + match.index + match[0].length - 1
  const {value} = readJsString(input, at)
  return value || undefined
}

/**
 * Leser ut forestillingene i `tickets[]` for én post. Hver oppføring gir dato
 * og sted som hører sammen; å blande dato fra én og sted fra en annen ville
 * plassert arrangementet på feil scene.
 */
function readShowings(
  input: string,
  start: number,
  end: number,
): {id: string; date: string; location?: string}[] {
  const ticketsAt = input.indexOf('tickets:[', start)
  if (ticketsAt === -1 || ticketsAt >= end) return []

  const segment = input.slice(ticketsAt, end)
  const entry = /\{id:("|')/g
  const offsets: number[] = []
  let match: RegExpExecArray | null

  while ((match = entry.exec(segment)) !== null) {
    offsets.push(ticketsAt + match.index)
  }

  const showings: {id: string; date: string; location?: string}[] = []

  for (const [i, offset] of offsets.entries()) {
    const stop = offsets[i + 1] ?? end
    const id = readField(input, offset, stop, 'id')
    const date = readField(input, offset, stop, 'date')
    if (!id || !date) continue
    showings.push({id, date, location: readField(input, offset, stop, 'location')})
  }

  return showings
}

/** Henter HTML-en og finner URL-en til bundelen som inneholder programmet. */
async function findProgramBundleUrl(baseUrl: string): Promise<string> {
  const page = await fetch(`${baseUrl}/kulturprogram/`, {
    headers: {'user-agent': 'Kulturkompasset-import/1.0 (+https://kulturkompasset.no)'},
  })

  if (!page.ok) {
    throw new Error(`Kildesiden svarte ${page.status} ${page.statusText}`)
  }

  const html = await page.text()
  const match = /\/path---kulturprogram-[a-z0-9]+\.js/i.exec(html)

  if (!match) {
    throw new Error(
      'Fant ikke programbundelen i HTML-en. Kildesiden kan ha byttet oppsett — parseren må oppdateres.',
    )
  }

  return `${baseUrl}${match[0]}`
}

export async function fetchDxEvents(baseUrl: string): Promise<SourceEvent[]> {
  const bundleUrl = await findProgramBundleUrl(baseUrl)
  const response = await fetch(bundleUrl, {
    headers: {'user-agent': 'Kulturkompasset-import/1.0 (+https://kulturkompasset.no)'},
  })

  if (!response.ok) {
    throw new Error(`Programbundelen svarte ${response.status} ${response.statusText}`)
  }

  const source = await response.text()
  const events: SourceEvent[] = []
  const seen = new Set<string>()

  // Hver post starter med id:"<tall>_culture_culture",title:"…"
  const entry = /\{id:"(\d+_culture_culture)",title:("|')/g
  const starts: {index: number; length: number; externalId: string}[] = []
  let match: RegExpExecArray | null

  while ((match = entry.exec(source)) !== null) {
    starts.push({index: match.index, length: match[0].length, externalId: match[1]})
  }

  for (const [i, start] of starts.entries()) {
    // Posten slutter der den neste begynner. Alle feltoppslag holdes innenfor.
    const base = start.index
    const end = starts[i + 1]?.index ?? source.length

    const {value: title} = readJsString(source, base + start.length - 1)
    const startsAt = parseLocalDateTime(readField(source, base, end, 'begin'))
    if (!title || !startsAt) continue

    const link = readField(source, base, end, 'link')
    const paragraphs = htmlToParagraphs(readField(source, base, end, 'description'))

    const shared = {
      title,
      category: readField(source, base, end, 'category'),
      paragraphs,
      summary: toSummary(paragraphs),
      url: link && link.startsWith('/') ? `${baseUrl}${link}` : link,
      imageUrl: normalizeImageUrl(readField(source, base, end, 'image')),
    }

    // Ett arrangement kan ha flere forestillinger, hver med sin egen dato og
    // sitt eget sted — «Allehelgenskonsert» spilles i Steinkjer Kirke 31.10 og
    // Namsos Kirke 01.11. Dato og sted må derfor leses i par fra samme
    // oppføring i tickets[], og hver forestilling blir sitt eget arrangement.
    const showings = readShowings(source, base, end)

    if (showings.length === 0) {
      // Uten billettoppføringer har vi bare toppnivådatoen å gå på.
      if (seen.has(start.externalId)) continue
      seen.add(start.externalId)
      events.push({...shared, externalId: start.externalId, startsAt})
      continue
    }

    for (const showing of showings) {
      const showingStart = parseLocalDateTime(showing.date)
      if (!showingStart) continue

      const externalId = `${start.externalId}:${showing.id}`
      if (seen.has(externalId)) continue
      seen.add(externalId)

      events.push({
        ...shared,
        externalId,
        startsAt: showingStart,
        venueName: showing.location,
      })
    }
  }

  return events
}
