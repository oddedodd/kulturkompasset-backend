/**
 * Kobling fra kildens stedsnavn til `venue`-dokumentene våre.
 *
 * Kildene skriver stedsnavn fritt, og de stemmer sjelden tegn for tegn med
 * navnene i Sanity: «Kunstmuseet Nord-Trøndelag» mot «Kunstmuseet NordTrøndelag»,
 * «Fyret» mot «Fyret Flerbrukshall», «Konsertsalen» mot «Konsertsalen,
 * Kulturhuset i Namsos». Derfor matches det i flere trinn, fra strengest til
 * løsest, og et treff godtas bare over en terskel.
 *
 * Finner vi ingenting, lar vi stedet stå tomt. Et tomt felt redaktøren fyller
 * ut er langt bedre enn et arrangement plassert på feil scene.
 */
import {normalize, similarity} from './text'

/** Under denne skåren regner vi det som «ikke funnet». */
const ACCEPT_SCORE = 0.82

/** Kortere navn enn dette er for tvetydige til delvis matching. */
const MIN_PARTIAL_LENGTH = 4

export type VenueDoc = {_id: string; name?: string}

export type VenueMatch = {
  id: string
  name: string
  score: number
  /** Hvordan treffet ble funnet — havner i importloggen. */
  how: string
}

/** Fjerner mellomrom i tillegg til tegnsetting: «Nord-Trøndelag» → «nordtrøndelag». */
function compact(value: string): string {
  return normalize(value).replace(/\s+/g, '')
}

function scoreAgainst(source: string, venueName: string): {score: number; how: string} {
  const a = normalize(source)
  const b = normalize(venueName)

  if (!a || !b) return {score: 0, how: 'tomt navn'}
  if (a === b) return {score: 1, how: 'eksakt navn'}

  const ca = compact(source)
  const cb = compact(venueName)
  if (ca === cb) return {score: 0.97, how: 'navn uten tegnsetting'}

  // «Fyret» mot «Fyret Flerbrukshall», «Kuben» mot «Kuben Kulturhus».
  if (a.length >= MIN_PARTIAL_LENGTH && b.startsWith(`${a} `)) {
    return {score: 0.92, how: 'kildenavnet innleder stedsnavnet'}
  }
  if (b.length >= MIN_PARTIAL_LENGTH && a.startsWith(`${b} `)) {
    return {score: 0.9, how: 'stedsnavnet innleder kildenavnet'}
  }

  // Kilden presiserer av og til salen i parentes: «NTE-Arena (sittende)».
  // Presiseringen sier noe om oppsettet, ikke om stedet, så den kan strykes.
  const stripped = normalize(source.replace(/\([^)]*\)/g, ' '))
  if (stripped && stripped !== a && stripped.length >= MIN_PARTIAL_LENGTH) {
    if (stripped === b) return {score: 0.95, how: 'navn uten presisering i parentes'}
    if (b.startsWith(`${stripped} `)) {
      return {score: 0.91, how: 'navn uten parentes innleder stedsnavnet'}
    }
  }

  // «Konsertsalen» mot «Konsertsalen, Kulturhuset i Namsos» dekkes over, men
  // ordet kan også stå lenger inne i navnet.
  if (ca.length >= MIN_PARTIAL_LENGTH && cb.includes(ca)) {
    return {score: 0.86, how: 'kildenavnet finnes i stedsnavnet'}
  }
  if (cb.length >= MIN_PARTIAL_LENGTH && ca.includes(cb)) {
    return {score: 0.84, how: 'stedsnavnet finnes i kildenavnet'}
  }

  return {score: similarity(a, b), how: 'likhet i skrivemåte'}
}

/** Beste treff over terskelen, eller `undefined`. */
export function matchVenue(
  sourceName: string | undefined,
  venues: VenueDoc[],
): VenueMatch | undefined {
  if (!sourceName) return undefined

  let best: VenueMatch | undefined

  for (const venue of venues) {
    if (!venue.name) continue
    const {score, how} = scoreAgainst(sourceName, venue.name)
    if (!best || score > best.score) {
      best = {id: venue._id, name: venue.name, score, how}
    }
  }

  return best && best.score >= ACCEPT_SCORE ? best : undefined
}

/**
 * Finner ett bestemt sted på navn. Brukes til kilder der alle arrangement
 * hører til samme scene uansett hva kilden kaller salen.
 */
export function findVenueByName(name: string, venues: VenueDoc[]): VenueMatch | undefined {
  return matchVenue(name, venues)
}
