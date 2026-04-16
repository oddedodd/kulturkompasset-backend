import {defineArrayMember, defineField, defineType} from 'sanity'

export const scrollytellBlock = defineType({
  name: 'scrollytellBlock',
  title: 'Scrollytell',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Internt navn for å identifisere denne scrollytell-blokken.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Bakgrunnsbilde',
      type: 'image',
      description: 'Bilde som dekker hele visningsflaten bak tekstboksene.',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'textBoxes',
      title: 'Tekstbokser',
      type: 'array',
      description: 'Én eller flere tekstbokser som vises over bakgrunnsbildet.',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'scrollytellTextBox',
          title: 'Tekstboks',
          fields: [
            defineField({
              name: 'text',
              title: 'Tekst',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'textColor',
              title: 'Tekstfarge',
              type: 'string',
              description: 'Farge på teksten i boksen.',
              options: {
                list: [
                  {title: 'Hvit', value: '#ffffff'},
                  {title: 'Svart', value: '#111827'},
                  {title: 'Primær blå', value: '#1d4ed8'},
                ],
              },
              initialValue: '#ffffff',
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Bakgrunnsfarge',
              type: 'string',
              description: 'Bakgrunnsfarge for tekstboksen.',
              options: {
                list: [
                  {title: 'Gjennomsiktig mørk', value: 'rgba(0,0,0,0.6)'},
                  {title: 'Gjennomsiktig lys', value: 'rgba(255,255,255,0.7)'},
                  {title: 'Svart', value: '#111827'},
                  {title: 'Hvit', value: '#ffffff'},
                  {title: 'Primær blå', value: '#1d4ed8'},
                ],
              },
              initialValue: 'rgba(0,0,0,0.6)',
            }),
          ],
          preview: {
            select: {
              text: 'text',
              textColor: 'textColor',
              backgroundColor: 'backgroundColor',
            },
            prepare({text, textColor, backgroundColor}) {
              return {
                title: text || 'Tom tekstboks',
                subtitle: `Tekst: ${textColor || 'standard'} • Bakgrunn: ${backgroundColor || 'standard'}`,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      media: 'backgroundImage',
    },
    prepare({name, media}) {
      return {
        title: name || 'Scrollytell',
        subtitle: 'Scrollytell',
        media,
      }
    },
  },
})
