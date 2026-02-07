import {defineField, defineType} from 'sanity'

export const venue = defineType({
  name: 'venue',
  title: 'Venue / Sted',
  type: 'document',
  description: 'Gjenbrukbart sted for arrangement, slik at adresseinformasjon ikke dupliseres.',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Navn på sted/scene/lokale.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'By',
      type: 'string',
      description: 'By eller tettsted.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'string',
      description: 'Gateadresse (valgfri).',
    }),
    defineField({
      name: 'geo',
      title: 'Kartposisjon',
      type: 'geopoint',
      description: 'Valgfri koordinat for kartintegrasjon.',
    }),
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'url',
      description: 'Offisiell nettside for stedet.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city',
    },
    prepare({title, city}) {
      return {
        title,
        subtitle: city || 'Ukjent by',
      }
    },
  },
})
