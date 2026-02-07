import {defineArrayMember, defineField, defineType} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Arrangement',
  type: 'document',
  description: 'Kalenderinnhold med dato, sted, medvirkende og relasjoner til redaksjonelt innhold.',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Navnet på arrangementet slik det vises i lister og detaljside.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-vennlig identifikator for arrangementssiden.',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Brukes for å styre visning av kommende/gjennomførte/avlyste arrangement.',
      options: {
        list: [
          {title: 'Kommende', value: 'upcoming'},
          {title: 'Gjennomført', value: 'completed'},
          {title: 'Avlyst', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Start',
      type: 'datetime',
      description: 'Startdato og klokkeslett for arrangementet.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Slutt',
      type: 'datetime',
      description: 'Valgfri sluttdato/-tid, nyttig for heldags- eller flerdagsarrangement.',
    }),
    defineField({
      name: 'venue',
      title: 'Sted',
      type: 'reference',
      description: 'Referanse til et sted/venue-dokument.',
      to: [{type: 'venue'}],
    }),
    defineField({
      name: 'contributors',
      title: 'Artister / medvirkende',
      type: 'array',
      description: 'Personer/prosjekter knyttet til arrangementet.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'contributor'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (Rule) => Rule.unique(),
      description: 'Bruk kategorier for filtrering i kalender og barn & familie.',
    }),
    defineField({
      name: 'summary',
      title: 'Ingress',
      type: 'text',
      description: 'Kort oppsummering for kort, teaser og deling.',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hovedbilde',
      type: 'image',
      description: 'Primærbilde brukt i kort og på detaljside.',
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
      name: 'body',
      title: 'Innhold',
      type: 'array',
      description: 'Utfyllende informasjon om arrangementet.',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Billetter (URL)',
      type: 'url',
      description: 'Lenke til billettsalg eller påmelding.',
    }),
    defineField({
      name: 'priceFrom',
      title: 'Pris fra (NOK)',
      type: 'number',
      description: 'Laveste pris i norske kroner.',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Relaterte artikler',
      type: 'array',
      description: 'Bakgrunnssaker, intervjuer eller omtaler knyttet til arrangementet.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'partners',
      title: 'Partnere',
      type: 'array',
      description: 'Partnere/sponsorer som skal krediteres på arrangementet.',
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
      startsAt: 'startsAt',
      media: 'heroImage',
      status: 'status',
    },
    prepare({title, startsAt, media, status}) {
      const date = startsAt ? new Date(startsAt).toLocaleDateString('nb-NO') : 'Ingen dato'
      return {
        title,
        subtitle: `${date} • ${status || 'upcoming'}`,
        media,
      }
    },
  },
})
