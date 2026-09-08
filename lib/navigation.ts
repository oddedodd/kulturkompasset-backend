/**
 * Seksjonssidene i Kulturkompasset som et menypunkt kan peke på.
 *
 * Listen bor her fordi den brukes to steder: `siteSettings.mainNavigation`
 * definerer menyen, og `linkBlock` lar redaktøren lenke til de samme
 * seksjonene fra sidebyggeren. Uten et felles sted ville de to listene
 * kunne komme i utakt.
 */
export const NAVIGATION_SECTIONS = [
  {title: 'Kalender', value: 'kalender'},
  {title: 'Backstage', value: 'backstage'},
  {title: 'Aktuelt', value: 'aktuelt'},
  {title: 'Venues', value: 'venues'},
  {title: 'Spillelister', value: 'spillelister'},
  {title: 'Oppslagstavla', value: 'bulletin'},
  {title: 'Om Kulturkompasset', value: 'om-kulturkompasset'},
] as const

/** Kanonisk navn per seksjon, brukt når menypunktet ikke har egen tekst. */
export const NAVIGATION_SECTION_TITLES: Record<string, string> = Object.fromEntries(
  NAVIGATION_SECTIONS.map((section) => [section.value, section.title]),
)

/** Ett menypunkt slik det ligger i `siteSettings.mainNavigation`. */
export type NavigationItem = {
  label?: string
  section?: string
}

/** GROQ som henter menypunktene. Delt mellom Studio-input og forhåndsvisning. */
export const NAVIGATION_QUERY = '*[_type == "siteSettings"][0].mainNavigation[]{label, section}'

/** Teksten som vises for en seksjon: menyens egen tekst, ellers kanonisk navn. */
export function navigationLabel(section: string, items?: NavigationItem[] | null): string {
  const match = items?.find((item) => item?.section === section)
  return match?.label || NAVIGATION_SECTION_TITLES[section] || section
}
