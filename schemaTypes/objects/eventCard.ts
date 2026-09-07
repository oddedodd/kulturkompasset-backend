/**
 * Arrangementskort
 * ----------------
 * Settes inn mellom avsnittene i et tekstfelt i sidebyggeren, og viser
 * arrangementet som et klikkbart kort med dato, tittel og ingress.
 *
 * Tittel og ingress hentes fra arrangementet, men kan overstyres per artikkel.
 * Det gjør at redaktøren kan vinkle kortet mot saken — f.eks. når kultursjefen
 * trekker fram et arrangement i et intervju — uten å endre selve
 * arrangementsdokumentet.
 */
import {defineField, defineType} from 'sanity'

import {upcomingEventReferenceOptions} from '../../lib/eventQueries'

export const eventCard = defineType({
  name: 'eventCard',
  title: 'Arrangement',
  type: 'object',
  description: 'Kort som lenker til et kommende arrangement, med valgfri egen tittel og ingress.',
  fields: [
    defineField({
      name: 'event',
      title: 'Arrangement',
      type: 'reference',
      description: 'Velg blant kommende arrangement, sortert med det nærmeste først.',
      to: [{type: 'event'}],
      options: upcomingEventReferenceOptions,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Egen tittel',
      type: 'string',
      description:
        'Valgfri. La stå tom for å bruke arrangementets egen tittel. Fyll ut hvis kortet skal vinkles mot denne artikkelen.',
    }),
    defineField({
      name: 'summary',
      title: 'Egen ingress',
      type: 'text',
      rows: 3,
      description:
        'Valgfri. La stå tom for å bruke ingressen fra arrangementet. Fyll ut hvis du vil skrive en kortere eller mer saksnær tekst.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      summary: 'summary',
      eventTitle: 'event.title',
      eventSummary: 'event.summary',
      startsAt: 'event.startsAt',
      media: 'event.heroImage',
    },
    prepare({title, summary, eventTitle, eventSummary, startsAt, media}) {
      const date = startsAt
        ? new Date(startsAt).toLocaleDateString('nb-NO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Ingen dato'
      const overridden = title || summary ? ' • egen tekst' : ''
      const text = summary || eventSummary
      return {
        title: title || eventTitle || 'Ingen arrangement valgt',
        subtitle: `${date}${overridden}${text ? ` — ${text}` : ''}`,
        media,
      }
    },
  },
})
