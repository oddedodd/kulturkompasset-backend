import {useState} from 'react'
import {DocumentActionComponent, useClient} from 'sanity'
import {useRouter} from 'sanity/router'

/**
 * «Gjør om til bulletin» og «Gjør om til arrangement» for innsendinger og tips.
 *
 * Redaktøren velger hva innsendingen skal bli. Handlingen lager alltid en kladd,
 * så ingenting blir offentlig før redaktøren har sett over og publisert den.
 * Innsendingen slettes i samme transaksjon, slik at den ikke kan bli liggende
 * dobbelt, og slik at kontaktinformasjonen ikke blir lagret lenger enn nødvendig.
 *
 * Nye ID-er har bindestrek, ikke punktum: dokumenter med punktum i ID-en kan bare
 * leses med token, og den publiserte versjonen skal være offentlig.
 */
const API_VERSION = '2025-01-01'

type Target = 'bulletin' | 'event'

type SubmissionDoc = {
  _id: string
  _type: string
  name?: string
  date?: string
  organizer?: string
  place?: string
  contact?: string
  description?: string
  price?: string
  ticketUrl?: string
  image?: {asset?: {_ref: string}} & Record<string, unknown>
}

type NamedDoc = {_id: string; name?: string}

function stripDraftPrefix(id: string): string {
  return id.replace(/^drafts\./, '')
}

function toSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function buildSlug(name?: string) {
  const current = toSlug(name ?? '')
  return current ? {_type: 'slug', current} : undefined
}

function buildTargetId(target: Target, sourceId: string): string {
  return `${target}-${sourceId.replace(/\./g, '-')}`
}

function validImage(doc: SubmissionDoc) {
  return doc.image?.asset ? doc.image : undefined
}

function findByName(items: NamedDoc[], name?: string): NamedDoc | undefined {
  const normalized = name?.trim().toLowerCase()
  if (!normalized) return undefined
  return items.find((item) => item.name?.trim().toLowerCase() === normalized)
}

function parsePriceFrom(price?: string): number | undefined {
  const normalized = price?.trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized.includes('gratis')) return 0

  const match = normalized.match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : undefined
}

function textBlock(text: string, key: string) {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `${key}-span`, text, marks: []}],
  }
}

function buildSummary(description?: string): string | undefined {
  const trimmed = description?.trim()
  if (!trimmed) return undefined
  return trimmed.length > 240 ? `${trimmed.slice(0, 237).trimEnd()}...` : trimmed
}

function buildBulletin(doc: SubmissionDoc, id: string) {
  // Bulletin har ikke eget felt for billettlenke, så den legges i beskrivelsen.
  const description = [doc.description?.trim(), doc.ticketUrl && `Billetter: ${doc.ticketUrl}`]
    .filter(Boolean)
    .join('\n\n')

  return {
    _id: `drafts.${id}`,
    _type: 'bulletin',
    name: doc.name,
    slug: buildSlug(doc.name),
    date: doc.date,
    organizer: doc.organizer,
    place: doc.place,
    // «Kontaktperson» vises offentlig på bulletinen. Innsendere av tips har ikke
    // oppgitt noen kontaktperson, så redaktøren må fylle ut feltet selv.
    contact: doc._type === 'bulletinSubmission' ? doc.contact : undefined,
    description: description || undefined,
    price: doc.price,
    image: validImage(doc),
    approvedAt: new Date().toISOString(),
  }
}

function buildEvent(doc: SubmissionDoc, id: string, venues: NamedDoc[], contributors: NamedDoc[]) {
  const venue = findByName(venues, doc.place)
  const contributor = findByName(contributors, doc.organizer)

  // Det som ikke får plass i feltene, legges i brødteksten så det ikke går tapt.
  // Kontaktinformasjon skal aldri hit, fordi brødteksten er offentlig.
  const details = [
    !venue && doc.place && `Sted: ${doc.place}`,
    !contributor && doc.organizer && `Arrangør: ${doc.organizer}`,
    doc.price && `Pris: ${doc.price}`,
  ].filter((line): line is string => Boolean(line))

  const body = [
    ...(doc.description?.trim() ? [textBlock(doc.description.trim(), 'description')] : []),
    ...details.map((line, index) => textBlock(line, `details-${index}`)),
  ]

  return {
    _id: `drafts.${id}`,
    _type: 'event',
    title: doc.name,
    slug: buildSlug(doc.name),
    status: 'upcoming',
    startsAt: doc.date,
    venue: venue ? {_type: 'reference', _ref: venue._id} : undefined,
    contributors: contributor
      ? [{_type: 'reference', _ref: contributor._id, _key: 'submission-contributor'}]
      : undefined,
    summary: buildSummary(doc.description),
    heroImage: validImage(doc),
    body: body.length > 0 ? body : undefined,
    ticketUrl: doc.ticketUrl,
    priceFrom: parsePriceFrom(doc.price),
  }
}

function buildMessage(target: Target, type: string): string {
  const targetName = target === 'bulletin' ? 'en bulletin' : 'et arrangement'
  const contactNote =
    type === 'tips' || target === 'event'
      ? ' Kontaktinformasjonen til innsender blir ikke med, så noter den først hvis du trenger den.'
      : ''
  return `Dette lager ${targetName} som kladd og sletter innsendingen. Kladden blir ikke offentlig før du publiserer den.${contactNote}`
}

function createConvertAction(target: Target, label: string): DocumentActionComponent {
  const ConvertAction: DocumentActionComponent = (props) => {
    const client = useClient({apiVersion: API_VERSION})
    const router = useRouter()
    const [isConfirming, setIsConfirming] = useState(false)
    const [isConverting, setIsConverting] = useState(false)
    const [failed, setFailed] = useState(false)
    const doc = (props.draft || props.published) as SubmissionDoc | null

    if (!doc) return null

    const convert = async () => {
      setIsConverting(true)
      setFailed(false)
      const sourceId = stripDraftPrefix(doc._id)
      const targetId = buildTargetId(target, sourceId)

      try {
        let draft: {_id: string; _type: string} & Record<string, unknown>
        if (target === 'bulletin') {
          draft = buildBulletin(doc, targetId)
        } else {
          const {venues, contributors} = await client.fetch<{
            venues: NamedDoc[]
            contributors: NamedDoc[]
          }>(`{
            "venues": *[_type == "venue" && !(_id in path("drafts.**"))]{_id, name},
            "contributors": *[_type == "contributor" && !(_id in path("drafts.**"))]{_id, name}
          }`)
          draft = buildEvent(doc, targetId, venues, contributors)
        }

        // `create` feiler hvis kladden finnes fra før, slik at ingenting overskrives
        // og innsendingen blir stående.
        await client
          .transaction()
          .create(draft)
          .delete(sourceId)
          .delete(`drafts.${sourceId}`)
          .commit()

        props.onComplete()
        router.navigateIntent('edit', {id: targetId, type: target})
      } catch (error) {
        console.error(error)
        setIsConverting(false)
        setFailed(true)
      }
    }

    return {
      label,
      disabled: isConverting,
      onHandle: () => setIsConfirming(true),
      dialog: isConfirming
        ? {
            type: 'confirm',
            tone: 'caution',
            message: failed
              ? 'Det gikk ikke å gjøre om innsendingen, og den er ikke endret. Vil du prøve igjen?'
              : buildMessage(target, doc._type),
            onCancel: () => {
              setIsConfirming(false)
              setFailed(false)
            },
            onConfirm: convert,
          }
        : null,
    }
  }

  ConvertAction.displayName = `ConvertSubmissionTo_${target}`
  return ConvertAction
}

export const convertToBulletinAction = createConvertAction('bulletin', 'Gjør om til bulletin')
export const convertToEventAction = createConvertAction('event', 'Gjør om til arrangement')
