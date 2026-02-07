import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './sanity.structure'

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
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((template) => !singletonTypes.has(template.schemaType)),
  },
  document: {
    actions: (prev, context) => {
      if (!singletonTypes.has(context.schemaType)) return prev
      return prev.filter(({action}) => action !== 'duplicate')
    },
  },
})
