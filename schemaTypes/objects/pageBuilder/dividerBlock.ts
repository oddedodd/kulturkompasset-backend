import {defineField, defineType} from 'sanity'

export const dividerBlock = defineType({
  name: 'dividerBlock',
  title: 'Skillelinje',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      initialValue: 'default',
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Skillelinje',
        subtitle: 'Divider',
      }
    },
  },
})
