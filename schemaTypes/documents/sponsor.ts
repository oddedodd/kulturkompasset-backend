import {defineType, defineField} from 'sanity'

/**
 * Sponsor
 * Brukes til å lagre informasjon om sponsorer
 * som kan knyttes til artikler, arrangementer eller annet innhold
 */

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',

  fields: [
    /**
     * Navn på sponsor
     */
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Sponsorlogo
     */
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    /**
     * Sponsorens nettside
     */
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'url',
    }),

    /**
     * SOME-kanaler
     * Fleksibel liste (Facebook, Instagram, LinkedIn osv.)
     */
    defineField({
      name: 'socialChannels',
      title: 'SoMe-kanaler',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Plattform',
              type: 'string',
              description: 'F.eks. Facebook, Instagram, LinkedIn',
            },
            {
              name: 'url',
              title: 'Lenke',
              type: 'url',
            },
          ],
        },
      ],
    }),

    /**
     * Status for sponsor
     * Brukes til å styre synlighet i frontend
     */
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Aktiv', value: 'active'},
          {title: 'Inaktiv', value: 'inactive'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),

    /**
     * Interne kommentarer
     * Vises kun i Sanity Studio
     */
    defineField({
      name: 'internalNotes',
      title: 'Interne kommentarer',
      type: 'text',
      rows: 4,
    }),
  ],

  /**
   * Hvordan sponsor vises i lister i Sanity Studio
   */
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      status: 'status',
    },
    prepare({title, media, status}) {
      return {
        title,
        subtitle: status === 'active' ? 'Aktiv sponsor' : 'Inaktiv sponsor',
        media,
      }
    },
  },
})
