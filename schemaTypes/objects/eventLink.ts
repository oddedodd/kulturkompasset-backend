/**
 * Lenke til arrangement (annotasjon)
 * ----------------------------------
 * Brukes som markering i Portable Text: redaktøren markerer et ord eller en
 * setning i teksten og knytter den til et kommende arrangement. Den markerte
 * teksten blir lenketeksten — trenger du å vise tittel og ingress fra
 * arrangementet, bruk `eventCard` i stedet.
 */
import {defineField, defineType} from 'sanity'

import {upcomingEventReferenceOptions} from '../../lib/eventQueries'

export const eventLink = defineType({
  name: 'eventLink',
  title: 'Lenke til arrangement',
  type: 'object',
  description: 'Lenker den markerte teksten til et arrangement i kalenderen.',
  fields: [
    defineField({
      name: 'event',
      title: 'Arrangement',
      type: 'reference',
      description:
        'Velg blant kommende arrangement. Teksten du har markert i artikkelen blir lenketeksten.',
      to: [{type: 'event'}],
      options: upcomingEventReferenceOptions,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'event.title',
      startsAt: 'event.startsAt',
    },
    prepare({title, startsAt}) {
      const date = startsAt
        ? new Date(startsAt).toLocaleDateString('nb-NO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Ingen dato'
      return {
        title: title || 'Ingen arrangement valgt',
        subtitle: `Lenke til arrangement • ${date}`,
      }
    },
  },
})
