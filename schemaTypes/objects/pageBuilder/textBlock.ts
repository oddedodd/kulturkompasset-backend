import {defineArrayMember, defineField, defineType} from 'sanity'

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Text (Portable Text)',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Tekstinnhold',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      blocks: 'content',
    },
    prepare({blocks}) {
      const firstBlock = Array.isArray(blocks) ? blocks.find((item) => item?._type === 'block') : null
      const firstText = firstBlock?.children?.map((child: {_type?: string; text?: string}) => child.text || '').join('')
      return {
        title: firstText || 'Text block',
        subtitle: 'Portable Text',
      }
    },
  },
})
