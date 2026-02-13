import {defineArrayMember, defineField, defineType} from 'sanity'

export const imageGalleryBlock = defineType({
  name: 'imageGalleryBlock',
  title: 'Bildegalleri',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Valgfri overskrift for galleriet.',
    }),
    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt-tekst',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Bildetekst',
              type: 'string',
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(2).error('Legg til minst to bilder i galleriet.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images',
      media: 'images.0',
    },
    prepare({title, images, media}) {
      const count = Array.isArray(images) ? images.length : 0
      return {
        title: title || 'Bildegalleri',
        subtitle: `${count} bilde${count === 1 ? '' : 'r'}`,
        media,
      }
    },
  },
})
