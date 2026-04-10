import {defineField, defineType} from 'sanity'

export const bulletinSubmission = defineType({
  name: 'bulletinSubmission',
  title: 'Bulletin-innsending',
  type: 'document',
  description: 'Innsendt bulletin fra skjema i frontend som kan godkjennes i Studio.',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Dato',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'organizer',
      title: 'Arrangør',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'place',
      title: 'Sted',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contact',
      title: 'Kontaktperson',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Pris',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
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
      name: 'submittedAt',
      title: 'Innsendt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitleDate: 'date',
      subtitleOrganizer: 'organizer',
      subtitlePlace: 'place',
      media: 'image',
    },
    prepare({title, subtitleDate, subtitleOrganizer, subtitlePlace, media}) {
      const dateText = subtitleDate
        ? new Date(subtitleDate).toLocaleString('nb-NO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Ingen dato'
      return {
        title,
        subtitle: `Venter på godkjenning - ${dateText} - ${subtitleOrganizer || 'Uten arrangør'} - ${subtitlePlace || 'Uten sted'}`,
        media,
      }
    },
  },
})
