import {defineType, defineField} from 'sanity'

/**
 * News
 * Nyheter som kan knyttes til én eller flere kategorier
 */
export const news = defineType({
  title: 'News',
  name: 'news',
  type: 'document',

  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Relasjon: News → Category
     * Samme kategorier brukes også av Articles
     */
    defineField({
      title: 'Categories',
      name: 'categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      validation: (Rule) => Rule.unique(),
    }),

    defineField({
      title: 'Featured Image',
      name: 'featuredImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          title: 'Alt Text',
          name: 'alt',
          type: 'string',
          description: 'Alternative text for accessibility',
        },
      ],
    }),

    defineField({
      title: 'Body',
      name: 'body',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      title: 'Date',
      name: 'date',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      date: 'date',
    },
    prepare({title, media, date}) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
        media,
      }
    },
  },
})
