import {defineArrayMember, defineField, defineType} from 'sanity'

export const partner = defineType({
  name: 'partner',
  title: 'Partner / Sponsor',
  type: 'document',
  description: 'Partner/sponsor som kan knyttes til forside, arrangement, artikler og spillelister.',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Navn på partner/sponsor.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Logo brukt i partnerflater.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'url',
      description: 'Lenke som åpnes når partner vises i frontend.',
    }),
    defineField({
      name: 'tier',
      title: 'Nivå',
      type: 'string',
      description: 'Brukes for prioritering og visuell presentasjon.',
      options: {
        list: [
          {title: 'Hovedpartner', value: 'main'},
          {title: 'Partner', value: 'partner'},
          {title: 'Støttespiller', value: 'supporter'},
        ],
      },
      initialValue: 'partner',
    }),
    defineField({
      name: 'active',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Skru av hvis partneren ikke skal vises.',
      initialValue: true,
    }),
    defineField({
      name: 'sections',
      title: 'Synlig i seksjoner',
      type: 'array',
      description: 'Hjelpefelt for hvor partneren primært skal brukes.',
      of: [
        defineArrayMember({
          type: 'string',
          options: {
            list: [
              {title: 'Hjem', value: 'home'},
              {title: 'Kalender', value: 'kalender'},
              {title: 'Backstage', value: 'backstage'},
              {title: 'Barn & familie', value: 'barn-og-familie'},
              {title: 'Spillelister', value: 'spillelister'},
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      active: 'active',
      tier: 'tier',
    },
    prepare({title, media, active, tier}) {
      return {
        title,
        subtitle: `${tier || 'partner'}${active === false ? ' • inaktiv' : ''}`,
        media,
      }
    },
  },
})
