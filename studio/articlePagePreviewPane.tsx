import React, {useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

type Cta = {
  label?: string
  link?: string
}

type PortableChild = {
  _type?: string
  text?: string
  marks?: string[]
}

type PortableMarkDef = {
  _key: string
  _type: string
  href?: string
}

type PortableBlock = {
  _type?: string
  _key?: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  children?: PortableChild[]
  markDefs?: PortableMarkDef[]
}

type ImageWithAsset = {
  alt?: string
  caption?: string
  asset?: {
    url?: string
  }
}

type Block = {
  _key?: string
  _type: string
  heading?: string
  subheading?: string
  title?: string
  quote?: string
  attribution?: string
  textColor?: 'light' | 'dark' | 'brand' | string
  lead?: string
  caption?: string
  url?: string
  content?: PortableBlock[]
  cta?: Cta
  image?: ImageWithAsset
  backgroundImage?: ImageWithAsset
  images?: ImageWithAsset[]
  linkedEvent?: {_ref?: string}
  linkedArticle?: {_ref?: string}
}

type ArticleDoc = {
  title?: string
  subtitle?: string
  excerpt?: string
  heroImage?: ImageWithAsset
  pageBuilder?: Block[]
}

function renderInlineChildren(block: PortableBlock) {
  const markDefsByKey = new Map((block.markDefs || []).map((def) => [def._key, def]))

  return (block.children || []).map((child, idx) => {
    if (child?._type !== 'span') return null
    const text = child.text || ''
    const marks = child.marks || []

    let node: React.ReactNode = text

    for (const mark of marks) {
      if (mark === 'strong') node = <strong key={`${block._key || 'b'}-s-${idx}`}>{node}</strong>
      else if (mark === 'em') node = <em key={`${block._key || 'b'}-e-${idx}`}>{node}</em>
      else if (mark === 'underline') node = <span style={{textDecoration: 'underline'}} key={`${block._key || 'b'}-u-${idx}`}>{node}</span>
      else if (mark === 'code') node = <code key={`${block._key || 'b'}-c-${idx}`} style={{background: '#f3f4f6', padding: '0.05rem 0.25rem', borderRadius: '4px'}}>{node}</code>
      else {
        const def = markDefsByKey.get(mark)
        if (def?._type === 'link' && def.href) {
          node = (
            <a key={`${block._key || 'b'}-l-${idx}`} href={def.href} target="_blank" rel="noreferrer" style={{color: '#0b57d0'}}>
              {node}
            </a>
          )
        }
      }
    }

    return <React.Fragment key={`${block._key || 'b'}-${idx}`}>{node}</React.Fragment>
  })
}

function renderPortableBlocks(blocks?: PortableBlock[]) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  const nodes: React.ReactNode[] = []
  let listBuffer: PortableBlock[] = []
  let currentListType: 'bullet' | 'number' | null = null

  const flushList = () => {
    if (!listBuffer.length || !currentListType) return

    const ListTag = currentListType === 'number' ? 'ol' : 'ul'
    nodes.push(
      <ListTag key={`list-${nodes.length}`} style={{margin: '0.45rem 0 1rem 1.3rem'}}>
        {listBuffer.map((item, i) => (
          <li key={item._key || `li-${i}`} style={{marginBottom: '0.2rem'}}>
            {renderInlineChildren(item)}
          </li>
        ))}
      </ListTag>,
    )

    listBuffer = []
    currentListType = null
  }

  blocks.forEach((block, index) => {
    if (block?._type !== 'block') return

    if (block.listItem) {
      if (!currentListType || currentListType === block.listItem) {
        currentListType = block.listItem
        listBuffer.push(block)
      } else {
        flushList()
        currentListType = block.listItem
        listBuffer.push(block)
      }
      return
    }

    flushList()

    const key = block._key || `pt-${index}`
    const children = renderInlineChildren(block)

    switch (block.style) {
      case 'h1':
        nodes.push(<h1 key={key} style={{margin: '0.9rem 0 0.55rem'}}>{children}</h1>)
        break
      case 'h2':
        nodes.push(<h2 key={key} style={{margin: '0.8rem 0 0.5rem'}}>{children}</h2>)
        break
      case 'h3':
        nodes.push(<h3 key={key} style={{margin: '0.7rem 0 0.45rem'}}>{children}</h3>)
        break
      case 'h4':
        nodes.push(<h4 key={key} style={{margin: '0.65rem 0 0.4rem'}}>{children}</h4>)
        break
      case 'blockquote':
        nodes.push(
          <blockquote
            key={key}
            style={{margin: '0.6rem 0 1rem', padding: '0.45rem 0.75rem', borderLeft: '3px solid #9ca3af', color: '#374151'}}
          >
            {children}
          </blockquote>,
        )
        break
      default:
        nodes.push(
          <p key={key} style={{margin: '0 0 0.9rem', lineHeight: 1.7}}>
            {children}
          </p>,
        )
        break
    }
  })

  flushList()
  return nodes
}

function CtaButton({cta}: {cta?: Cta}) {
  if (!cta?.label || !cta?.link) return null

  return (
    <a
      href={cta.link}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-block',
        marginTop: '0.75rem',
        padding: '0.5rem 0.8rem',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#fff',
        background: '#1f2937',
        fontWeight: 600,
      }}
    >
      {cta.label}
    </a>
  )
}

function HeroBlock({block}: {block: Block}) {
  return (
    <section style={{marginBottom: '1.2rem'}}>
      <div
        style={{
          marginBottom: '1.85rem',
          paddingTop: '1.1rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{margin: '0 0 1rem', fontSize: '2.75rem', lineHeight: 1.05}}>
          {block.heading || 'Uten overskrift'}
        </h2>
        {block.subheading && (
          <p
            style={{
              margin: '0 auto',
              color: '#111827',
              fontSize: '1.95rem',
              lineHeight: 1.2,
              maxWidth: '42rem',
            }}
          >
            {block.subheading}
          </p>
        )}
        {block.cta && <div style={{marginTop: '1.2rem'}}><CtaButton cta={block.cta} /></div>}
      </div>
      {block.backgroundImage?.asset?.url && (
        <img
          src={block.backgroundImage.asset.url}
          alt={block.backgroundImage.alt || 'Hero'}
          style={{display: 'block', width: '100%', height: 'auto'}}
        />
      )}
    </section>
  )
}

function LeadBlock({block}: {block: Block}) {
  return (
    <section style={{marginBottom: '1.2rem'}}>
      <p style={{margin: 0, fontSize: '1.08rem', lineHeight: 1.65, fontWeight: 700}}>{block.lead}</p>
    </section>
  )
}

function ImageBlockView({block}: {block: Block}) {
  return (
    <section style={{marginBottom: '1.2rem'}}>
      {block.image?.asset?.url && (
        <img src={block.image.asset.url} alt={block.image.alt || 'Bilde'} style={{width: '100%'}} />
      )}
      {block.caption && <p style={{marginTop: '0.4rem', color: '#4b5563'}}>{block.caption}</p>}
    </section>
  )
}

function ImageGalleryBlockView({block}: {block: Block}) {
  const images = block.images || []

  return (
    <section style={{marginBottom: '1.2rem'}}>
      {block.title && <h3 style={{marginBottom: '0.7rem'}}>{block.title}</h3>}
      <div style={{display: 'grid', gap: '0.7rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'}}>
        {images.map((img, idx) => (
          <figure key={`${block._key || 'gallery'}-${idx}`} style={{margin: 0}}>
            {img.asset?.url && (
              <img src={img.asset.url} alt={img.alt || `Galleri ${idx + 1}`} style={{width: '100%'}} />
            )}
            {img.caption && <figcaption style={{fontSize: '12px', color: '#4b5563', marginTop: '0.25rem'}}>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}

function TextBlockView({block}: {block: Block}) {
  const content = renderPortableBlocks(block.content)
  if (!content) return null

  return <section style={{marginBottom: '1.2rem'}}>{content}</section>
}

function ImageTextView({block, right}: {block: Block; right?: boolean}) {
  const content = renderPortableBlocks(block.content)

  return (
    <section
      style={{
        marginBottom: '1.2rem',
        display: 'grid',
        gap: '0.9rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        alignItems: 'start',
      }}
    >
      {!right && block.image?.asset?.url && <img src={block.image.asset.url} alt={block.image.alt || 'Bilde'} style={{width: '100%'}} />}
      <div>{content}</div>
      {right && block.image?.asset?.url && <img src={block.image.asset.url} alt={block.image.alt || 'Bilde'} style={{width: '100%'}} />}
    </section>
  )
}

function VideoBlockView({block}: {block: Block}) {
  const getEmbedUrl = (url?: string) => {
    if (!url) return null

    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/^www\./, '')

      if (host === 'youtu.be') {
        const id = parsed.pathname.split('/').filter(Boolean)[0]
        return id
          ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
          : null
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname === '/watch') {
          const id = parsed.searchParams.get('v')
          return id
            ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
            : null
        }

        if (parsed.pathname.startsWith('/shorts/')) {
          const id = parsed.pathname.split('/').filter(Boolean)[1]
          return id
            ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
            : null
        }

        if (parsed.pathname.startsWith('/embed/')) {
          const id = parsed.pathname.split('/').filter(Boolean)[1]
          return id
            ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
            : null
        }
      }

      if (host === 'vimeo.com') {
        const id = parsed.pathname.split('/').filter(Boolean)[0]
        return id ? `https://player.vimeo.com/video/${id}` : null
      }

      if (host === 'player.vimeo.com') {
        return `${parsed.protocol}//${parsed.host}${parsed.pathname}`
      }

      return null
    } catch {
      return null
    }
  }

  const embedUrl = getEmbedUrl(block.url)

  return (
    <section style={{marginBottom: '1.2rem', padding: '0.9rem', border: '1px dashed #cbd5e1', borderRadius: '10px'}}>
      <strong>Video</strong>
      <div style={{marginTop: '0.35rem'}}>{block.title || 'Uten tittel'}</div>
      {embedUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            marginTop: '0.6rem',
          }}
        >
          <iframe
            src={embedUrl}
            title={block.title || 'Video'}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        </div>
      ) : (
        block.url && (
          <a href={block.url} target="_blank" rel="noreferrer" style={{color: '#0b57d0'}}>
            {block.url}
          </a>
        )
      )}
      {block.caption && <p style={{marginBottom: 0}}>{block.caption}</p>}
    </section>
  )
}

function EmbedBlockView({block}: {block: Block}) {
  return (
    <section style={{marginBottom: '1.2rem', padding: '0.9rem', border: '1px dashed #cbd5e1', borderRadius: '10px'}}>
      <strong>Innbygging</strong>
      <div style={{marginTop: '0.35rem'}}>{block.title || 'Uten tittel'}</div>
      {block.url && (
        <a href={block.url} target="_blank" rel="noreferrer" style={{color: '#0b57d0'}}>
          {block.url}
        </a>
      )}
      {block.caption && <p style={{marginBottom: 0}}>{block.caption}</p>}
    </section>
  )
}

function BlockquoteView({block}: {block: Block}) {
  const textColorMap: Record<string, string> = {
    light: '#ffffff',
    dark: '#111827',
    brand: '#1d4ed8',
  }
  const chosenColor = block.textColor ? textColorMap[block.textColor] || block.textColor : undefined
  const textColor = chosenColor || (block.backgroundImage?.asset?.url ? '#ffffff' : '#111827')

  if (block.backgroundImage?.asset?.url) {
    return (
      <section
        style={{
          position: 'relative',
          margin: '0 0 1.2rem',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={block.backgroundImage.asset.url}
          alt={block.backgroundImage.alt || 'Bakgrunnsbilde'}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              textColor === '#111827'
                ? 'rgba(255,255,255,0.58)'
                : 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <blockquote
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            margin: 0,
            padding: '2.1rem 1.5rem 1.4rem',
            color: textColor,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: '2.1rem',
              lineHeight: 1,
              fontWeight: 700,
              marginBottom: '0.55rem',
            }}
          >
            “
          </div>
          <p
            style={{
              marginTop: 0,
              marginBottom: '0.55rem',
              maxWidth: '22rem',
              fontStyle: 'italic',
              fontSize: '2rem',
              lineHeight: 1.2,
            }}
          >
            {block.quote}
          </p>
          {block.attribution && <cite style={{fontSize: '1rem', color: textColor}}>{block.attribution}</cite>}
        </blockquote>
      </section>
    )
  }

  return (
    <blockquote
      style={{
        margin: '0 0 1.2rem',
        padding: '0.9rem 1rem',
        borderLeft: '4px solid #9ca3af',
        background: '#f9fafb',
        color: textColor,
      }}
    >
      <p style={{marginTop: 0, marginBottom: '0.5rem', fontStyle: 'italic'}}>{block.quote}</p>
      {block.attribution && <cite style={{fontSize: '13px', color: textColor}}>{block.attribution}</cite>}
    </blockquote>
  )
}

function DividerBlockView() {
  return (
    <section style={{margin: '2rem 0'}}>
      <hr style={{border: 0, borderTop: '1px solid #d1d5db'}} />
    </section>
  )
}

function renderBlock(block: Block) {
  switch (block._type) {
    case 'heroBlock':
      return <HeroBlock block={block} />
    case 'leadBlock':
      return <LeadBlock block={block} />
    case 'imageBlock':
      return <ImageBlockView block={block} />
    case 'imageGalleryBlock':
      return <ImageGalleryBlockView block={block} />
    case 'textBlock':
      return <TextBlockView block={block} />
    case 'imageTextLeftBlock':
      return <ImageTextView block={block} />
    case 'imageTextRightBlock':
      return <ImageTextView block={block} right />
    case 'videoBlock':
      return <VideoBlockView block={block} />
    case 'embedBlock':
      return <EmbedBlockView block={block} />
    case 'blockquoteBlock':
      return <BlockquoteView block={block} />
    case 'dividerBlock':
      return <DividerBlockView />
    case 'cta':
      return (
        <section style={{marginBottom: '1.2rem'}}>
          <CtaButton cta={{label: (block as unknown as Cta).label, link: (block as unknown as Cta).link}} />
        </section>
      )
    default:
      return (
        <section style={{marginBottom: '1.2rem', color: '#6b7280'}}>
          Ukjent blokk: <code>{block._type}</code>
        </section>
      )
  }
}

export function ArticlePagePreviewPane(props: {documentId?: string}) {
  const client = useClient({apiVersion: '2025-01-01'})
  const [doc, setDoc] = useState<ArticleDoc | null>(null)
  const [loading, setLoading] = useState(true)

  const documentId = props?.documentId

  const ids = useMemo(() => {
    const publishedId = documentId?.replace(/^drafts\./, '') || ''
    return {
      publishedId,
      draftId: `drafts.${publishedId}`,
    }
  }, [documentId])

  useEffect(() => {
    if (!ids.publishedId) {
      setLoading(false)
      return
    }

    let mounted = true

    const fetchDoc = async () => {
      const query = `coalesce(
        *[_id == $draftId][0],
        *[_id == $publishedId][0]
      ){
        title,
        subtitle,
        excerpt,
        heroImage{alt, asset->{url}},
        pageBuilder[]{
          ...,
          image{alt, caption, asset->{url}},
          backgroundImage{alt, asset->{url}},
          images[]{alt, caption, asset->{url}}
        }
      }`

      const data = await client.fetch<ArticleDoc | null>(query, ids)
      if (!mounted) return
      setDoc(data)
      setLoading(false)
    }

    void fetchDoc()
    const timer = setInterval(() => void fetchDoc(), 2000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [client, ids])

  if (loading) return <div style={{padding: '1rem'}}>Laster forhåndsvisning...</div>
  if (!doc) return <div style={{padding: '1rem'}}>Fant ikke dokument.</div>

  return (
    <div style={{padding: '1.1rem', maxWidth: '860px', margin: '0 auto'}}>
      <article>
        <header style={{marginBottom: '1.1rem'}}>
          <h1 style={{margin: '0 0 0.45rem'}}>{doc.title || 'Uten tittel'}</h1>
          {doc.subtitle && <p style={{margin: '0 0 0.4rem', color: '#4b5563'}}>{doc.subtitle}</p>}
          {doc.excerpt && <p style={{margin: 0, fontWeight: 500}}>{doc.excerpt}</p>}
        </header>

        {Array.isArray(doc.pageBuilder) && doc.pageBuilder.length > 0 ? (
          doc.pageBuilder.map((block, index) => (
            <React.Fragment key={block._key || `${block._type}-${index}`}>
              {renderBlock(block)}
            </React.Fragment>
          ))
        ) : (
          <div style={{padding: '0.9rem', border: '1px dashed #d1d5db', borderRadius: '10px', color: '#6b7280'}}>
            Ingen blokker i Sidebygger ennå.
          </div>
        )}
      </article>
    </div>
  )
}
