import {defineField, defineType} from 'sanity'

export const tips = defineType({
  name: 'tips',
  title: 'Tips',
  type: 'document',
  description: 'Innsendte tips fra brukere som kan behandles videre av redaksjonen.',
  fieldsets: [
    {
      name: 'tip',
      title: 'Tips',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'submitter',
      title: 'Informasjon om innsender',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Navn på tips',
      type: 'string',
      fieldset: 'tip',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Dato',
      type: 'datetime',
      fieldset: 'tip',
    }),
    defineField({
      name: 'price',
      title: 'Pris',
      type: 'string',
      fieldset: 'tip',
    }),
    defineField({
      name: 'place',
      title: 'Sted',
      type: 'string',
      fieldset: 'tip',
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Eventuell link til billettsalg',
      type: 'url',
      fieldset: 'tip',
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      fieldset: 'tip',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      fieldset: 'tip',
      options: {
        accept: 'image/jpeg,image/png,image/svg+xml',
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submitterName',
      title: 'Navn på innsender',
      type: 'string',
      fieldset: 'submitter',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submitterPhone',
      title: 'Telefonnummer',
      type: 'string',
      fieldset: 'submitter',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submitterEmail',
      title: 'E-post',
      type: 'email',
      fieldset: 'submitter',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Innsendt',
      type: 'datetime',
      fieldset: 'submitter',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitleDate: 'date',
      subtitlePlace: 'place',
      media: 'image',
    },
    prepare({title, subtitleDate, subtitlePlace, media}) {
      const dateText = subtitleDate
        ? new Date(subtitleDate).toLocaleString('nb-NO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Ingen dato'

      return {
        title,
        subtitle: `${dateText} - ${subtitlePlace || 'Uten sted'}`,
        media,
      }
    },
  },
})
