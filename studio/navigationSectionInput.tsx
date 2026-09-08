import {Select, Stack, Text} from '@sanity/ui'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {set, unset, useClient, type StringInputProps} from 'sanity'

import {NAVIGATION_QUERY, NAVIGATION_SECTION_TITLES, type NavigationItem} from '../lib/navigation'

type Option = {value: string; label: string}

/**
 * Nedtrekk over menypunktene i Sideinnstillinger › Navigasjon.
 *
 * Sanity støtter ikke oppslag mot et annet dokument i `options.list`, så
 * verdiene hentes her i stedet. Da tilbys bare seksjoner som faktisk ligger i
 * menyen, og redaktøren ser sin egen menytekst framfor det tekniske navnet.
 */
export function NavigationSectionInput(props: StringInputProps) {
  const {value, onChange, elementProps, readOnly} = props
  const client = useClient({apiVersion: '2025-01-01'})
  const [items, setItems] = useState<NavigationItem[] | null>(null)

  useEffect(() => {
    let mounted = true

    // `drafts` gjør at menypunkter redaktøren nettopp la til, men ikke har
    // publisert ennå, også dukker opp i lista.
    client
      .withConfig({perspective: 'drafts'})
      .fetch<NavigationItem[] | null>(NAVIGATION_QUERY)
      .then((result) => {
        if (mounted) setItems(Array.isArray(result) ? result : [])
      })
      .catch(() => {
        if (mounted) setItems([])
      })

    return () => {
      mounted = false
    }
  }, [client])

  const options = useMemo<Option[]>(() => {
    const seen = new Set<string>()
    const list: Option[] = []

    for (const item of items || []) {
      const section = item?.section
      if (!section || seen.has(section)) continue
      seen.add(section)
      list.push({
        value: section,
        label: item.label || NAVIGATION_SECTION_TITLES[section] || section,
      })
    }

    // Tas et menypunkt ut av navigasjonen, ville en lagret verdi forsvunnet
    // fra nedtrekket og stilltiende byttet seg selv ut ved neste lagring.
    // Den beholdes derfor, men merkes.
    if (value && !seen.has(value)) {
      list.push({
        value,
        label: `${NAVIGATION_SECTION_TITLES[value] || value} (ikke i menyen lenger)`,
      })
    }

    return list
  }, [items, value])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.currentTarget.value
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  return (
    <Stack gap={2}>
      <Select
        id={elementProps.id}
        // `elementProps` er typet for `<input>`; her sitter de på et `<select>`.
        onBlur={elementProps.onBlur as unknown as React.FocusEventHandler<HTMLSelectElement>}
        onFocus={elementProps.onFocus as unknown as React.FocusEventHandler<HTMLSelectElement>}
        disabled={Boolean(readOnly)}
        value={value || ''}
        onChange={handleChange}
      >
        <option value="">{items === null ? 'Henter menypunkter …' : 'Velg seksjon …'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {items !== null && options.length === 0 && (
        <Text size={1} muted>
          Ingen menypunkter i Sideinnstillinger › Navigasjon ennå.
        </Text>
      )}
    </Stack>
  )
}
