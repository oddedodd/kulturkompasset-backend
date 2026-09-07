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

    // --- Importerte arrangement -------------------------------------------
    // Feltene under fylles av importfunksjonen og er sporbarhet, ikke
    // redaksjonelt innhold. De ligger i en egen sammenslått gruppe nederst og
    // er tomme på arrangement som er opprettet for hånd.
    defineField({
      name: 'importSource',
      title: 'Importert fra',
      type: 'string',
      description: 'Hvilken kommunes program arrangementet ble hentet fra.',
      fieldset: 'import',
      readOnly: true,
      options: {
        list: [
          {title: 'Namsos kulturhus', value: 'namsos'},
          {title: 'Kulturhuset Kuben (Grong)', value: 'grong'},
          {title: 'Kultur i Nærøysund', value: 'naroysund'},
        ],
      },
    }),
    defineField({
      name: 'importWarning',
      title: 'Varsel fra importen',
      type: 'text',
      rows: 3,
      description:
        'Settes når arrangementet ligner på et som finnes fra før. Sjekk mot det som nevnes her før du publiserer, og tøm feltet når du har vurdert det.',
      fieldset: 'import',
    }),
    defineField({
      name: 'importVenueName',
      title: 'Sted hos kilden',
      type: 'string',
      description:
        'Stedsnavnet slik kilden skrev det. Fyll ut Sted-feltet over hvis importen ikke fant et matchende sted.',
      fieldset: 'import',
      readOnly: true,
    }),
    defineField({
      name: 'importImageUrl',
      title: 'Bilde hos kilden (URL)',
      type: 'url',
      description:
        'Originalbildet hos kilden. Importen laster det ned til Hovedbilde automatisk; lenken ligger her for etterprøving og i tilfelle nedlastingen feilet.',
      fieldset: 'import',
      readOnly: true,
    }),
    defineField({
      name: 'importExternalId',
      title: 'ID hos kilden',
      type: 'string',
      description: 'Brukes til å kjenne igjen arrangementet ved senere import.',
      fieldset: 'import',
      readOnly: true,
    }),
    defineField({
      name: 'importedAt',
      title: 'Importert',
      type: 'datetime',
      fieldset: 'import',
      readOnly: true,
    }),
  ],
  fieldsets: [
    {
      name: 'import',
      title: 'Import',
      description: 'Spor fra automatisk import. Tomt på arrangement lagt inn for hånd.',
      options: {collapsible: true, collapsed: true},
    },
  ],
  preview: {
    select: {
      title: 'title',
      startsAt: 'startsAt',
      media: 'heroImage',
      status: 'status',
    },
    prepare({title, startsAt, media, status}) {
      const date = startsAt
        ? new Date(startsAt).toLocaleString('nb-NO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Ingen dato'
      const statusLabel =
        {upcoming: 'Kommende', completed: 'Gjennomført', cancelled: 'Avlyst'}[
          status as 'upcoming' | 'completed' | 'cancelled'
        ] || 'Kommende'
      return {
        title,
        subtitle: `${date} • ${statusLabel}`,
        media,
      }
    },
  },
})
