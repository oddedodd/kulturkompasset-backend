import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './sanity.structure'
import {DefaultStructureRedirectLayout} from './studio/defaultStructureRedirectLayout'
import {approveBulletinSubmissionAction} from './studio/approveBulletinSubmissionAction'
import {publishImportedEventAction} from './studio/publishImportedEventAction'

const singletonTypes = new Set(['siteSettings'])

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Kulturkompasset',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  studio: {
    components: {
      layout: DefaultStructureRedirectLayout,
    },
  },
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((template) => !singletonTypes.has(template.schemaType)),
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'bulletinSubmission') {
        return [...prev, approveBulletinSubmissionAction]
      }

      // Handlingen skjuler seg selv på arrangement som ikke er importert,
      // så den kan legges på hele typen.
      if (context.schemaType === 'event') {
        return [...prev, publishImportedEventAction]
      }

      if (!singletonTypes.has(context.schemaType)) return prev
      return prev.filter(({action}) => action !== 'duplicate')
    },
  },
})
