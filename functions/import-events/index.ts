/**
 * Import av kommunale kulturprogram.
 *
 * Redaktøren trykker «Importer» i studioet, som oppretter et `eventImport`-
 * dokument. Denne funksjonen plukker det opp, henter programmet fra kilden,
 * sjekker mot eksisterende arrangement og skriver nye som kladd. Resultatet
 * patches tilbake på jobbdokumentet, som studioet poller på.
 *
 * Grunnen til at dette kjører som en Sanity Function og ikke i nettleseren:
 * Namsos og Grong sender ingen CORS-headere, så et fetch fra studioet blir
 * blokkert. Bare TicketCo (Nærøysund) hadde fungert direkte.
 */
import {documentEventHandler} from '@sanity/functions'
import {createClient, type SanityClient} from '@sanity/client'

import type {SourceEvent, SourceKey} from './types'
import {SOURCES} from './sources'
import {classify, type ExistingEvent} from './dedupe'
import {slugify} from './text'
import {uploadImage} from './images'
import {matchVenue, type VenueDoc} from './venues'
import {osloDateKey} from './time'

type ImportJob = {
  _id: string
  _type: string
  source?: SourceKey
  status?: string
}

/** Maks antall linjer vi lagrer i loggen på jobbdokumentet. */
const MAX_LOG_LINES = 250

/** FNV-1a. Gir en kort, stabil hash så dokument-ID-en blir forutsigbar. */
function shortHash(value: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(36)
}

/**
 * Stabil dokument-ID per kilde og arrangement. Sammen med
 * `createIfNotExists` gjør den importen idempotent: kjører redaktøren samme
 * import to ganger, blir det ikke to kladder — selv om duplikatsjekken skulle
 * bomme.
 */
function draftIdFor(source: SourceKey, externalId: string): string {
  return `drafts.import-${source}-${slugify(externalId, 40)}-${shortHash(externalId)}`
}

function toBlocks(paragraphs: string[]) {
  return paragraphs.map((text, index) => ({
    _type: 'block',
    _key: `p${index}`,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `p${index}s`, text, marks: []}],
  }))
}

async function loadExisting(client: SanityClient, events: SourceEvent[]): Promise<ExistingEvent[]> {
  if (events.length === 0) return []

  const times = events.map((e) => new Date(e.startsAt).getTime())
  const dayMs = 24 * 60 * 60 * 1000
  const from = new Date(Math.min(...times) - dayMs).toISOString()
  const to = new Date(Math.max(...times) + dayMs).toISOString()

  // Både kladder og publiserte. Vi henter arrangement i samme tidsrom, pluss
  // alt som tidligere er importert med de samme kilde-ID-ene uansett dato —
  // et arrangement kan ha blitt flyttet siden forrige import.
  const query = `*[
    _type == "event" && (
      (defined(startsAt) && startsAt >= $from && startsAt <= $to) ||
      importExternalId in $ids
    )
  ]{
    _id,
    title,
    startsAt,
    importExternalId,
    importVenueName,
    "venueId": venue._ref,
    "venueName": venue->name
  }`

  return client.fetch<ExistingEvent[]>(query, {
    from,
    to,
    ids: events.map((e) => e.externalId),
  })
}

/** Henter stedene og kategoriene kladdene skal kobles mot. */
async function loadLookups(client: SanityClient) {
  const [venues, categories] = await Promise.all([
    client.fetch<VenueDoc[]>('*[_type == "venue"]{_id, name}'),
    client.fetch<{_id: string; title?: string}[]>('*[_type == "category"]{_id, title}'),
  ])

  const categoryByTitle = new Map<string, string>()
  for (const category of categories) {
    const key = (category.title || '').trim().toLowerCase()
    if (key && !categoryByTitle.has(key)) categoryByTitle.set(key, category._id)
  }

  return {venues, categories: categoryByTitle}
}

export const handler = documentEventHandler<ImportJob>(async ({context, event}) => {
  const job = event.data
  const client = createClient({
    ...context.clientOptions,
    apiVersion: '2025-01-01',
    useCdn: false,
  })

  const source = job.source ? SOURCES[job.source] : undefined
  if (!source) {
    await client
      .patch(job._id)
      .set({
        status: 'failed',
        message: `Ukjent kilde: ${job.source}`,
        finishedAt: new Date().toISOString(),
      })
      .commit()
    return
  }

  await client.patch(job._id).set({status: 'running', startedAt: new Date().toISOString()}).commit()

  const log: string[] = []
  let created = 0
  let skipped = 0
  let flagged = 0

  // Forestillinger av samme arrangement deler bilde — «Barnas lørdag» har sju.
  // Uten denne ville samme fil blitt lastet ned og opp én gang per forestilling
  // og gitt like mange identiske assets i Sanity.
  const assetsByUrl = new Map<string, string>()

  try {
    const found = await source.fetchEvents()
    const [existing, lookups] = await Promise.all([
      loadExisting(client, found),
      loadLookups(client),
    ])

    // Kladder vi allerede har laget for disse arrangementene. Sjekken gjøres
    // før nedlasting av bilder, så en gjentatt import verken laster ned eller
    // laster opp noe på nytt.
    const draftIds = new Map(
      found.map((candidate) => [
        candidate.externalId,
        draftIdFor(source.key, candidate.externalId),
      ]),
    )
    const alreadyDrafted = new Set(
      await client.fetch<string[]>('*[_id in $ids]._id', {ids: [...draftIds.values()]}),
    )

    for (const candidate of found) {
      const draftId = draftIds.get(candidate.externalId) as string
      const when = osloDateKey(candidate.startsAt)

      if (alreadyDrafted.has(draftId)) {
        skipped++
        if (log.length < MAX_LOG_LINES) {
          log.push(`Hoppet over «${candidate.title}» (${when}) — importert som kladd tidligere.`)
        }
        continue
      }

      // Stedet slås opp før duplikatsjekken, slik at sammenligningen bruker
      // samme sted som kladden faktisk får.
      const venueMatch = source.fixedVenueName
        ? matchVenue(source.fixedVenueName, lookups.venues)
        : matchVenue(candidate.venueName, lookups.venues)

      const verdict = classify(candidate, existing, {
        id: venueMatch?.id,
        name: venueMatch?.name,
      })

      if (verdict.kind === 'duplicate') {
        skipped++
        if (log.length < MAX_LOG_LINES) {
          log.push(`Hoppet over «${candidate.title}» (${when}) — ${verdict.reason}.`)
        }
        continue
      }

      // Grong spiller alt i Kuben, uansett hva kilden kaller salen
      // («Symfoni Namsen», «Grong Sparebanksalen»). For de andre kildene
      // matcher vi så godt vi kan, og lar heller feltet stå tomt enn å gjette.
      if (!venueMatch && candidate.venueName && log.length < MAX_LOG_LINES) {
        log.push(
          `Fant ikke sted for «${candidate.title}» — kilden oppgir «${candidate.venueName}». Feltet står tomt.`,
        )
      }

      const categoryId = candidate.category
        ? lookups.categories.get(candidate.category.trim().toLowerCase())
        : undefined

      const warning =
        verdict.kind === 'similar'
          ? `Mulig duplikat: ${verdict.reason}. Sjekk før publisering.`
          : undefined

      // Bildet lastes ned og legges inn som asset. Feiler det, skal ikke hele
      // arrangementet gå tapt — vi noterer det i loggen og importerer uten.
      let heroAssetId: string | undefined
      if (candidate.imageUrl) {
        heroAssetId = assetsByUrl.get(candidate.imageUrl)

        if (!heroAssetId) {
          try {
            heroAssetId = await uploadImage(
              client,
              candidate.imageUrl,
              `${slugify(candidate.title, 40)}.jpg`,
            )
            assetsByUrl.set(candidate.imageUrl, heroAssetId)
          } catch (imageError) {
            const reason = imageError instanceof Error ? imageError.message : String(imageError)
            if (log.length < MAX_LOG_LINES) {
              log.push(`Bildet til «${candidate.title}» kunne ikke hentes — ${reason}.`)
            }
          }
        }
      }

      const doc = {
        _id: draftId,
        _type: 'event',
        title: candidate.title,
        slug: {_type: 'slug', current: `${slugify(candidate.title, 70)}-${when}`},
        status: 'upcoming',
        startsAt: candidate.startsAt,
        ...(candidate.endsAt ? {endsAt: candidate.endsAt} : {}),
        ...(venueMatch ? {venue: {_type: 'reference', _ref: venueMatch.id}} : {}),
        ...(categoryId
          ? {categories: [{_type: 'reference', _ref: categoryId, _key: 'imported'}]}
          : {}),
        ...(heroAssetId
          ? {
              heroImage: {
                _type: 'image',
                asset: {_type: 'reference', _ref: heroAssetId},
                alt: candidate.title,
              },
            }
          : {}),
        ...(candidate.summary ? {summary: candidate.summary} : {}),
        ...(candidate.paragraphs.length ? {body: toBlocks(candidate.paragraphs)} : {}),
        ...(candidate.url ? {ticketUrl: candidate.url} : {}),
        importSource: source.key,
        importExternalId: candidate.externalId,
        importedAt: new Date().toISOString(),
        ...(candidate.venueName ? {importVenueName: candidate.venueName} : {}),
        ...(candidate.imageUrl ? {importImageUrl: candidate.imageUrl} : {}),
        ...(warning ? {importWarning: warning} : {}),
      }

      await client.createIfNotExists(doc)
      created++

      if (verdict.kind === 'similar') {
        flagged++
        if (log.length < MAX_LOG_LINES) {
          log.push(`Flagget «${candidate.title}» (${when}) — ${verdict.reason}.`)
        }
      } else if (log.length < MAX_LOG_LINES) {
        log.push(`Opprettet «${candidate.title}» (${when}).`)
      }
    }

    const message =
      `${found.length} arrangement hentet fra ${source.label}. ` +
      `${created} nye kladder (${flagged} flagget som mulig duplikat), ${skipped} hoppet over.`

    await client
      .patch(job._id)
      .set({
        status: 'done',
        finishedAt: new Date().toISOString(),
        found: found.length,
        created,
        skipped,
        flagged,
        message,
        log,
      })
      .commit()

    console.log(message)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    await client
      .patch(job._id)
      .set({
        status: 'failed',
        finishedAt: new Date().toISOString(),
        found: 0,
        created,
        skipped,
        flagged,
        message: `Importen feilet: ${message}`,
        log,
      })
      .commit()

    console.error('Import feilet', error)
  }
})
