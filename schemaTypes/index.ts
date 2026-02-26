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
import {dividerBlock} from './objects/pageBuilder/dividerBlock'
import {embedBlock} from './objects/pageBuilder/embedBlock'
import {heroBlock} from './objects/pageBuilder/heroBlock'
import {imageBlock} from './objects/pageBuilder/imageBlock'
import {imageGalleryBlock} from './objects/pageBuilder/imageGalleryBlock'
import {imageTextLeftBlock} from './objects/pageBuilder/imageTextLeftBlock'
import {imageTextRightBlock} from './objects/pageBuilder/imageTextRightBlock'
import {leadBlock} from './objects/pageBuilder/leadBlock'
import {textBlock} from './objects/pageBuilder/textBlock'
import {videoBlock} from './objects/pageBuilder/videoBlock'
import {seo} from './objects/seo'

export const schemaTypes = [
  cta,
  seo,
  heroBlock,
  leadBlock,
  imageBlock,
  imageGalleryBlock,
  imageTextLeftBlock,
  imageTextRightBlock,
  videoBlock,
  embedBlock,
  blockquoteBlock,
  dividerBlock,
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
