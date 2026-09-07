import {DocumentActionComponent, useClient} from 'sanity'

/**
 * «Lagre som arrangement og slett oppføring» for importerte arrangement.
 *
 * Tilsvarer godkjenningsknappen på bulletin-innsendinger, men et importert
 * arrangement er allerede av typen `event` — det som skal bort er importsporet,
 * ikke dokumentet. Handlingen publiserer derfor kladden og fjerner feltene som
 * holder den i «Importerte arrangement».
 *
 * Ett felt beholdes med vilje: `importExternalId`. Det er kildens egen ID, og
 * det er den importen kjenner arrangementet igjen på ved neste kjøring. Uten
 * den ville en ny import av samme kommune laget en ny kladd av noe redaksjonen
 * allerede har publisert — særlig hvis tittelen er redigert i mellomtiden, for
 * da treffer heller ikke sammenligningen på navn. Feltet er skjult for
 * redaksjonen i praksis, siden hele import-gruppen er sammenslått.
 */
const API_VERSION = '2025-01-01'

/** Feltene som utgjør selve importoppføringen, og som skal bort. */
const IMPORT_FIELDS = [
  'importSource',
  'importWarning',
  'importVenueName',
  'importImageUrl',
  'importedAt',
] as const

export type ImportedEventDoc = {
  _id: string
  _type: string
  title?: string
  startsAt?: string
  slug?: {current?: string}
  importSource?: string
} & Record<string, unknown>

function stripDraftPrefix(id: string): string {
  return id.replace(/^drafts\./, '')
}

/**
 * Bygger det ferdige arrangementet fra kladden.
 *
 * Systemfeltene skal ikke være med videre: `_rev` ville låst skrivingen til en
 * bestemt revisjon, og tidsstemplene settes av Content Lake selv.
 */
export function toPublishedEvent(doc: ImportedEventDoc): Record<string, unknown> {
  const next: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(doc)) {
    if (key === '_rev' || key === '_createdAt' || key === '_updatedAt') continue
    if ((IMPORT_FIELDS as readonly string[]).includes(key)) continue
    next[key] = value
  }

  next._id = stripDraftPrefix(doc._id)
  next._type = 'event'

  return next
}

export const publishImportedEventAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const doc = (props.draft || props.published) as ImportedEventDoc | null

  // Vises bare på arrangement som faktisk er importert.
  if (props.type !== 'event' || !doc?.importSource) return null

  const missing: string[] = []
  if (!doc.title) missing.push('Tittel')
  if (!doc.startsAt) missing.push('Start')
  if (!doc.slug?.current) missing.push('Slug')

  const publishedId = stripDraftPrefix(doc._id)

  return {
    label: 'Lagre som arrangement og slett oppføring',
    tone: 'positive',
    disabled: missing.length > 0,
    title:
      missing.length > 0
        ? `Fyll ut ${missing.join(', ')} før arrangementet kan lagres.`
        : 'Publiserer arrangementet og fjerner det fra Importerte arrangement.',
    onHandle: async () => {
      await client
        .transaction()
        .createOrReplace(toPublishedEvent(doc) as {_id: string; _type: string})
        .delete(`drafts.${publishedId}`)
        .commit()

      props.onComplete()
    },
  }
}
