/**
 * Tidssonehåndtering for importerte arrangement.
 *
 * Begge kildeplattformene oppgir *lokal veggklokketid* i Namsos/Grong/Nærøysund,
 * men ingen av dem oppgir den korrekt:
 *
 * - DX (Namsos, Grong) skriver `"2026-09-08 18:00:00"` helt uten tidssone.
 * - TicketCo (Nærøysund) skriver `"2026-09-10T19:00:00Z"` — altså med Z for UTC —
 *   samtidig som siden viser «10.09.2026 19:00». I september er Oslo UTC+2, så
 *   hadde Z vært sann ville siden vist 21:00. Z-en er feil; verdien er lokal tid.
 *
 * Tolker vi dette som UTC havner arrangementene 1–2 timer feil. Derfor regnes
 * alle tidspunkt om fra Oslo-veggklokke til ekte UTC her.
 */

const OSLO = 'Europe/Oslo'

/** Hvor mange millisekunder tidssonen ligger foran UTC på et gitt tidspunkt. */
function zoneOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const parts: Record<string, string> = {}
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value
  }

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )

  return asUtc - date.getTime()
}

/**
 * Gjør lokal Oslo-tid om til en ISO-streng i UTC.
 *
 * Offsetet avhenger av tidspunktet vi regner det ut på (sommer- vs vintertid),
 * så vi itererer to ganger. Det andre gjennomløpet retter opp datoer som ligger
 * rett ved en tidsomstilling.
 */
export function osloWallTimeToIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0)
  let ts = wall

  for (let i = 0; i < 2; i++) {
    ts = wall - zoneOffsetMs(OSLO, new Date(ts))
  }

  return new Date(ts).toISOString()
}

/** `"2026-09-08 18:00:00"` eller `"2026-09-10T19:00:00Z"` → ISO i UTC. */
export function parseLocalDateTime(value?: string | null): string | null {
  if (!value) return null

  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value.trim())
  if (!m) return null

  return osloWallTimeToIso(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]))
}

/** Kalenderdato i Oslo (`YYYY-MM-DD`) — grunnlaget for datosammenligningen. */
export function osloDateKey(iso?: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: OSLO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return dtf.format(date)
}

/** Lesbar dato og klokkeslett i Oslo, til bruk i varsler og logg. */
export function osloDateTimeLabel(iso?: string | null): string {
  if (!iso) return 'ukjent dato'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'ukjent dato'

  return new Intl.DateTimeFormat('nb-NO', {
    timeZone: OSLO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
