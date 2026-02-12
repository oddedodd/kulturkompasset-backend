import {article} from './documents/article'
import {category} from './documents/category'
import {contributor} from './documents/contributor'
import {event} from './documents/event'
import {partner} from './documents/partner'
import {playlist} from './documents/playlist'
import {siteSettings} from './documents/siteSettings'
import {venue} from './documents/venue'
import {cta} from './objects/cta'
import {blockquoteBlock} from './objects/pageBuilder/blockquoteBlock'
import {heroBlock} from './objects/pageBuilder/heroBlock'
import {imageBlock} from './objects/pageBuilder/imageBlock'
import {textBlock} from './objects/pageBuilder/textBlock'
import {videoBlock} from './objects/pageBuilder/videoBlock'
import {seo} from './objects/seo'

export const schemaTypes = [
  cta,
  seo,
  heroBlock,
  imageBlock,
  videoBlock,
  blockquoteBlock,
  textBlock,
  category,
  contributor,
  venue,
  partner,
  event,
  article,
  playlist,
  siteSettings,
]
