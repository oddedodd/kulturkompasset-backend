import {defineArrayMember} from 'sanity'

/**
 * Delt oppsett for Portable Text-feltene i sidebyggeren.
 *
 * Alle tekstfelt redaktøren skriver løpende tekst i (`textBlock`,
 * `imageTextLeftBlock`, `imageTextRightBlock`) bruker denne lista, slik at
 * verktøylinja og innsettingsmenyen ser lik ut uansett hvor man skriver.
 *
 * Merk: så snart `marks.annotations` settes, erstatter den Sanity sine
 * standardannotasjoner. Den vanlige URL-lenka må derfor defineres eksplisitt
 * her, ellers forsvinner den fra verktøylinja. Dekoratørene (fet, kursiv osv.)
 * er ikke overstyrt og beholder standardoppsettet.
 */
export const richTextMembers = [
  defineArrayMember({
    type: 'block',
    marks: {
      annotations: [
        defineArrayMember({
          name: 'link',
          title: 'Lenke (URL)',
          type: 'object',
          options: {modal: {type: 'popover'}},
          fields: [
            {
              name: 'href',
              title: 'URL',
              type: 'url',
              description: 'Nettadresse, e-post (mailto:), telefon (tel:) eller intern sti.',
              validation: (Rule) =>
                Rule.uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}),
            },
          ],
        }),
        defineArrayMember({type: 'eventLink'}),
      ],
    },
  }),
  defineArrayMember({type: 'eventCard'}),
]
