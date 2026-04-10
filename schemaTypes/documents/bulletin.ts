import {defineField, defineType} from 'sanity'

export const bulletin = defineType({
  name: 'bulletin',
  title: 'Bulletin',
  type: 'document',
  description: 'Godkjent bulletin som publiseres i systemet.',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
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
      name: 'approvedAt',
      title: 'Godkjent',
      type: 'datetime',
      readOnly: true,
      description: 'Tidspunkt da innsendt bulletin ble godkjent.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitleDate: 'date',
      subtitleOrganizer: 'organizer',
      media: 'image',
    },
    prepare({title, subtitleDate, subtitleOrganizer, media}) {
      const dateText = subtitleDate
        ? new Date(subtitleDate).toLocaleString('nb-NO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Ingen dato'
      return {
        title,
        subtitle: `${dateText} - ${subtitleOrganizer || 'Uten arrangør'}`,
        media,
      }
    },
  },
})
