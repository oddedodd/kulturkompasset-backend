import type {ReferenceOptions} from 'sanity'

/**
 * Delt GROQ-logikk for arrangement, brukt både av Studio-strukturen og av
 * referansefelt som bare skal kunne peke på kommende arrangement.
 *
 * Et arrangement regnes som kommende til og med sluttidspunktet (eller
 * starttidspunktet om sluttid mangler), slik at pågående flerdagsarrangement
 * ikke faller ut av listen.
 */
const EVENT_END = 'coalesce(endsAt, startsAt)'
const NOT_CANCELLED = 'status != "cancelled"'

export const UPCOMING_EVENT_FILTER = `_type == "event" && ${NOT_CANCELLED} && defined(startsAt) && dateTime(${EVENT_END}) >= dateTime($now)`
export const PAST_EVENT_FILTER = `_type == "event" && ${NOT_CANCELLED} && defined(startsAt) && dateTime(${EVENT_END}) < dateTime($now)`
export const CANCELLED_EVENT_FILTER = '_type == "event" && status == "cancelled"'

/** Ferskt tidspunkt til `$now`. Kalles på nytt for hvert oppslag. */
export const nowParams = () => ({now: new Date().toISOString()})

/**
 * Options for et `reference`-felt mot `event` som bare skal tilby kommende
 * arrangement, sortert kronologisk med det nærmeste først.
 *
 * `sort` og `skipSortByScore` ligger ikke i de offentlige Sanity-typene, men
 * referanse-inputen sprer `options` rett inn i søket (`createSearch`), så de
 * virker. Uten `skipSortByScore` ville treff blitt sortert på relevans så snart
 * man begynner å skrive i søkefeltet; med den beholdes datorekkefølgen.
 */
export const upcomingEventReferenceOptions = {
  filter: () => ({filter: UPCOMING_EVENT_FILTER, params: nowParams()}),
  sort: [{field: 'startsAt', direction: 'asc'}],
  skipSortByScore: true,
} as ReferenceOptions
