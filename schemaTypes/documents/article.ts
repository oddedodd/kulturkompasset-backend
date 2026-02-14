import {defineArrayMember, defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Artikkel',
  type: 'document',
  description: 'Redaksjonelt innhold for Backstage, Barn & familie, Om-sider, guider og anmeldelser.',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Overskriften som vises på kort og artikkelside.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
      description: 'Valgfri undertittel som vises under tittel på artikkelsiden.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-vennlig identifikator for artikkelsiden.',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentType',
      title: 'Innholdstype',
      type: 'string',
      description: 'Styrer hvor artikkelen typisk brukes i produktet.',
      options: {
        list: [
          {title: 'Backstage', value: 'backstage'},
          {title: 'Nyheter', value: 'news'},
          {title: 'Barn & familie', value: 'barn-og-familie'},
          {title: 'Om Kulturkompasset', value: 'om-kulturkompasset'},
          {title: 'Guide', value: 'guide'},
          {title: 'Anmeldelse', value: 'review'},
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'backstage',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      description: 'Publiseringsdato brukt for sortering og visning.',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'authors',
      title: 'Forfattere',
      type: 'array',
      description: 'Referanse til en eller flere bidragsytere.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'contributor'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      description: 'Kategorier brukt til filtrering og relatering.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Ingress',
      type: 'text',
      description: 'Kort sammendrag for kortvisning og deling.',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hovedbilde',
      type: 'image',
      description: 'Primærbilde til artikkelkort og topp på artikkelsiden.',
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
      name: 'pageBuilder',
      title: 'Sidebygger',
      type: 'array',
      description: 'Bygg artikkelen med fleksible blokker. Nye blokktyper kan legges til senere.',
      of: [
        defineArrayMember({type: 'heroBlock'}),
        defineArrayMember({type: 'leadBlock'}),
        defineArrayMember({type: 'imageBlock'}),
        defineArrayMember({type: 'imageGalleryBlock'}),
        defineArrayMember({type: 'imageTextLeftBlock'}),
        defineArrayMember({type: 'imageTextRightBlock'}),
        defineArrayMember({type: 'videoBlock'}),
        defineArrayMember({type: 'embedBlock'}),
        defineArrayMember({type: 'blockquoteBlock'}),
        defineArrayMember({type: 'dividerBlock'}),
        defineArrayMember({type: 'textBlock'}),
        defineArrayMember({type: 'cta'}),
      ],
      options: {
        insertMenu: {
          groups: [
            {name: 'intro', title: 'Intro', of: ['heroBlock', 'leadBlock']},
            {
              name: 'media',
              title: 'Media',
              of: ['imageBlock', 'imageGalleryBlock', 'videoBlock', 'embedBlock'],
            },
            {
              name: 'layouts',
              title: 'Layout',
              of: ['imageTextLeftBlock', 'imageTextRightBlock'],
            },
            {name: 'content', title: 'Innhold', of: ['textBlock', 'blockquoteBlock', 'dividerBlock']},
            {name: 'action', title: 'Handling', of: ['cta']},
          ],
          views: [{name: 'list'}],
        },
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasPageBuilder = Array.isArray(value) && value.length > 0
          const legacyBody = context.document?.body
          const hasLegacyBody = Array.isArray(legacyBody) && legacyBody.length > 0
          return hasPageBuilder || hasLegacyBody
            ? true
            : 'Legg til minst én blokk i Sidebygger.'
        }),
    }),
    defineField({
      name: 'body',
      title: 'Legacy innhold (gammel)',
      type: 'array',
      description: 'Gammelt tekstfelt beholdes midlertidig for eksisterende data.',
      of: [defineArrayMember({type: 'block'})],
      hidden: true,
    }),
    defineField({
      name: 'relatedEvents',
      title: 'Relaterte arrangement',
      type: 'array',
      description: 'Arrangement som hører sammen med artikkelen.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'event'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'partners',
      title: 'Partnere',
      type: 'array',
      description: 'Partnere/sponsorer knyttet til artikkelinnholdet.',
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
      contentType: 'contentType',
      media: 'heroImage',
      publishedAt: 'publishedAt',
    },
    prepare({title, contentType, media, publishedAt}) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('nb-NO') : 'Udatert'
      return {
        title,
        subtitle: `${contentType || 'artikkel'} • ${date}`,
        media,
      }
    },
  },
})
