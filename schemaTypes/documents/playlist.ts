import {defineArrayMember, defineField, defineType} from 'sanity'

export const playlist = defineType({
  name: 'playlist',
  title: 'Spilleliste',
  type: 'document',
  description: 'Kuraterte spillelister med anbefalinger og koblinger til artikler/arrangement.',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Navn på spillelisten.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-vennlig identifikator for spillelistesiden.',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'curator',
      title: 'Kurator',
      type: 'reference',
      description: 'Hvem som har satt sammen spillelisten.',
      to: [{type: 'contributor'}],
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Kort introduksjon til spillelisten.',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover',
      type: 'image',
      description: 'Omslagsbilde brukt i liste- og detaljvisning.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify URL',
      type: 'url',
      description: 'Direktelenke til spillelisten i Spotify.',
    }),
    defineField({
      name: 'appleMusicUrl',
      title: 'Apple Music URL',
      type: 'url',
      description: 'Direktelenke til spillelisten i Apple Music.',
    }),
    defineField({
      name: 'featuredItems',
      title: 'Anbefalinger i listevisning',
      type: 'array',
      description: 'Fargerike anbefalingskort slik de vises i prototype for Spillelister.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Tittel',
              type: 'string',
              description: 'Teksten som vises i anbefalingskortet.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'themeColor',
              title: 'Farge',
              type: 'string',
              description: 'Visuell fargekode for kortet i frontend.',
              options: {
                list: [
                  {title: 'Grønn', value: 'green'},
                  {title: 'Blå', value: 'blue'},
                  {title: 'Gul', value: 'yellow'},
                ],
              },
              initialValue: 'blue',
            }),
            defineField({
              name: 'linkedEvent',
              title: 'Lenket arrangement',
              type: 'reference',
              description: 'Valgfri lenke til relevant arrangement.',
              to: [{type: 'event'}],
            }),
            defineField({
              name: 'linkedArticle',
              title: 'Lenket artikkel',
              type: 'reference',
              description: 'Valgfri lenke til relevant artikkel.',
              to: [{type: 'article'}],
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'themeColor',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'partners',
      title: 'Partnere',
      type: 'array',
      description: 'Partnere/sponsorer knyttet til spillelisten.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'partner'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'Valgfrie metadata for søk og deling.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'curator.name',
      media: 'coverImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? `Kurator: ${subtitle}` : 'Ingen kurator',
        media,
      }
    },
  },
})
