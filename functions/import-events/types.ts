/** Ett arrangement slik det ser ut rett etter uttrekk fra en kilde. */
export type SourceEvent = {
  /** Kildens egen ID. Brukes som sterkeste duplikatsignal ved gjentatt import. */
  externalId: string
  title: string
  /** ISO-tidspunkt i UTC, allerede omregnet fra lokal tid. */
  startsAt: string
  endsAt?: string
  venueName?: string
  category?: string
  summary?: string
  paragraphs: string[]
  url?: string
  imageUrl?: string
}

export type SourceKey = 'namsos' | 'grong' | 'naroysund'
