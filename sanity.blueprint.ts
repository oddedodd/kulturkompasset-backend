/**
 * Blueprint for Sanity Functions.
 *
 * Foreløpig én funksjon: `import-events`, som henter kulturprogram fra
 * kommunene og skriver dem inn som kladder. Den trigges av at studioet
 * oppretter et `eventImport`-dokument med status `pending`.
 *
 * Deploy med `npx sanity blueprints deploy` (se docs/import-av-arrangement.md).
 */
import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '7jx6egsg'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'import-events',
      // Standardgrensen på 10 sekunder holder ikke: funksjonen henter
      // programmet fra en ekstern side og laster i tillegg ned og opp ett
      // bilde per arrangement. Namsos har flest, med 34.
      timeout: 600,
      event: {
        // Bare `create`. Funksjonen patcher jobbdokumentet selv, og med
        // `update` her ville den trigget seg selv i en løkke.
        on: ['create'],
        filter: '_type == "eventImport" && status == "pending"',
        projection: '{_id, _type, source, status}',
        resource: {
          type: 'dataset',
          id: `${projectId}.${dataset}`,
        },
      },
    }),
  ],
})
