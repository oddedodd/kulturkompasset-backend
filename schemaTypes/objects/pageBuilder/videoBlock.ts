import {defineField, defineType} from 'sanity'

function isYoutubeOrVimeo(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    return (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'vimeo.com' ||
      host === 'player.vimeo.com'
    )
  } catch {
    return false
  }
}

export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video (YouTube/Vimeo)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'Lim inn lenke fra YouTube eller Vimeo.',
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true
          return isYoutubeOrVimeo(value) ? true : 'Kun YouTube- og Vimeo-lenker er tillatt.'
        }),
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Bildetekst',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare({title, url}) {
      return {
        title: title || 'Video block',
        subtitle: url || 'Video',
      }
    },
  },
})
