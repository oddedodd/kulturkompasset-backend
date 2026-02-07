import React, {useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

type Item = {
  _id: string
  title?: string
  _updatedAt: string
  contentType?: string
  status?: string
}

type DashboardData = {
  totalEvents: number
  totalArticles: number
  totalPlaylists: number
  totalCategories: number
  totalContributors: number
  totalVenues: number
  totalPartners: number
  uncategorizedEvents: number
  uncategorizedArticles: number
  settingsExists: boolean
  latestEvents: Item[]
  latestArticles: Item[]
  latestPlaylists: Item[]
}

const query = `{
  "totalEvents": count(*[_type == "event" && !(_id in path("drafts.**"))]),
  "totalArticles": count(*[_type == "article" && !(_id in path("drafts.**"))]),
  "totalPlaylists": count(*[_type == "playlist" && !(_id in path("drafts.**"))]),
  "totalCategories": count(*[_type == "category" && !(_id in path("drafts.**"))]),
  "totalContributors": count(*[_type == "contributor" && !(_id in path("drafts.**"))]),
  "totalVenues": count(*[_type == "venue" && !(_id in path("drafts.**"))]),
  "totalPartners": count(*[_type == "partner" && !(_id in path("drafts.**"))]),
  "uncategorizedEvents": count(*[_type == "event" && !(_id in path("drafts.**")) && count(categories) == 0]),
  "uncategorizedArticles": count(*[_type == "article" && !(_id in path("drafts.**")) && count(categories) == 0]),
  "settingsExists": defined(*[_type == "siteSettings" && (_id == "site-settings" || _id == "drafts.site-settings")][0]._id),
  "latestEvents": *[_type == "event" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0..4]{_id, title, _updatedAt, status},
  "latestArticles": *[_type == "article" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0..4]{_id, title, _updatedAt, contentType},
  "latestPlaylists": *[_type == "playlist" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0..4]{_id, title, _updatedAt}
}`

const pageStyle: React.CSSProperties = {
  padding: '1.25rem',
  maxWidth: '1080px',
  margin: '0 auto',
}

const cardsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '0.75rem',
  marginBottom: '1rem',
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '0.75rem',
  background: '#fff',
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '0.9rem',
  background: '#fff',
  marginBottom: '0.9rem',
}

const listStyle: React.CSSProperties = {
  margin: '0.4rem 0 0 1.1rem',
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('nb-NO')
}

function StatusLine({label, ok}: {label: string; ok: boolean}) {
  return <div>{ok ? '✅' : '⚠️'} {label}</div>
}

function ItemList({title, items, subtitleKey}: {title: string; items: Item[]; subtitleKey?: 'status' | 'contentType'}) {
  return (
    <div style={sectionStyle}>
      <h3 style={{margin: '0 0 0.35rem'}}>{title}</h3>
      {!items.length && <p style={{margin: 0}}>Ingen innhold ennå.</p>}
      {!!items.length && (
        <ul style={listStyle}>
          {items.map((item) => (
            <li key={item._id} style={{marginBottom: '0.35rem'}}>
              <strong>{item.title || 'Uten tittel'}</strong>
              <div style={{fontSize: '12px', color: '#4b5563'}}>
                Oppdatert: {formatDate(item._updatedAt)}
                {subtitleKey && item[subtitleKey] ? ` • ${item[subtitleKey]}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DashboardPane() {
  const client = useClient({apiVersion: '2025-01-01'})
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const result = await client.fetch<DashboardData>(query)
        if (!mounted) return
        setData(result)
        setError(null)
      } catch {
        if (!mounted) return
        setError('Kunne ikke hente dashboard-data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    const timer = setInterval(() => void load(), 30000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [client])

  const health = useMemo(() => {
    if (!data) return []
    return [
      {label: 'Sideinnstillinger er opprettet', ok: data.settingsExists},
      {label: 'Alle arrangement har minst én kategori', ok: data.uncategorizedEvents === 0},
      {label: 'Alle artikler har minst én kategori', ok: data.uncategorizedArticles === 0},
    ]
  }, [data])

  return (
    <div style={pageStyle}>
      <h2 style={{marginTop: 0}}>📊 Innholdsdashboard</h2>
      <p style={{marginTop: 0}}>Oversikt over status i Sanity. Oppdateres automatisk hvert 30. sekund.</p>

      {loading && <p>Laster dashboard...</p>}
      {error && <p style={{color: '#b91c1c'}}>{error}</p>}

      {data && (
        <>
          <div style={cardsStyle}>
            <div style={cardStyle}><strong>Arrangement</strong><div>{data.totalEvents}</div></div>
            <div style={cardStyle}><strong>Artikler</strong><div>{data.totalArticles}</div></div>
            <div style={cardStyle}><strong>Spillelister</strong><div>{data.totalPlaylists}</div></div>
            <div style={cardStyle}><strong>Kategorier</strong><div>{data.totalCategories}</div></div>
            <div style={cardStyle}><strong>Bidragsytere</strong><div>{data.totalContributors}</div></div>
            <div style={cardStyle}><strong>Steder</strong><div>{data.totalVenues}</div></div>
            <div style={cardStyle}><strong>Partnere</strong><div>{data.totalPartners}</div></div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{margin: '0 0 0.35rem'}}>🔎 Innholdskvalitet</h3>
            <div style={{display: 'grid', gap: '0.25rem'}}>
              {health.map((item) => (
                <StatusLine key={item.label} label={item.label} ok={item.ok} />
              ))}
            </div>
          </div>

          <ItemList title="🗓️ Siste oppdaterte arrangement" items={data.latestEvents} subtitleKey="status" />
          <ItemList title="📰 Siste oppdaterte artikler" items={data.latestArticles} subtitleKey="contentType" />
          <ItemList title="🎵 Siste oppdaterte spillelister" items={data.latestPlaylists} />
        </>
      )}
    </div>
  )
}
