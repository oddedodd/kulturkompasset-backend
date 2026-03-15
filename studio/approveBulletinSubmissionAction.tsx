import {DocumentActionComponent, useClient} from 'sanity'

type BulletinSubmissionDoc = {
  _id: string
  _type: 'bulletinSubmission'
  name?: string
  date?: string
  organizer?: string
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
  isApproved?: boolean
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

  const alreadyApproved = Boolean(submission.isApproved)
  const sourceSubmissionId = stripDraftPrefix(submission._id)
  const bulletinId = `bulletin.${sourceSubmissionId}`

  return {
    label: alreadyApproved ? 'Allerede godkjent' : 'Godkjenn og opprett bulletin',
    disabled: alreadyApproved,
    tone: alreadyApproved ? 'default' : 'positive',
    onHandle: async () => {
      if (alreadyApproved) {
        props.onComplete()
        return
      }

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
          contact: submission.contact ?? '',
          description: submission.description ?? '',
          price: submission.price,
          image: validImage,
          sourceSubmission: {_type: 'reference', _ref: sourceSubmissionId},
          approvedAt,
        })
        .patch(props.id, {
          set: {
            isApproved: true,
            approvedAt,
            approvedBulletin: {_type: 'reference', _ref: bulletinId},
          },
        })
        .commit()

      props.onComplete()
    },
  }
}
