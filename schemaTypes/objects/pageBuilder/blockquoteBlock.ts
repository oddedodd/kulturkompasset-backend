import {defineField, defineType} from 'sanity'

export const blockquoteBlock = defineType({
  name: 'blockquoteBlock',
  title: 'Blockquote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Sitat',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Kilde',
      type: 'string',
    }),
    defineField({
      name: 'textColor',
      title: 'Tekstfarge',
      type: 'string',
      description: 'Velg tekstfarge for sitatblokken.',
      options: {
        list: [
          {title: 'Automatisk (anbefalt)', value: 'auto'},
          {title: 'Lys', value: 'light'},
          {title: 'Mørk', value: 'dark'},
          {title: 'Primær blå', value: 'brand'},
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Bakgrunnsbilde',
      type: 'image',
      description: 'Valgfritt bakgrunnsbilde for sitatblokken.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      quote: 'quote',
      attribution: 'attribution',
      media: 'backgroundImage',
      textColor: 'textColor',
    },
    prepare({quote, attribution, media, textColor}) {
      return {
        title: quote ? `"${quote}"` : 'Blockquote',
        subtitle: [attribution || 'Blockquote', textColor ? `Tekst: ${textColor}` : null]
          .filter(Boolean)
          .join(' • '),
        media,
      }
    },
  },
})
