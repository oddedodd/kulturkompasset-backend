import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Sideinnstillinger',
  type: 'document',
  description:
    'Global styring av navigasjon og forside. Opprett normalt kun ett dokument av denne typen.',
  fields: [
    defineField({
      name: 'title',
      title: 'Intern tittel',
      type: 'string',
      description: 'Kun intern identifikasjon i Studio, vises ikke direkte på nettstedet.',
      initialValue: 'Kulturkompasset settings',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainNavigation',
      title: 'Hovednavigasjon',
      type: 'array',
      description: 'Definerer menypunktene i toppnavigasjonen.',
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
                  {title: 'Barn & familie', value: 'barn-og-familie'},
                  {title: 'Spillelister', value: 'spillelister'},
                  {title: 'Om Kulturkompasset', value: 'om-kulturkompasset'},
                ],
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'featuredEvents',
      title: 'Utvalgte arrangement (forside)',
      type: 'array',
      description: 'Arrangement som løftes frem på hovedsiden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'event'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'featuredBackstage',
      title: 'Utvalgte backstage-artikler',
      type: 'array',
      description: 'Kurert liste for Backstage-seksjonen.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'featuredFamily',
      title: 'Utvalgte barn & familie',
      type: 'array',
      description: 'Kurert liste for Barn & familie-seksjonen.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'featuredPlaylists',
      title: 'Utvalgte spillelister',
      type: 'array',
      description: 'Spillelister som vises i fremhevede posisjoner.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'playlist'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'homePartners',
      title: 'Partnere på forside',
      type: 'array',
      description: 'Partnere/sponsorer som skal vises på forsiden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'partner'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'aboutText',
      title: 'Om Kulturkompasset',
      type: 'array',
      description: 'Hovedtekst for Om-siden.',
      of: [defineArrayMember({type: 'block'})],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
