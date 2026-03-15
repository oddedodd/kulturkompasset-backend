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
    defineField({
      name: 'isApproved',
      title: 'Godkjent',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'approvedAt',
      title: 'Godkjent tidspunkt',
      type: 'datetime',
      readOnly: true,
      hidden: ({document}) => !document?.isApproved,
    }),
    defineField({
      name: 'approvedBulletin',
      title: 'Godkjent bulletin',
      type: 'reference',
      to: [{type: 'bulletin'}],
      readOnly: true,
      hidden: ({document}) => !document?.isApproved,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitleDate: 'date',
      subtitleOrganizer: 'organizer',
      media: 'image',
      isApproved: 'isApproved',
    },
    prepare({title, subtitleDate, subtitleOrganizer, media, isApproved}) {
      const dateText = subtitleDate
        ? new Date(subtitleDate).toLocaleString('nb-NO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Ingen dato'
      const status = isApproved ? 'Godkjent' : 'Venter på godkjenning'
      return {
        title,
        subtitle: `${status} - ${dateText} - ${subtitleOrganizer || 'Uten arrangør'}`,
        media,
      }
    },
  },
})
