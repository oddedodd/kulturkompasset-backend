import {defineArrayMember, defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',
  description:
    'Felles kategorier (tema, sjanger, målgruppe) brukt på tvers av arrangement, artikler og filtrering.',
  fields: [
    defineField({
      name: 'title',
      title: 'Navn',
      type: 'string',
      description: 'Visningsnavn, f.eks. "Rock", "Småbarn" eller "Lokal kultur".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL/filtervennlig nøkkel.',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kategori-type',
      type: 'string',
      description: 'Hva slags kategori dette er.',
      options: {
        list: [
          {title: 'Tema', value: 'theme'},
          {title: 'Sjanger', value: 'genre'},
          {title: 'Målgruppe', value: 'audience'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'theme',
    }),
    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      description: 'Hvor kategorien er relevant i produktet.',
      of: [
        defineArrayMember({
          type: 'string',
          options: {
            list: [
              {title: 'Kalender', value: 'kalender'},
              {title: 'Backstage', value: 'backstage'},
              {title: 'Barn & familie', value: 'barn-og-familie'},
              {title: 'Spillelister', value: 'spillelister'},
              {title: 'Om Kulturkompasset', value: 'om-kulturkompasset'},
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Valgfri intern forklaring for redaksjonen.',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      kind: 'kind',
      slug: 'slug.current',
    },
    prepare({title, kind, slug}) {
      return {
        title,
        subtitle: [kind, slug ? `/${slug}` : null].filter(Boolean).join(' • '),
      }
    },
  },
})
