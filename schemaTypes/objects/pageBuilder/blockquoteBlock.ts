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
  ],
  preview: {
    select: {
      quote: 'quote',
      attribution: 'attribution',
    },
    prepare({quote, attribution}) {
      return {
        title: quote ? `"${quote}"` : 'Blockquote',
        subtitle: attribution || 'Blockquote',
      }
    },
  },
})
