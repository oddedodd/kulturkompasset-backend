/**
 * SEO
 * ---
 * Gjenbrukbart SEO-objekt for sider og innhold.
 * Gjør det enkelt å styre metadata uten logikk i frontend.
 */

import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Vises i fanen og i Google (maks ca 60 tegn)',
      validation: (Rule) =>
        Rule.max(60).warning('Anbefalt maks 60 tegn'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Kort beskrivelse for søkemotorer (maks ca 160 tegn)',
      validation: (Rule) =>
        Rule.max(160).warning('Anbefalt maks 160 tegn'),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG-bilde',
      type: 'image',
      description: 'Bilde brukt ved deling i sosiale medier',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'Ikke indekser (noindex)',
      type: 'boolean',
      description: 'Brukes hvis siden ikke skal dukke opp i Google',
      initialValue: false,
    }),
  ],
})