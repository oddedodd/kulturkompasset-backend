/**
 * CTA (Call To Action)
 * -------------------
 * Et lite gjenbrukbart objekt for knapper/lenker.
 * Brukes inni andre dokumenter (artikler, embeds, sponsorinnhold).
 */
import {defineType, defineField} from 'sanity'

export const cta = defineType({
  title: 'CTA',
  name: 'cta',
  type: 'object',
  fields: [
    defineField({
      title: 'Tekst på knapp / lenke',
      name: 'label',
      type: 'string',
      description: 'Tekst på knapp / lenke. Eksempel: "Les mer", "Kontakt oss", "Les mer om våre tjenester", etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      title: 'Lenke (URL)',
      name: 'link',
      type: 'url',
      description: 'Lenke (URL). Eksempel: "https://namdalsavisa.no", "https://na-kreativ.no", etc.',
      validation: (Rule) => Rule.required(),
    }),
  ],
})