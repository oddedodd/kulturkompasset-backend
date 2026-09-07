import type {StructureResolver} from 'sanity/structure'
import {DashboardPane} from './studio/dashboardPane'
import {ArticlePagePreviewPane} from './studio/articlePagePreviewPane'
import {ImportEventsPane} from './studio/importEventsPane'
import {FullGuidePane, QuickGuidePane} from './studio/guidePanes'
import {
  CANCELLED_EVENT_FILTER,
  nowParams,
  PAST_EVENT_FILTER,
  UPCOMING_EVENT_FILTER,
} from './lib/eventQueries'

const singletonTypes = new Set(['siteSettings'])

/**
 * Importerte arrangement som ennå ikke er publisert, slik at et arrangement
 * forsvinner herfra så snart redaktøren har publisert det.
 *
 * Merk `_originalId`, ikke `_id`: dokumentlistene i studioet kjører i
 * `drafts`-perspektivet, der `_id` er normalisert til den publiserte ID-en.
 * `_id in path("drafts.**")` gir derfor null treff her, mens det ser riktig ut
 * i Vision (som bruker `raw`). `_originalId` beholder den faktiske ID-en.
 */
const IMPORTED_DRAFT_FILTER =
  '_type == "event" && defined(importSource) && _originalId in path("drafts.**")'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      S.listItem().id('dashboard').title('Dashboard').child(S.component().title('Dashboard').component(DashboardPane)),
      S.listItem()
        .title('Guider (Markdown)')
        .child(
          S.list()
            .title('Guider')
            .items([
              S.listItem()
                .title('Hurtigguide redaksjon')
                .child(S.component().title('Hurtigguide').component(QuickGuidePane)),
              S.listItem()
                .title('Schema-guide')
                .child(S.component().title('Schema-guide').component(FullGuidePane)),
            ]),
        ),
      S.listItem()
        .title('Sideinnstillinger')
        .child(S.editor().id('site-settings').schemaType('siteSettings').documentId('site-settings')),
      S.divider(),
      S.listItem()
        .title('Artikkel')
        .schemaType('article')
        .child(
          S.documentTypeList('article').title('Artikkel').child((documentId) =>
            S.document()
              .documentId(documentId)
              .schemaType('article')
              .views([
                S.view.form().title('Innhold'),
                S.view.component(ArticlePagePreviewPane).title('Forhåndsvisning'),
              ]),
          ),
        ),
      S.listItem()
        .title('Bulletin-innsendinger')
        .schemaType('bulletinSubmission')
        .child(
          S.documentList()
            .title('Bulletin-innsendinger')
            .schemaType('bulletinSubmission')
            .filter('_type == "bulletinSubmission"')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Arrangement')
        .schemaType('event')
        .child(
          S.list()
            .title('Arrangement')
            .items([
              S.listItem()
                .id('events-upcoming')
                .title('Kommende')
                .child(() =>
                  S.documentList()
                    .id('events-upcoming-list')
                    .title('Kommende arrangement')
                    .schemaType('event')
                    .filter(UPCOMING_EVENT_FILTER)
                    .params(nowParams())
                    .defaultOrdering([{field: 'startsAt', direction: 'asc'}])
                    .initialValueTemplates([S.initialValueTemplateItem('event')]),
                ),
              S.listItem()
                .id('events-past')
                .title('Gjennomførte')
                .child(() =>
                  S.documentList()
                    .id('events-past-list')
                    .title('Gjennomførte arrangement')
                    .schemaType('event')
                    .filter(PAST_EVENT_FILTER)
                    .params(nowParams())
                    .defaultOrdering([{field: 'startsAt', direction: 'desc'}]),
                ),
              S.listItem()
                .id('events-cancelled')
                .title('Avlyste')
                .child(
                  S.documentList()
                    .id('events-cancelled-list')
                    .title('Avlyste arrangement')
                    .schemaType('event')
                    .filter(CANCELLED_EVENT_FILTER)
                    .defaultOrdering([{field: 'startsAt', direction: 'desc'}]),
                ),
              S.divider(),
              S.listItem()
                .id('events-missing-date')
                .title('Mangler dato')
                .child(
                  S.documentList()
                    .id('events-missing-date-list')
                    .title('Arrangement uten dato')
                    .schemaType('event')
                    .filter('_type == "event" && !defined(startsAt)'),
                ),
              S.listItem()
                .id('events-all')
                .title('Alle arrangement')
                .child(
                  S.documentList()
                    .id('events-all-list')
                    .title('Alle arrangement')
                    .schemaType('event')
                    .filter('_type == "event"')
                    .defaultOrdering([{field: 'startsAt', direction: 'desc'}]),
                ),
            ]),
        ),
      S.listItem()
        .id('imported-events')
        .title('Importerte arrangement')
        .child(
          S.list()
            .title('Importerte arrangement')
            .items([
              S.listItem()
                .id('import-run')
                .title('Importer fra kommunene')
                .child(S.component().title('Importer arrangement').component(ImportEventsPane)),
              S.divider(),
              S.listItem()
                .id('imported-review')
                .title('Til gjennomgang')
                .child(
                  S.documentList()
                    .id('imported-review-list')
                    .title('Importerte kladder')
                    .schemaType('event')
                    .filter(IMPORTED_DRAFT_FILTER)
                    .defaultOrdering([{field: 'startsAt', direction: 'asc'}]),
                ),
              S.listItem()
                .id('imported-flagged')
                .title('Mulige duplikater')
                .child(
                  S.documentList()
                    .id('imported-flagged-list')
                    .title('Flagget som mulig duplikat')
                    .schemaType('event')
                    .filter(`${IMPORTED_DRAFT_FILTER} && defined(importWarning)`)
                    .defaultOrdering([{field: 'startsAt', direction: 'asc'}]),
                ),
              S.listItem()
                .id('imported-all')
                .title('Alle importerte')
                .child(
                  S.documentList()
                    .id('imported-all-list')
                    .title('Alle importerte arrangement')
                    .schemaType('event')
                    .filter('_type == "event" && defined(importSource)')
                    .defaultOrdering([{field: 'startsAt', direction: 'asc'}]),
                ),
              S.divider(),
              S.listItem()
                .id('import-log')
                .title('Importlogg')
                .child(
                  S.documentList()
                    .id('import-log-list')
                    .title('Kjørte importer')
                    .schemaType('eventImport')
                    .filter('_type == "eventImport"')
                    .defaultOrdering([{field: 'requestedAt', direction: 'desc'}]),
                ),
            ]),
        ),
      S.listItem()
        .title('Bulletin')
        .schemaType('bulletin')
        .child(
          S.documentList()
            .title('Bulletin')
            .schemaType('bulletin')
            .filter('_type == "bulletin"')
            .defaultOrdering([{field: 'date', direction: 'desc'}]),
        ),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id
          ? !singletonTypes.has(id) &&
              id !== 'article' &&
              id !== 'bulletinSubmission' &&
              id !== 'bulletin' &&
              id !== 'event' &&
              id !== 'eventImport'
          : true
      }),
    ])
