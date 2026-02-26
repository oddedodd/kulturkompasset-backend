import {defineArrayMember, defineField, defineType} from 'sanity'

export const imageTextRightBlock = defineType({
  name: 'imageTextRightBlock',
  title: 'Bilde + tekst (bilde høyre)',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Tekst',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      media: 'image',
    },
    prepare({media}) {
      return {
        title: 'Bilde + tekst',
        subtitle: 'Bilde høyre',
        media,
      }
    },
  },
})
