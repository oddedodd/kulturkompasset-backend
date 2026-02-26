import {defineField, defineType} from 'sanity'

export const embedBlock = defineType({
  name: 'embedBlock',
  title: 'Innbygging',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Lim inn lenke til innhold som skal bygges inn (f.eks. Spotify, SoundCloud, Instagram).',
      validation: (Rule) => Rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Valgfri intern tittel for enklere redigering.',
    }),
    defineField({
      name: 'caption',
      title: 'Beskrivelse',
      type: 'string',
      description: 'Valgfri beskrivelse som kan vises under embed i frontend.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'url',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Innbygging',
        subtitle: subtitle || 'Ingen URL',
      }
    },
  },
})
