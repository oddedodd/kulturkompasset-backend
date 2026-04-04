import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Sideinnstillinger',
  type: 'document',
  description:
    'Global styring av navigasjon og forside. Opprett normalt kun ett dokument av denne typen.',
  fieldsets: [
    {
      name: 'general',
      title: 'Generelt',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'navigation',
      title: 'Navigasjon',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'frontPage',
      title: 'Forside',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'seo',
      title: 'SEO per side',
      options: {collapsible: true, collapsed: true},
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Intern tittel',
      type: 'string',
      fieldset: 'general',
      description: 'Kun intern identifikasjon i Studio, vises ikke direkte på nettstedet.',
      initialValue: 'Kulturkompasset settings',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainNavigation',
      title: 'Hovednavigasjon',
      type: 'array',
      fieldset: 'navigation',
      description: 'Definer rekkefølge og innhold i toppmenyen.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Tekst',
              type: 'string',
              description: 'Teksten brukeren ser i menyen.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'section',
              title: 'Seksjon',
              type: 'string',
              description: 'Hvilken seksjon menypunktet skal peke til.',
              options: {
                list: [
                  {title: 'Kalender', value: 'kalender'},
                  {title: 'Backstage', value: 'backstage'},
                  {title: 'Venues', value: 'venues'},
                  {title: 'Spillelister', value: 'spillelister'},
                  {title: 'Oppslagstavla', value: 'bulletin'},
                ],
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'featuredEvents',
      title: 'Utvalgte arrangement',
      type: 'array',
      fieldset: 'frontPage',
      description: 'Arrangement som skal løftes frem på forsiden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'event'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'seoHome',
      title: 'Hovedside',
      type: 'seo',
      fieldset: 'seo',
      description: 'Metadata/OG for hovedsiden.',
    }),
    defineField({
      name: 'seoCalendar',
      title: 'Kalender',
      type: 'seo',
      fieldset: 'seo',
      description: 'Metadata/OG for oversiktssiden med arrangementer.',
    }),
    defineField({
      name: 'seoBackstage',
      title: 'Backstage',
      type: 'seo',
      fieldset: 'seo',
      description: 'Metadata/OG for oversiktssiden med backstage-innhold.',
    }),
    defineField({
      name: 'seoVenues',
      title: 'Venues',
      type: 'seo',
      fieldset: 'seo',
      description: 'Metadata/OG for oversiktssiden med venues/steder.',
    }),
    defineField({
      name: 'seoBulletin',
      title: 'Oppslagstavla',
      type: 'seo',
      fieldset: 'seo',
      description: 'Metadata/OG for oversiktssiden med oppslag.',
    }),
    defineField({
      name: 'featuredBackstage',
      title: 'Utvalgt backstage-innhold',
      type: 'array',
      fieldset: 'frontPage',
      description: 'Innhold som skal løftes frem i backstage-seksjonen.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'featuredFamily',
      title: 'Utvalgt barn og familie',
      type: 'array',
      fieldset: 'frontPage',
      description: 'Innhold som skal løftes frem i barn og familie-seksjonen.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'featuredPlaylists',
      title: 'Utvalgte spillelister',
      type: 'array',
      fieldset: 'frontPage',
      description: 'Spillelister som skal løftes frem på forsiden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'playlist'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'homePartners',
      title: 'Partnere på forsiden',
      type: 'array',
      fieldset: 'frontPage',
      description: 'Partnere/sponsorer som skal vises på forsiden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'partner'}]})],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
