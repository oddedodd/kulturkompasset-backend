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

export const approveBulletinSubmissionAction: DocumentActionComponent = (props) => {
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
