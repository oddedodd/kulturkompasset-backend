import {defineField, defineType} from 'sanity'

export const blockquoteBlock = defineType({
  name: 'blockquoteBlock',
  title: 'Blockquote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Sitat',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Kilde',
      type: 'string',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Bakgrunnsbilde',
      type: 'image',
      description: 'Valgfritt bakgrunnsbilde for sitatblokken.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      quote: 'quote',
      attribution: 'attribution',
      media: 'backgroundImage',
    },
    prepare({quote, attribution, media}) {
      return {
        title: quote ? `"${quote}"` : 'Blockquote',
        subtitle: attribution || 'Blockquote',
        media,
      }
    },
  },
})
