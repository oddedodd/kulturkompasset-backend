/**
 * Duplikatsjekk for importerte arrangement.
 *
 * Sammenligningen bruker alle tre signalene redaksjonen ba om — dato, sted og
 * navn — men behandler dem ulikt:
 *
 * - Sikre treff (samme starttid, samme sted, samme normaliserte tittel) hoppes
 *   over.
 * - Nærtreff importeres likevel som draft, men med et varsel om hva de ligner
 *   på, slik at redaktøren tar avgjørelsen. Ingenting forsvinner stille.
 *
 * Merk at det sikre treffet krever samme *klokkeslett*, ikke bare samme dag.
 * Et arrangement kan ha flere forestillinger samme dag — «Stakkars Klovn»
 * spilles 14:00 og 18:00 den 19. september — og med bare datosammenligning
 * ville den andre forestillingen blitt slukt som duplikat av den første.
 */
import type {SourceEvent} from './types'
import {normalize, similarity} from './text'
import {osloDateKey, osloDateTimeLabel} from './time'

/** Over dette regnes to titler som «samme navn, litt ulik skrivemåte». */
const TITLE_NEAR = 0.7

/** Når stedet også stemmer, holder en svakere tittellikhet for å flagge. */
const TITLE_NEAR_SAME_VENUE = 0.35

export type ExistingEvent = {
  _id: string
  title?: string
  startsAt?: string
  venueId?: string
  venueName?: string
  importVenueName?: string
  importExternalId?: string
}

/**
 * Stedet kandidaten faktisk havner på etter oppslag mot `venue`-dokumentene.
 *
 * Sammenligningen må gjøres på dette, ikke på råstrengen fra kilden. Kilden
 * skriver «Konsertsalen», mens dokumentet vårt heter «Konsertsalen,
 * Kulturhuset i Namsos» — sammenlignet som tekst ville de aldri møttes, og et
 * ekte duplikat ville sluppet gjennom.
 */
export type CandidateVenue = {id?: string; name?: string}

export type Verdict =
  | {kind: 'new'}
  | {kind: 'duplicate'; reason: string; match: ExistingEvent}
  | {kind: 'similar'; reason: string; match: ExistingEvent}

function venueNameOf(event: ExistingEvent): string {
  return normalize(event.venueName || event.importVenueName)
}

/** Samme sted? Referanse-ID veier tyngst; ellers sammenlignes navnene. */
function sameVenue(candidate: CandidateVenue, other: ExistingEvent): boolean {
  if (candidate.id && other.venueId) return candidate.id === other.venueId

  const a = normalize(candidate.name)
  const b = venueNameOf(other)
  return Boolean(a && b && a === b)
}

/** Starttid avrundet til minutt, som nøkkel for eksakt sammenligning. */
function toMinute(iso?: string | null): number | null {
  if (!iso) return null
  const time = new Date(iso).getTime()
  return Number.isNaN(time) ? null : Math.floor(time / 60000)
}

function describe(event: ExistingEvent): string {
  const date = event.startsAt ? osloDateTimeLabel(event.startsAt) : 'ukjent dato'
  const isDraft = event._id.startsWith('drafts.')
  return `«${event.title || 'uten tittel'}» (${date}${isDraft ? ', kladd' : ''})`
}

export function classify(
  candidate: SourceEvent,
  existing: ExistingEvent[],
  candidateVenue: CandidateVenue = {},
): Verdict {
  // Sterkeste signal: samme arrangement er importert fra samme kilde tidligere.
  const alreadyImported = existing.find(
    (e) => e.importExternalId && e.importExternalId === candidate.externalId,
  )
  if (alreadyImported) {
    return {
      kind: 'duplicate',
      reason: `allerede importert som ${describe(alreadyImported)}`,
      match: alreadyImported,
    }
  }

  const day = osloDateKey(candidate.startsAt)
  const venue: CandidateVenue = {
    id: candidateVenue.id,
    name: candidateVenue.name || candidate.venueName,
  }
  const sameDay = existing.filter((e) => osloDateKey(e.startsAt) === day)

  let nearest: {verdict: Verdict; score: number} | null = null

  for (const other of sameDay) {
    const venueMatch = sameVenue(venue, other)
    const titleScore = similarity(candidate.title, other.title || '')

    const sameStart = toMinute(candidate.startsAt) === toMinute(other.startsAt)

    if (sameStart && venueMatch && normalize(candidate.title) === normalize(other.title)) {
      return {
        kind: 'duplicate',
        reason: `samme starttid, sted og navn som ${describe(other)}`,
        match: other,
      }
    }

    const isNear = titleScore >= TITLE_NEAR || (venueMatch && titleScore >= TITLE_NEAR_SAME_VENUE)
    if (!isNear) continue

    const reason = venueMatch
      ? `samme dato og sted som ${describe(other)}, men tittelen avviker`
      : `samme dato og nesten samme navn som ${describe(other)}`

    if (!nearest || titleScore > nearest.score) {
      nearest = {verdict: {kind: 'similar', reason, match: other}, score: titleScore}
    }
  }

  return nearest ? nearest.verdict : {kind: 'new'}
}
