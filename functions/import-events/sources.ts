/** De tre kommunale programkildene redaktøren kan importere fra. */
import type {SourceEvent, SourceKey} from './types'
import {fetchDxEvents} from './dx'
import {fetchTicketcoEvents} from './ticketco'

export type SourceDefinition = {
  key: SourceKey
  label: string
  homepage: string
  fetchEvents: () => Promise<SourceEvent[]>
  /**
   * Sted som skal brukes for alle arrangement fra kilden, uavhengig av hva
   * kilden selv oppgir. Grong navngir salen («Symfoni Namsen», «Grong
   * Sparebanksalen»), men alt spilles i Kuben kulturhus.
   */
  fixedVenueName?: string
}

export const SOURCES: Record<SourceKey, SourceDefinition> = {
  namsos: {
    key: 'namsos',
    label: 'Namsos kulturhus',
    homepage: 'https://www.namsos.kulturhus.no/kulturprogram/',
    fetchEvents: () => fetchDxEvents('https://www.namsos.kulturhus.no'),
  },
  grong: {
    key: 'grong',
    label: 'Kulturhuset Kuben (Grong)',
    homepage: 'https://kulturhusetkuben.no/kulturprogram/',
    fetchEvents: () => fetchDxEvents('https://kulturhusetkuben.no'),
    fixedVenueName: 'Kuben Kulturhus',
  },
  naroysund: {
    key: 'naroysund',
    label: 'Kultur i Nærøysund',
    homepage: 'https://kulturinaroy.ticketco.events/no/nb',
    fetchEvents: () => fetchTicketcoEvents('https://kulturinaroy.ticketco.events/no/nb'),
  },
}

export const SOURCE_KEYS = Object.keys(SOURCES) as SourceKey[]
