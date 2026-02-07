import {defineField, defineType} from 'sanity'

export const contributor = defineType({
  name: 'contributor',
  title: 'Bidragsyter',
  type: 'document',
  description:
    'Gjenbrukbar person/prosjekt (artist, journalist, kurator, arrangør) som kan kobles til flere innholdstyper.',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Fullt navn på person, band eller prosjekt.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Rolle',
      type: 'string',
      description: 'Primærrolle i systemet.',
      options: {
        list: [
          {title: 'Artist', value: 'artist'},
          {title: 'Band', value: 'band'},
          {title: 'Journalist', value: 'journalist'},
          {title: 'Kurator', value: 'curator'},
          {title: 'Arrangør', value: 'organizer'},
        ],
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-vennlig identifikator.',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      description: 'Profilbilde for kort, byline og detaljer.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Kort bio',
      type: 'text',
      description: 'Kort presentasjon brukt i frontend.',
      rows: 4,
    }),
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'url',
      description: 'Offisiell nettside eller profil.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
})
