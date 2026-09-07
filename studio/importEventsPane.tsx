import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useClient} from 'sanity'

import {SOURCE_OPTIONS} from '../schemaTypes/documents/eventImport'

type JobDoc = {
  _id: string
  status?: 'pending' | 'running' | 'done' | 'failed'
  source?: string
  message?: string
  found?: number
  created?: number
  flagged?: number
  skipped?: number
  log?: string[]
  requestedAt?: string
}

const SOURCE_HOMEPAGES: Record<string, string> = {
  namsos: 'https://www.namsos.kulturhus.no/kulturprogram/',
  grong: 'https://kulturhusetkuben.no/kulturprogram/',
  naroysund: 'https://kulturinaroy.ticketco.events/no/nb',
}

/**
 * Hvor lenge vi venter på at importfunksjonen skal plukke opp jobben før vi
 * sier fra. En deployet funksjon starter innen et par sekunder.
 */
const STALLED_AFTER_MS = 25000

const STATUS_LABEL: Record<string, string> = {
  pending: 'Venter på importfunksjonen…',
  running: 'Henter program…',
  done: 'Fullført',
  failed: 'Feilet',
}

/**
 * Panel der redaktøren importerer kulturprogram fra én kommune om gangen.
 *
 * Selve hentingen skjer ikke her. Panelet oppretter et `eventImport`-dokument,
 * og Sanity-funksjonen `import-events` gjør jobben. Det er nødvendig fordi
 * Namsos og Grong ikke sender CORS-headere — et fetch herfra ville blitt
 * blokkert av nettleseren. Panelet poller jobbdokumentet til det er ferdig.
 */
export function ImportEventsPane() {
  const client = useClient({apiVersion: '2025-01-01'})
  const [jobId, setJobId] = useState<string | null>(null)
  const [job, setJob] = useState<JobDoc | null>(null)
  const [busySource, setBusySource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<JobDoc[]>([])
  const [stalled, setStalled] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadRecent = useCallback(async () => {
    const docs = await client.fetch<JobDoc[]>(
      `*[_type == "eventImport"] | order(requestedAt desc) [0...5]{
        _id, source, status, message, found, created, flagged, skipped, requestedAt
      }`,
    )
    setRecent(docs)
  }, [client])

  useEffect(() => {
    void loadRecent()
  }, [loadRecent])

  // Poller den aktive jobben til funksjonen har skrevet et sluttresultat.
  useEffect(() => {
    if (!jobId) return undefined

    const startedPolling = Date.now()

    const poll = async () => {
      const doc = await client.fetch<JobDoc | null>(`*[_id == $id][0]`, {id: jobId})
      if (!doc) return

      setJob(doc)

      // Blir jobben stående på `pending` er det ingen som har plukket den opp,
      // og da er nesten alltid ikke importfunksjonen deployet. Uten dette
      // varselet ville panelet bare stått og ventet i det uendelige.
      if (doc.status === 'pending' && Date.now() - startedPolling > STALLED_AFTER_MS) {
        setStalled(true)
      }

      if (doc.status === 'done' || doc.status === 'failed') {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        setBusySource(null)
        void loadRecent()
      }
    }

    void poll()
    timerRef.current = setInterval(() => void poll(), 2000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [client, jobId, loadRecent])

  const startImport = useCallback(
    async (source: string) => {
      setError(null)
      setJob(null)
      setStalled(false)
      setBusySource(source)

      try {
        // Jobben må opprettes som publisert dokument, ikke kladd:
        // funksjonen lytter på `create` uten `includeDrafts`.
        const created = await client.create({
          _type: 'eventImport',
          source,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        })
        setJobId(created._id)
      } catch (err) {
        setBusySource(null)
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [client],
  )

  const isRunning = busySource !== null

  return (
    <div style={{padding: '1.2rem', maxWidth: '780px', margin: '0 auto'}}>
      <h1 style={{margin: '0 0 0.4rem', fontSize: '1.4rem'}}>Importer arrangement</h1>
      <p style={{margin: '0 0 1.2rem', color: '#4b5563', lineHeight: 1.6}}>
        Henter kulturprogrammet fra én kommune om gangen. Alt som importeres blir liggende som{' '}
        <strong>kladd</strong> under «Importerte arrangement» — ingenting publiseres automatisk.
        Arrangement som allerede finnes hoppes over, og de som ligner på noe eksisterende blir
        importert med et varsel.
      </p>

      <div style={{display: 'grid', gap: '0.6rem', marginBottom: '1.4rem'}}>
        {SOURCE_OPTIONS.map((option) => (
          <div
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.85rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              background: '#f9fafb',
            }}
          >
            <div>
              <div style={{fontWeight: 600}}>{option.title}</div>
              <a
                href={SOURCE_HOMEPAGES[option.value]}
                target="_blank"
                rel="noreferrer"
                style={{fontSize: '12px', color: '#0b57d0'}}
              >
                {SOURCE_HOMEPAGES[option.value]}
              </a>
            </div>
            <button
              type="button"
              onClick={() => void startImport(option.value)}
              disabled={isRunning}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 0,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                background: isRunning ? '#9ca3af' : '#1f2937',
                color: '#fff',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {busySource === option.value ? 'Importerer…' : 'Importer'}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: '#fee2e2',
            color: '#b91c1c',
            marginBottom: '1rem',
          }}
        >
          Klarte ikke å starte importen: {error}
        </div>
      )}

      {job && (
        <div
          style={{
            padding: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            marginBottom: '1.4rem',
          }}
        >
          <div style={{fontWeight: 600, marginBottom: '0.35rem'}}>
            {STATUS_LABEL[job.status || 'pending'] || job.status}
          </div>

          {job.status === 'pending' || job.status === 'running' ? (
            stalled && job.status === 'pending' ? (
              <div style={{color: '#92400e'}}>
                <p style={{margin: '0 0 0.5rem'}}>
                  Jobben er opprettet, men ingen har plukket den opp. Det betyr som regel at
                  importfunksjonen ikke er deployet ennå.
                </p>
                <p style={{margin: 0, fontSize: '13px'}}>
                  En utvikler må kjøre <code>npx sanity blueprints deploy</code>. Se{' '}
                  <code>docs/import-av-arrangement.md</code>. Trykk Importer på nytt når det er
                  gjort — denne jobben starter ikke av seg selv.
                </p>
              </div>
            ) : (
              <p style={{margin: 0, color: '#4b5563'}}>
                Dette tar normalt noen sekunder. Du kan la panelet stå åpent.
              </p>
            )
          ) : (
            <>
              <p
                style={{
                  margin: '0 0 0.6rem',
                  color: job.status === 'failed' ? '#b91c1c' : '#111827',
                }}
              >
                {job.message}
              </p>
              {Array.isArray(job.log) && job.log.length > 0 && (
                <details>
                  <summary style={{cursor: 'pointer', color: '#0b57d0'}}>
                    Vis detaljert logg ({job.log.length} linjer)
                  </summary>
                  <ul style={{margin: '0.5rem 0 0 1.1rem', padding: 0, lineHeight: 1.6}}>
                    {job.log.map((line, index) => (
                      <li key={index} style={{fontSize: '13px', color: '#374151'}}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h2 style={{fontSize: '1rem', margin: '0 0 0.5rem'}}>Siste importer</h2>
          <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
            {recent.map((entry) => (
              <li
                key={entry._id}
                style={{
                  padding: '0.5rem 0',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: '#374151',
                }}
              >
                <strong>
                  {SOURCE_OPTIONS.find((o) => o.value === entry.source)?.title || entry.source}
                </strong>{' '}
                — {entry.requestedAt ? new Date(entry.requestedAt).toLocaleString('nb-NO') : ''}
                <br />
                {entry.message || STATUS_LABEL[entry.status || ''] || entry.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
