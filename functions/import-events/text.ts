/** Tekstverktøy delt av parserne og duplikatsjekken. */

/**
 * Normaliserer en tittel eller et stedsnavn for sammenligning: små bokstaver,
 * uten tegnsetting, med enkle mellomrom. Norske bokstaver beholdes (\p{L}).
 */
export function normalize(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/**
 * Dice-koeffisient på bokstavpar. Gir et likhetstall mellom 0 og 1 uten å dra
 * inn et eksternt bibliotek — funksjoner bør holdes små.
 */
export function similarity(a: string, b: string): number {
  const x = normalize(a).replace(/\s/g, '')
  const y = normalize(b).replace(/\s/g, '')

  if (!x || !y) return 0
  if (x === y) return 1
  if (x.length < 2 || y.length < 2) return 0

  const bigrams = new Map<string, number>()
  for (let i = 0; i < x.length - 1; i++) {
    const bg = x.slice(i, i + 2)
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1)
  }

  let hits = 0
  for (let i = 0; i < y.length - 1; i++) {
    const bg = y.slice(i, i + 2)
    const count = bigrams.get(bg) || 0
    if (count > 0) {
      bigrams.set(bg, count - 1)
      hits++
    }
  }

  return (2 * hits) / (x.length - 1 + y.length - 1)
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aring: 'å',
  oslash: 'ø',
  aelig: 'æ',
  Aring: 'Å',
  Oslash: 'Ø',
  AElig: 'Æ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES[name] ?? whole)
}

/**
 * HTML-beskrivelse → rene avsnitt. TicketCo leverer beskrivelser som HTML,
 * DX leverer ren tekst; begge går gjennom her.
 */
export function htmlToParagraphs(html?: string | null): string[] {
  if (!html) return []

  return decodeEntities(
    html.replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** Kort ingress til bruk i `summary`. */
export function toSummary(paragraphs: string[], maxLength = 300): string | undefined {
  const first = paragraphs[0]
  if (!first) return undefined
  if (first.length <= maxLength) return first

  const cut = first.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLength).trimEnd()}…`
}

/** URL-vennlig slug med norske bokstaver skrevet om. */
export function slugify(value: string, maxLength = 88): string {
  return (value || '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}
