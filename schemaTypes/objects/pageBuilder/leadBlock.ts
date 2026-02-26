import {defineField, defineType} from 'sanity'

export const leadBlock = defineType({
  name: 'leadBlock',
  title: 'Ingress',
  type: 'object',
  description: 'Lead-tekst som introseksjon i artikkelen.',
  fields: [
    defineField({
      name: 'lead',
      title: 'Ingress',
      type: 'text',
      rows: 4,
      description: 'Kort introduksjon som skal vises tidlig på siden.',
      validation: (Rule) => Rule.required().min(20).warning('Anbefalt minst 20 tegn.'),
    }),
  ],
  preview: {
    select: {
      lead: 'lead',
    },
    prepare({lead}) {
      return {
        title: lead || 'Ingress',
        subtitle: 'Lead',
      }
    },
  },
})
