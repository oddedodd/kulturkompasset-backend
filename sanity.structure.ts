import type {StructureResolver} from 'sanity/structure'
import {DashboardPane} from './studio/dashboardPane'
import {ArticlePagePreviewPane} from './studio/articlePagePreviewPane'
import {FullGuidePane, QuickGuidePane} from './studio/guidePanes'

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
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id ? !singletonTypes.has(id) && id !== 'article' : true
      }),
    ])
