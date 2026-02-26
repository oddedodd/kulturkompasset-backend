import {useEffect} from 'react'
import type {LayoutProps} from 'sanity'

export function DefaultStructureRedirectLayout(props: LayoutProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const {pathname, search, hash} = window.location
    if (pathname.endsWith('/dashboard')) return

    const match = pathname.match(/^(.*\/structure)\/?$/)
    if (!match) return

    window.location.replace(`${match[1]}/dashboard${search}${hash}`)
  }, [])

  return props.renderDefault(props)
}
