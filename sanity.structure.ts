import type {StructureResolver} from 'sanity/structure'
import {DashboardPane} from './studio/dashboardPane'
import {ArticlePagePreviewPane} from './studio/articlePagePreviewPane'
import {FullGuidePane, QuickGuidePane} from './studio/guidePanes'
import {
  CANCELLED_EVENT_FILTER,
  nowParams,
  PAST_EVENT_FILTER,
  UPCOMING_EVENT_FILTER,
} from './lib/eventQueries'

const singletonTypes = new Set(['siteSettings'])

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
              id !== 'event'
          : true
      }),
    ])
