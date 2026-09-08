import {defineField, defineType} from 'sanity'

import {NAVIGATION_SECTION_TITLES} from '../../../lib/navigation'
import {NavigationSectionInput} from '../../../studio/navigationSectionInput'

/**
 * Dokumenttyper som har en egen side i Kulturkompasset, og som en intern
 * lenke derfor kan peke på. Alle har et `slug`-felt.
 */
const INTERNAL_TARGET_TYPES = [
  'article',
  'event',
  'bulletin',
  'playlist',
  'venue',
  'contributor',
  'category',
] as const

/**
 * Teksten som vises som ingress når redaktøren ikke skriver sin egen.
 * Eksporteres slik at forhåndsvisningen og frontend bruker nøyaktig samme
 * standardtekst.
 */
export const DEFAULT_LINK_SUMMARY = 'Les mer her'

/** Leser `linkType` fra objektet feltet ligger i. */
function linkTypeOf(parent: unknown): string | undefined {
  return (parent as {linkType?: string} | undefined)?.linkType
}

export const linkBlock = defineType({
  name: 'linkBlock',
  title: 'Lenke til side',
  type: 'object',
  description:
    'Et lenkekort som peker videre til en annen side, enten i Kulturkompasset eller på et eksternt nettsted.',
  fields: [
    defineField({
      name: 'linkType',
      title: 'Type lenke',
      type: 'string',
      description:
        'Velg om lenken peker til en enkeltside i Kulturkompasset, til en av seksjonene i ' +
        'menyen, eller til et annet nettsted.',
      options: {
        list: [
          {title: 'Intern side i Kulturkompasset', value: 'internal'},
          {title: 'Seksjon fra menyen', value: 'section'},
          {title: 'Ekstern nettside', value: 'external'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internalTarget',
      title: 'Intern side',
      type: 'reference',
      description: 'Siden lenken skal peke til.',
      to: INTERNAL_TARGET_TYPES.map((type) => ({type})),
      hidden: ({parent}) => linkTypeOf(parent) !== 'internal',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (linkTypeOf(context.parent) !== 'internal') return true
          return value ? true : 'Velg hvilken side lenken skal peke til.'
        }),
    }),
    defineField({
      name: 'section',
      title: 'Seksjon',
      type: 'string',
      description:
        'Hentes fra menypunktene i Sideinnstillinger › Navigasjon, slik at lista alltid viser ' +
        'de seksjonene menyen faktisk har.',
      components: {input: NavigationSectionInput},
      hidden: ({parent}) => linkTypeOf(parent) !== 'section',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (linkTypeOf(context.parent) !== 'section') return true
          return value ? true : 'Velg hvilken seksjon lenken skal peke til.'
        }),
    }),
    defineField({
      name: 'externalUrl',
      title: 'Ekstern lenke (URL)',
      type: 'url',
      description: 'Full adresse, for eksempel https://namdalsavisa.no.',
      hidden: ({parent}) => linkTypeOf(parent) !== 'external',
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}).custom((value, context) => {
          if (linkTypeOf(context.parent) !== 'external') return true
          return value ? true : 'Legg inn adressen lenken skal peke til.'
        }),
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description:
        'Overskriften på lenkekortet. Feltet kan stå tomt på interne lenker og seksjoner — da ' +
        'brukes tittelen på siden, eller teksten menypunktet har.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (linkTypeOf(context.parent) !== 'external') return true
          return value ? true : 'Eksterne lenker må ha en egen tittel.'
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      description: `La feltet stå tomt for å bruke standardteksten «${DEFAULT_LINK_SUMMARY}».`,
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      description:
        'Valgfritt bilde på kortet. Last opp et nytt, eller velg et fra bildebiblioteket.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      summary: 'summary',
      linkType: 'linkType',
      externalUrl: 'externalUrl',
      section: 'section',
      // `venue`, `contributor` og `bulletin` kaller tittelfeltet sitt `name`,
      // resten bruker `title`. Vi henter begge og tar den som finnes.
      targetTitle: 'internalTarget.title',
      targetName: 'internalTarget.name',
      media: 'image',
    },
    prepare({title, summary, linkType, externalUrl, section, targetTitle, targetName, media}) {
      // Forhåndsvisningen kan ikke slå opp menyteksten, så seksjoner vises med
      // sitt kanoniske navn her. Selve kortet bruker menyteksten.
      const sectionTitle = section ? NAVIGATION_SECTION_TITLES[section] || section : undefined
      const resolvedTarget = linkType === 'section' ? sectionTitle : targetTitle || targetName

      const kind =
        {
          external: 'Ekstern lenke',
          section: 'Seksjon',
        }[linkType as 'external' | 'section'] || 'Intern lenke'

      const target = linkType === 'external' ? externalUrl : resolvedTarget
      const heading = title || resolvedTarget || 'Lenke uten tittel'

      return {
        title: heading,
        subtitle: [kind, target, summary || DEFAULT_LINK_SUMMARY].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
