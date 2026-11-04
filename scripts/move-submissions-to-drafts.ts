/**
 * Flytter innsendinger til utkast, slik at de verken kan leses uten token eller
 * framstår som publisert innhold i Studio:
 *   <id>         -> drafts.<type>.<id>
 *   <type>.<id>  -> drafts.<type>.<id>
 *
 * Dry-run (standard, skriver ingenting):
 *   npx sanity exec scripts/move-submissions-to-drafts.ts --with-user-token
 *
 * Utfør flyttingen (bare etter godkjenning, og etter at frontend er i produksjon og lagrer utkast):
 *   npx sanity exec scripts/move-submissions-to-drafts.ts --with-user-token -- --apply
 *
 * Skriptet skriver bare ut antall og ID-er, aldri feltverdier. Det kan kjøres flere ganger:
 * dokumenter som allerede er utkast med riktig ID, hoppes over.
 */
import {getCliClient} from 'sanity/cli'

const PROJECT_ID = '7jx6egsg'
const DATASET = 'production'
const TYPES = ['tips', 'bulletinSubmission']
const API_VERSION = '2025-01-01'

type SubmissionDoc = {
  _id: string
  _type: string
  _rev: string
  _createdAt: string
  submittedAt?: string
  [key: string]: unknown
}

type Move = {from: SubmissionDoc; targetId: string}

const apply = process.argv.includes('--apply')
const client = getCliClient({apiVersion: API_VERSION}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const {projectId, dataset} = client.config()
if (projectId !== PROJECT_ID || dataset !== DATASET) {
  throw new Error(`Forventet ${PROJECT_ID}/${DATASET}, fikk ${projectId}/${dataset}`)
}

function buildCopy(doc: SubmissionDoc, targetId: string) {
  // _rev og _updatedAt settes av Sanity. _createdAt skal beholdes.
  const {_rev, _updatedAt, _originalId, ...fields} = doc
  return {
    ...fields,
    _id: targetId,
    ...(doc._type === 'bulletinSubmission' && !doc.submittedAt
      ? {submittedAt: doc._createdAt}
      : {}),
  }
}

async function publicCount(type: string): Promise<number> {
  const query = encodeURIComponent(`count(*[_type == "${type}"])`)
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Spørring uten token feilet: ${response.status}`)
  return (await response.json()).result
}

async function report(label: string) {
  console.log(`\n${label}`)
  for (const type of TYPES) {
    const counts = await client.fetch<{
      total: number
      drafts: number
      withImage: number
      brokenImage: number
    }>(
      `{
        "total": count(*[_type == $type]),
        "drafts": count(*[_type == $type && _id in path("drafts.**")]),
        "withImage": count(*[_type == $type && defined(image.asset)]),
        "brokenImage": count(*[_type == $type && defined(image.asset) && !defined(image.asset->_id)])
      }`,
      {type},
    )
    console.log(
      `  ${type}: med token ${counts.total}, utkast ${counts.drafts}, ` +
        `uten token ${await publicCount(type)}, med bilde ${counts.withImage}, ` +
        `brutte bildereferanser ${counts.brokenImage}`,
    )
  }
}

async function main() {
  console.log(apply ? 'MODUS: UTFØRER FLYTTING' : 'MODUS: dry-run, ingenting skrives')
  await report('Før:')

  const docs = await client.fetch<SubmissionDoc[]>('*[_type in $types]', {types: TYPES})
  const existingIds = new Set(docs.map((doc) => doc._id))

  const moves: Move[] = []
  const alreadyDrafts: string[] = []
  const unsupported: string[] = []

  for (const doc of docs) {
    const prefix = `${doc._type}.`
    const isDraft = doc._id.startsWith('drafts.')
    const baseId = isDraft ? doc._id.slice('drafts.'.length) : doc._id
    const shortId = baseId.startsWith(prefix) ? baseId.slice(prefix.length) : baseId

    if (isDraft && baseId.startsWith(prefix) && !shortId.includes('.')) {
      alreadyDrafts.push(doc._id)
    } else if (shortId.includes('.')) {
      // For eksempel versions.<release>.<id>: må vurderes manuelt.
      unsupported.push(doc._id)
    } else {
      moves.push({from: doc, targetId: `drafts.${prefix}${shortId}`})
    }
  }

  // Et utkast finnes allerede for samme innsending. Det må ikke overskrives.
  const conflicts = moves
    .filter((move) => existingIds.has(move.targetId))
    .map((move) => move.from._id)

  console.log(`\nSkal flyttes: ${moves.length} dokumenter`)
  for (const move of moves) console.log(`  ${move.from._id} -> ${move.targetId}`)
  console.log(`Allerede utkast, hoppes over: ${alreadyDrafts.length}`)
  console.log(`Utkast finnes allerede: ${conflicts.length}`, conflicts)
  console.log(`Ukjent ID-form: ${unsupported.length}`, unsupported)

  // Dokumenter med sterke referanser kan ikke slettes, så dette må avklares på forhånd.
  const referenced = await client.fetch<number>('count(*[references($ids)])', {
    ids: moves.map((move) => move.from._id),
  })
  console.log(`Andre dokumenter som refererer til innsendingene: ${referenced}`)

  if (!apply) {
    console.log('\nDry-run ferdig. Ingenting er endret.')
    return
  }

  if (conflicts.length > 0 || unsupported.length > 0 || referenced > 0) {
    throw new Error('Avbryter før skriving: avvikene over må avklares først.')
  }

  for (const {from, targetId} of moves) {
    const transaction = client.transaction()
    await transaction
      .create(buildCopy(from, targetId) as Parameters<typeof transaction.create>[0])
      // Feiler hele transaksjonen hvis dokumentet er endret siden det ble lest.
      .patch(from._id, {ifRevisionID: from._rev, unset: ['_migrationNoop']})
      .delete(from._id)
      .commit()

    // Stopp ved første avvik, slik at en feil ikke rammer flere dokumenter.
    const createdAt = await client.fetch<string | null>('*[_id == $id][0]._createdAt', {
      id: targetId,
    })
    if (createdAt !== from._createdAt) {
      throw new Error(`_createdAt ble ikke bevart for ${targetId}. Stopper. Original: ${from._id}`)
    }
    console.log(`  Flyttet ${targetId}`)
  }

  await report('Etter:')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Ukjent feil')
  process.exitCode = 1
})
