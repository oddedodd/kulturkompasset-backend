import { defineType, defineField } from 'sanity'

export const event = defineType({
    name: 'event',
    title: 'Arrangement',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Tittel',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
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
            name: 'location',
            title: 'Sted',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Beskrivelse',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'categories',
            title: 'Kategorier',
            description: 'Velg en eller flere kategorier som beskriver arrangementet (eks. Konsert, Teater)',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: 'relatedArticle',
            title: 'Relatert Artikkel',
            description: 'Knytt arrangementet til en relevant artikkel (valgfritt)',
            type: 'reference',
            to: [{ type: 'article' }],
        }),
        defineField({
            name: 'featuredImage',
            title: 'Featured Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    title: 'Alt Text',
                    type: 'string',
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            date: 'date',
            media: 'featuredImage',
        },
        prepare({ title, date, media }) {
            return {
                title,
                subtitle: date ? new Date(date).toLocaleDateString() : 'Ingen dato',
                media,
            }
        },
    },
})
