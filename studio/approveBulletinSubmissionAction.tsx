import {DocumentActionComponent, useClient} from 'sanity'

type BulletinSubmissionDoc = {
  _id: string
  _type: 'bulletinSubmission'
  name?: string
  date?: string
  organizer?: string
  place?: string
  contact?: string
  description?: string
  price?: string
  image?: {
    _type: 'image'
    asset?: {_type: 'reference'; _ref: string}
    alt?: string
    crop?: Record<string, unknown>
    hotspot?: Record<string, unknown>
  }
}

type Reference = {
  _type: 'reference'
  _ref: string
}

type MatchedReference = {
  _id: string
  name?: string
}

const API_VERSION = '2025-01-01'

function stripDraftPrefix(id: string): string {
  return id.replace(/^drafts\./, '')
}

function toSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function makeKey(input: string): string {
  return toSlug(input).replace(/-/g, '').slice(0, 12) || 'key'
}

function portableTextBlock(text: string, keyBase: string) {
  return {
    _type: 'block',
    _key: makeKey(keyBase),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: makeKey(`${keyBase}-span`),
        text,
        marks: [],
      },
    ],
  }
}

function getSummary(description?: string): string | undefined {
  const trimmed = description?.trim()
  if (!trimmed) return undefined
  return trimmed.length > 240 ? `${trimmed.slice(0, 237).trimEnd()}...` : trimmed
}

function getPriceFrom(price?: string): number | undefined {
  const normalized = price?.trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized.includes('gratis')) return 0

  const match = normalized.match(/\d+(?:[.,]\d+)?/)
  if (!match) return undefined

  const value = Number(match[0].replace(',', '.'))
  return Number.isFinite(value) ? value : undefined
}

function getDetailsBody(submission: BulletinSubmissionDoc) {
  const blocks = []

  if (submission.description?.trim()) {
    blocks.push(portableTextBlock(submission.description.trim(), 'description'))
  }

  const details = [
    submission.organizer ? `Arrangør: ${submission.organizer}` : null,
    submission.place ? `Sted fra innsending: ${submission.place}` : null,
    submission.contact ? `Kontaktperson: ${submission.contact}` : null,
    submission.price ? `Pris: ${submission.price}` : null,
  ].filter(Boolean)

  if (details.length) {
    blocks.push(portableTextBlock(details.join('\n'), 'submission-details'))
  }

  return blocks
}

function findByName(items: MatchedReference[], name?: string): Reference | undefined {
  const normalizedName = name?.trim().toLowerCase()
  if (!normalizedName) return undefined

  const match = items.find((item) => item.name?.trim().toLowerCase() === normalizedName)
  return match ? {_type: 'reference', _ref: match._id} : undefined
}

export const ApproveBulletinSubmissionAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const submission = (props.published || props.draft) as BulletinSubmissionDoc | null

  if (props.type !== 'bulletinSubmission' || !submission) return null

  const sourceSubmissionId = stripDraftPrefix(submission._id)
  const draftSubmissionId = `drafts.${sourceSubmissionId}`
  const bulletinId = `bulletin.${sourceSubmissionId}`

  return {
    label: 'Godkjenn, opprett bulletin og slett innsending',
    tone: 'positive',
    onHandle: async () => {
      const approvedAt = new Date().toISOString()
      const validImage = submission.image?.asset ? submission.image : undefined
      const generatedSlug = toSlug(submission.name || sourceSubmissionId) || sourceSubmissionId

      await client
        .transaction()
        .createIfNotExists({
          _id: bulletinId,
          _type: 'bulletin',
          name: submission.name ?? '',
          slug: {_type: 'slug', current: generatedSlug},
          date: submission.date,
          organizer: submission.organizer ?? '',
          place: submission.place ?? '',
          contact: submission.contact ?? '',
          description: submission.description ?? '',
          price: submission.price,
          image: validImage,
          approvedAt,
        })
        .patch(bulletinId, {
          unset: ['sourceSubmission'],
        })
        .delete(sourceSubmissionId)
        .delete(draftSubmissionId)
        .commit()

      props.onComplete()
    },
  }
}

export const ApproveBulletinSubmissionToEventAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const submission = (props.published || props.draft) as BulletinSubmissionDoc | null

  if (props.type !== 'bulletinSubmission' || !submission) return null

  const sourceSubmissionId = stripDraftPrefix(submission._id)
  const draftSubmissionId = `drafts.${sourceSubmissionId}`
  const draftEventId = `drafts.event.${sourceSubmissionId}`

  return {
    label: 'Godkjenn, opprett arrangement og slett innsending',
    tone: 'positive',
    onHandle: async () => {
      const [venues, contributors] = await Promise.all([
        client.fetch<MatchedReference[]>(
          '*[_type == "venue" && !(_id in path("drafts.**"))]{_id, name}',
        ),
        client.fetch<MatchedReference[]>(
          '*[_type == "contributor" && !(_id in path("drafts.**"))]{_id, name}',
        ),
      ])

      const validImage = submission.image?.asset ? submission.image : undefined
      const generatedSlug = toSlug(submission.name || sourceSubmissionId) || sourceSubmissionId
      const matchedVenue = findByName(venues, submission.place)
      const matchedContributor = findByName(contributors, submission.organizer)
      const priceFrom = getPriceFrom(submission.price)

      await client
        .transaction()
        .createIfNotExists({
          _id: draftEventId,
          _type: 'event',
          title: submission.name ?? '',
          slug: {_type: 'slug', current: generatedSlug},
          status: 'upcoming',
          startsAt: submission.date,
          venue: matchedVenue,
          contributors: matchedContributor ? [matchedContributor] : undefined,
          summary: getSummary(submission.description),
          heroImage: validImage,
          body: getDetailsBody(submission),
          priceFrom,
        })
        .delete(sourceSubmissionId)
        .delete(draftSubmissionId)
        .commit()

      props.onComplete()
    },
  }
}
