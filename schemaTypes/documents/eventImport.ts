/**
 * Importjobb for kulturprogram.
 *
 * Dokumentet er kvitteringen på én import. Studioet oppretter det med status
 * `pending`, Sanity-funksjonen `import-events` plukker det opp og skriver
 * resultatet tilbake hit. Redaktøren trenger normalt ikke åpne det — panelet
 * «Importer arrangement» viser det samme — men det gir en etterprøvbar logg
 * over hva som ble hentet, opprettet og hoppet over.
 */
import {defineArrayMember, defineField, defineType} from 'sanity'

export const SOURCE_OPTIONS = [
  {title: 'Namsos kulturhus', value: 'namsos'},
  {title: 'Kulturhuset Kuben (Grong)', value: 'grong'},
  {title: 'Kultur i Nærøysund', value: 'naroysund'},
]

export const eventImport = defineType({
  name: 'eventImport',
  title: 'Import av arrangement',
  type: 'document',
  description: 'Logg over én kjørt import fra en kommunes kulturprogram.',
  fields: [
    defineField({
      name: 'source',
      title: 'Kilde',
      type: 'string',
      description: 'Hvilken kommunes program som ble hentet.',
      options: {list: SOURCE_OPTIONS},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Settes av importfunksjonen. `pending` starter jobben.',
      options: {
        list: [
          {title: 'Venter', value: 'pending'},
          {title: 'Kjører', value: 'running'},
          {title: 'Fullført', value: 'done'},
          {title: 'Feilet', value: 'failed'},
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requestedAt',
      title: 'Bestilt',
      type: 'datetime',
      description: 'Da redaktøren trykket på importknappen.',
      readOnly: true,
    }),
    defineField({
      name: 'startedAt',
      title: 'Startet',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'finishedAt',
      title: 'Ferdig',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'message',
      title: 'Oppsummering',
      type: 'text',
      rows: 3,
      description: 'Kort resultat av importen, eller feilmelding hvis den stoppet.',
      readOnly: true,
    }),
    defineField({
      name: 'found',
      title: 'Hentet',
      type: 'number',
      description: 'Antall arrangement funnet hos kilden.',
      readOnly: true,
    }),
    defineField({
      name: 'created',
      title: 'Nye kladder',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'flagged',
      title: 'Flagget som mulig duplikat',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'skipped',
      title: 'Hoppet over',
      type: 'number',
      description: 'Sikre duplikater som allerede fantes.',
      readOnly: true,
    }),
    defineField({
      name: 'log',
      title: 'Detaljert logg',
      type: 'array',
      description: 'Én linje per arrangement importen vurderte.',
      of: [defineArrayMember({type: 'string'})],
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      source: 'source',
      status: 'status',
      requestedAt: 'requestedAt',
      created: 'created',
      skipped: 'skipped',
    },
    prepare({source, status, requestedAt, created, skipped}) {
      const sourceLabel =
        SOURCE_OPTIONS.find((option) => option.value === source)?.title || source || 'Ukjent kilde'
      const statusLabel =
        {pending: 'Venter', running: 'Kjører', done: 'Fullført', failed: 'Feilet'}[
          status as 'pending' | 'running' | 'done' | 'failed'
        ] || status
      const date = requestedAt ? new Date(requestedAt).toLocaleString('nb-NO') : 'Uten dato'
      const counts =
        typeof created === 'number' ? ` • ${created} nye, ${skipped ?? 0} hoppet over` : ''

      return {
        title: `${sourceLabel} — ${statusLabel}`,
        subtitle: `${date}${counts}`,
      }
    },
  },
})
