import {defineType, defineField} from 'sanity'

/**
 * Category
 * Felles kategorier som kan brukes både på News og Articles
 */
export const category = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',

  fields: [
    /**
     * Navn på kategorien (vises i UI)
     */
    defineField({
      name: 'title',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Slug brukes til URL-er, filtrering og rene lenker
     */
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Valgfri beskrivelse (internt eller i frontend hvis du ønsker)
     */
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: subtitle ? `/${subtitle}` : '',
      }
    },
  },
})
