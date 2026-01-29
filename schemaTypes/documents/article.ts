import {defineType, defineField} from 'sanity'

/**
 * Article
 * Enkel artikkeltype med kategorier (relasjon -> category)
 */
export const article = defineType({
  name: 'article',
  title: 'Artikkel',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Relasjon: Article -> Category (mange-til-mange)
     * Samme kategorier kan brukes av både articles og news
     */
    defineField({
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
    }),

    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
  },
})
