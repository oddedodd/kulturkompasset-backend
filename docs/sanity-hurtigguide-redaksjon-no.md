# Sanity hurtigguide for redaksjonen (Kulturkompasset)

Denne guiden er laget for rask publisering med minst mulig friksjon.

## 1. Minimum du må fylle ut

## A) Arrangement (`event`)

Fyll alltid ut:

- `Tittel`
- `Slug` (kan genereres fra tittel)
- `Status` (`Kommende`)
- `Start` (dato + klokkeslett)

Bør fylles ut:

- `Sted` (`venue`)
- `Kategori` (minst 1)
- `Ingress`
- `Hovedbilde`

## B) Artikkel (`article`)

Fyll alltid ut:

- `Tittel`
- `Slug`
- `Innholdstype` (`Backstage` eller `Barn & familie`)
- `Publisert`
- `Innhold`

Bør fylles ut:

- `Forfattere`
- `Kategori`
- `Ingress`
- `Hovedbilde`
- `Relaterte arrangement` (hvis relevant)

## C) Spilleliste (`playlist`)

Fyll alltid ut:

- `Tittel`
- `Slug`

Bør fylles ut:

- `Kurator`
- `Spotify URL`
- `Beskrivelse`
- `Cover`

## 2. Før publisering: 60-sekunders sjekk

1. Har dokumentet riktig seksjon/type?
2. Har du lagt til minst én relevant `category`?
3. Har du valgt riktig relasjon (`venue`, `contributors`, `relatedEvents`)?
4. Har bildet alt-tekst?
5. Skal innholdet løftes på forsiden via `siteSettings`?

## 3. Forside-styring (`siteSettings`)

Bruk ett dokument: `Sideinnstillinger`.

Oppdater ved behov:

- `featuredEvents`
- `featuredBackstage`
- `featuredFamily`
- `featuredPlaylists`
- `homePartners`

Tips:

- Hvis noe ikke vises på forsiden, sjekk først at dokumentet er lagt til i riktig `featured...`-felt.

## 4. Rask oppskrift ved ny sak

1. Opprett `event` eller `article`.
2. Fyll minimumsfeltene.
3. Legg til relasjoner (`category`, eventuelt `venue`/`contributors`).
4. Legg inn bilde.
5. Gå til `siteSettings` og løft innholdet frem hvis det skal på forsiden.

## 5. Vanlige feil

- Mangler `contentType` på artikkel -> havner feil i frontend.
- Mangler `Start` på arrangement -> dårlig sortering i kalender.
- Ingen `category` -> vanskelig å filtrere innhold.
- Innhold laget, men ikke lagt i `siteSettings` -> vises ikke der du forventer.

## 6. Nyttige lenker

- [Sanity: Content modeling](https://www.sanity.io/docs/content-modeling)
- [Sanity: Studio basics](https://www.sanity.io/docs/sanity-studio)
- [Sanity: Structure builder](https://www.sanity.io/docs/structure-builder-reference)
