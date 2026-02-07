import React from 'react'
import fullGuide from '../docs/sanity-skjema-guide-no.md?raw'
import quickGuide from '../docs/sanity-hurtigguide-redaksjon-no.md?raw'

const paneStyle: React.CSSProperties = {
  padding: '1.25rem',
  maxWidth: '980px',
  margin: '0 auto',
}

const contentStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.6,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '1rem 1.1rem',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '1.35rem',
}

const h2Style: React.CSSProperties = {
  marginTop: '1.75rem',
  marginBottom: '0.5rem',
  fontSize: '1.25rem',
  borderBottom: '1px solid #eef2f7',
  paddingBottom: '0.25rem',
}

const h3Style: React.CSSProperties = {
  marginTop: '1.25rem',
  marginBottom: '0.5rem',
  fontSize: '1.05rem',
}

const paragraphStyle: React.CSSProperties = {
  margin: '0.5rem 0',
}

const listStyle: React.CSSProperties = {
  margin: '0.4rem 0 0.8rem 1.25rem',
}

const linkStyle: React.CSSProperties = {
  color: '#0b57d0',
  textDecoration: 'underline',
}

function decorateHeading(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('hurtigguide')) return `⚡ ${text}`
  if (t.includes('minimum')) return `🧩 ${text}`
  if (t.includes('sjekk')) return `✅ ${text}`
  if (t.includes('relasjon')) return `🔗 ${text}`
  if (t.includes('forside')) return `🏠 ${text}`
  if (t.includes('eksempel')) return `🎯 ${text}`
  if (t.includes('neste steg')) return `👉 ${text}`
  if (t.includes('vanlige feil')) return `⚠️ ${text}`
  return `📌 ${text}`
}

function renderTextWithMarks(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<React.Fragment key={`txt-${key++}`}>{text.slice(lastIndex, match.index)}</React.Fragment>)
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`lnk-${key++}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          {match[2]}
        </a>,
      )
    } else if (match[4]) {
      nodes.push(<strong key={`b-${key++}`}>{match[4]}</strong>)
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(<React.Fragment key={`txt-${key++}`}>{text.slice(lastIndex)}</React.Fragment>)
  }

  return nodes
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            background: '#f3f4f6',
            borderRadius: '4px',
            padding: '0.08rem 0.3rem',
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <React.Fragment key={index}>{renderTextWithMarks(part)}</React.Fragment>
  })
}

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let bulletItems: string[] = []
  let numberedItems: string[] = []
  let key = 0

  const flushLists = () => {
    if (bulletItems.length) {
      nodes.push(
        <ul key={`ul-${key++}`} style={listStyle}>
          {bulletItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      bulletItems = []
    }

    if (numberedItems.length) {
      nodes.push(
        <ol key={`ol-${key++}`} style={listStyle}>
          {numberedItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      numberedItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushLists()
      continue
    }

    if (trimmed === '---') {
      flushLists()
      nodes.push(<hr key={`hr-${key++}`} style={{border: 0, borderTop: '1px solid #e5e7eb', margin: '1rem 0'}} />)
      continue
    }

    if (trimmed.startsWith('# ')) {
      flushLists()
      nodes.push(
        <h2 key={`h1-${key++}`} style={{...h2Style, fontSize: '1.45rem', marginTop: '0.5rem'}}>
          {renderInline(decorateHeading(trimmed.slice(2)))}
        </h2>,
      )
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushLists()
      nodes.push(
        <h3 key={`h3-${key++}`} style={h3Style}>
          {renderInline(decorateHeading(trimmed.slice(4)))}
        </h3>,
      )
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushLists()
      nodes.push(
        <h2 key={`h2-${key++}`} style={h2Style}>
          {renderInline(decorateHeading(trimmed.slice(3)))}
        </h2>,
      )
      continue
    }

    const bulletMatch = trimmed.match(/^- (.+)$/)
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1])
      continue
    }

    const orderedMatch = trimmed.match(/^\d+\. (.+)$/)
    if (orderedMatch) {
      numberedItems.push(orderedMatch[1])
      continue
    }

    if (trimmed.startsWith('> ')) {
      flushLists()
      nodes.push(
        <blockquote
          key={`q-${key++}`}
          style={{
            margin: '0.7rem 0',
            padding: '0.45rem 0.75rem',
            borderLeft: '3px solid #93c5fd',
            background: '#f8fbff',
          }}
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      )
      continue
    }

    flushLists()
    nodes.push(
      <p key={`p-${key++}`} style={paragraphStyle}>
        {renderInline(trimmed)}
      </p>,
    )
  }

  flushLists()
  return nodes
}

function MarkdownPane({title, content}: {title: string; content: string}) {
  return (
    <div style={paneStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div style={contentStyle}>{renderMarkdown(content)}</div>
    </div>
  )
}

export function QuickGuidePane() {
  return <MarkdownPane title="⚡ Hurtigguide (fra Markdown-fil)" content={quickGuide} />
}

export function FullGuidePane() {
  return <MarkdownPane title="📘 Schema-guide (fra Markdown-fil)" content={fullGuide} />
}
