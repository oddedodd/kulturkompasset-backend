/**
 * Bilder fra kildene.
 *
 * Begge plattformene serverer nedskalerte varianter i programlistene. Vi vil ha
 * originalen inn i Sanity, så URL-en normaliseres før nedlasting:
 *
 * - DX (Namsos, Grong) styrer størrelsen med query-parametere:
 *   `…/195120.jpg?w=370&h=250&fit=crop&…` gir 12,9 kB, mens URL-en uten
 *   parametere gir 57,5 kB.
 * - TicketCo (Nærøysund) legger miniatyren på `thumb_file-` og fullversjonen på
 *   `default_file-`: 10,1 kB mot 137,6 kB.
 */
import type {SanityClient} from '@sanity/client'

/** Bilder over denne grensen hoppes over, så én kilde ikke velter importen. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

/** Fjerner alle query-parametere og peker TicketCo-miniatyrer til originalen. */
export function normalizeImageUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return undefined
  }

  url.search = ''
  url.hash = ''
  url.pathname = url.pathname.replace('/thumb_file-', '/default_file-')

  return url.toString()
}

function filenameFor(url: string, fallback: string): string {
  try {
    const name = new URL(url).pathname.split('/').filter(Boolean).pop()
    if (name && /\.[a-z0-9]{2,5}$/i.test(name)) return name
  } catch {
    // Faller gjennom til reservenavnet.
  }
  return fallback
}

/**
 * Laster ned bildet og legger det inn som asset i Sanity. Returnerer asset-ID,
 * eller kaster med en forklarende melding som havner i importloggen.
 */
export async function uploadImage(
  client: SanityClient,
  url: string,
  fallbackName: string,
): Promise<string> {
  const response = await fetch(url, {
    headers: {'user-agent': 'Kulturkompasset-import/1.0 (+https://kulturkompasset.no)'},
  })

  if (!response.ok) {
    throw new Error(`bildet svarte ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) {
    throw new Error(`uventet innholdstype «${contentType || 'ukjent'}»`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength === 0) throw new Error('bildet var tomt')
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`bildet er for stort (${Math.round(buffer.byteLength / 1024 / 1024)} MB)`)
  }

  const asset = await client.assets.upload('image', buffer, {
    filename: filenameFor(url, fallbackName),
    contentType,
  })

  return asset._id
}
