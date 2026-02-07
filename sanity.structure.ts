import type {StructureResolver} from 'sanity/structure'
import {FullGuidePane, QuickGuidePane} from './studio/guidePanes'

const singletonTypes = new Set(['siteSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
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
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id ? !singletonTypes.has(id) : true
      }),
    ])
