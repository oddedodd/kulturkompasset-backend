# Kulturkompasset: guide til schema types (Sanity)

Denne guiden forklarer hvordan schema-typene henger sammen, og hvordan du bruker dem i Sanity Studio.

## 1. Hva som er nytt

Modellen er laget for innholdet i prototypen:

- Forside/Hovedside
- Kalender
- Backstage
- Barn & familie
- Spillelister
- Om Kulturkompasset

I stedet for få "flate" typer er modellen delt opp i:

- kjerneinnhold (`event`, `article`, `playlist`)
- gjenbrukbare relasjoner (`category`, `contributor`, `venue`, `partner`)
- global styring av forside/navigasjon (`siteSettings`)

## 2. Oversikt over aktive typer

## Dokumenttyper

- `siteSettings`
- `event`
- `article`
- `playlist`
- `category`
- `contributor`
- `venue`
- `partner`

## Objekttyper

- `seo`
- `cta`

## 3. Hvordan relasjonene fungerer

Relasjonene er designet slik:

- `event` peker til `venue`, `contributor`, `category`, `article`, `partner`
- `article` peker til `contributor`, `category`, `event`, `partner`
- `playlist` peker til `contributor`, `event`, `article`, `partner`
- `siteSettings` peker til utvalgte `event`, `article`, `playlist`, `partner`

Praktisk effekt:

- Samme artist/person (`contributor`) kan brukes i artikler, arrangement og spillelister.
- Samme sted (`venue`) brukes på mange arrangement.
- Samme tema/sjanger/målgruppe (`category`) driver filtrering flere steder.
- Forsiden styres ett sted via `siteSettings`.

## 4. Hvordan bruke `siteSettings`

`siteSettings` er ment som ett sentralt dokument for redaktøren.

Bruk felt slik:

- `mainNavigation`: hvilke menypunkter som skal vises i toppmeny.
- `featuredEvents`: arrangement som vises på forsiden.
- `featuredBackstage`: artikler for Backstage-seksjonen.
- `featuredFamily`: artikler for Barn & familie-seksjonen.
- `featuredPlaylists`: utvalgte spillelister.
- `homePartners`: partnere/sponsorer på forside.
- `aboutText`: tekst for "Om Kulturkompasset".

Anbefaling:

- Ha kun ett `siteSettings`-dokument i produksjon.
- Sett en enkel intern tittel, f.eks. "Kulturkompasset settings".

## 5. Redaksjonell flyt (anbefalt)

Førstegangs oppsett:

1. Opprett `category` (tema/sjanger/målgruppe).
2. Opprett `contributor` (artister, journalister, kuratorer).
3. Opprett `venue` (steder).
4. Opprett `partner` (logo + nivå + aktiv).
5. Opprett innhold: `event`, `article`, `playlist`.
6. Koble alt sammen i `siteSettings`.

Daglig bruk:

1. Nytt arrangement -> opprett `event`, knytt kategori/personer/sted.
2. Ny artikkel -> opprett `article`, knytt kategori/forfatter/event.
3. Ny spilleliste -> opprett `playlist`, knytt kurator og relaterte lenker.
4. Oppdater forside -> rediger `siteSettings`.

## 6. Hvordan dette matcher prototypen i bildet

- `Kalender` -> henter fra `event` (dato, sted, kategorier, relasjoner)
- `Backstage` -> henter `article` med `contentType = backstage`
- `Barn & familie` -> henter `article` med `contentType = barn-og-familie` + relevante `event`
- `Spillelister` -> henter `playlist`
- `Om Kulturkompasset` -> henter `siteSettings.aboutText` (evt. artikkel med riktig type)
- Sponsor-visning -> `partner` + referanser fra `siteSettings`/innhold

## 7. Forenkling (hvis dere vil kutte kompleksitet)

Hvis dette føles for avansert nå, anbefalt minimumsmodell:

1. behold: `siteSettings`, `event`, `article`, `partner`
2. fjern midlertidig: `playlist`, `venue`, `contributor`
3. bruk enkel `category` eller bare ett felt i `article/event`

Da får dere fortsatt:

- tydelig forside-styring
- kalender + redaksjonelt innhold
- sponsorhåndtering

uten for mange relasjoner i starten.

## 8. Viktig om "gamle" typer i prosjektet

Følgende filer finnes fortsatt i repo, men er ikke med i aktiv `schemaTypes/index.ts`:

- `news.ts`
- `sponsor.ts`

De kan beholdes midlertidig for referanse, eller slettes senere for å unngå forvirring.

## 9. Neste steg

Foreslått neste steg i Studio:

1. Opprett ett `siteSettings`-dokument.
2. Legg inn 3-5 `category`.
3. Legg inn 2-3 `event` og 2-3 `article`.
4. Koble disse i `siteSettings`.
5. Test at frontend henter riktig seksjon per nivå i prototypen.

## 10. Tillegg: konkrete innholdseksempler og relasjoner

Her er et konkret eksempelsett du kan bruke i oppstart.

### 10.1 Opprett grunnobjekter først

## A) `category` (3-5 stk)

Eksempel:

- Navn: `Konsert`
  - Type: `Sjanger`
  - Seksjoner: `Kalender`, `Backstage`
- Navn: `Barn 3-8 år`
  - Type: `Målgruppe`
  - Seksjoner: `Barn & familie`
- Navn: `Lokal kultur`
  - Type: `Tema`
  - Seksjoner: `Kalender`, `Backstage`, `Barn & familie`

## B) `contributor` (personer/prosjekter)

Eksempel:

- Navn: `Darling West`
  - Rolle: `Artist`
- Navn: `Redaksjonen Kulturkompasset`
  - Rolle: `Journalist`
- Navn: `Solveig Hansen`
  - Rolle: `Kurator`

## C) `venue` (steder)

Eksempel:

- Navn: `Namsos Kulturhus`
  - By: `Namsos`
- Navn: `Fruene i Kystbyen`
  - By: `Rørvik`

## D) `partner`

Eksempel:

- Navn: `Grong Sparebank`
  - Nivå: `Hovedpartner`
  - Aktiv: `Ja`
  - Synlig i seksjoner: `Hjem`, `Kalender`

### 10.2 Opprett innhold og knytt relasjoner

## A) `event` (Kalender)

Eksempel-arrangement:

- Tittel: `Få billetter: Darling West - Juleturné`
- Status: `Kommende`
- Start: `2026-12-10 19:00`
- Sted: `Namsos Kulturhus` (reference til `venue`)
- Artister/medvirkende: `Darling West` (reference til `contributor`)
- Kategori: `Konsert`, `Lokal kultur` (references)
- Partnere: `Grong Sparebank` (reference)

Resultat:

- Arrangementet dukker opp i kalender.
- Samme artist og sted kan gjenbrukes i andre dokumenter.

## B) `article` (Backstage)

Eksempel-artikkel:

- Tittel: `Intervju med Darling West før juleturnéen`
- Innholdstype: `Backstage`
- Forfatter: `Redaksjonen Kulturkompasset`
- Relaterte arrangement: `Få billetter: Darling West - Juleturné`
- Kategori: `Konsert`, `Lokal kultur`
- Partnere: `Grong Sparebank` (valgfritt)

Resultat:

- Artikkelen kan vises i Backstage.
- Den kobles til arrangementet for krysslenking.

## C) `article` (Barn & familie)

Eksempel-artikkel:

- Tittel: `5 familieaktiviteter i helga`
- Innholdstype: `Barn & familie`
- Kategori: `Barn 3-8 år`, `Lokal kultur`
- Relaterte arrangement: velg 1-2 familievennlige `event`

Resultat:

- Innholdet kan filtreres til Barn & familie-seksjonen.

## D) `playlist`

Eksempel-spilleliste:

- Tittel: `Lyd fra Namdalen`
- Kurator: `Solveig Hansen`
- Spotify URL: legg inn lenke
- Anbefalinger i listevisning:
  - `Lyd fra Namdalen` (blå) -> lenket artikkel: intervjuet
  - `Helgas konsert-anbefaling` (grønn) -> lenket arrangement: Darling West

Resultat:

- Spillelisten får egne anbefalingskort og kan lenke videre til innhold.

### 10.3 Koble alt i `siteSettings`

Opprett ett dokument: `siteSettings`.

Fyll ut slik:

- `mainNavigation`: Kalender, Backstage, Barn & familie, Spillelister, Om Kulturkompasset
- `featuredEvents`: velg 2-4 arrangement
- `featuredBackstage`: velg 2-4 backstage-artikler
- `featuredFamily`: velg 2-4 barn & familie-artikler
- `featuredPlaylists`: velg 1-3 spillelister
- `homePartners`: velg aktive partnere
- `aboutText`: lim inn introtekst om prosjektet

Resultat:

- Du styrer forside og hovedseksjoner fra ett sted.

### 10.4 Praktisk sjekkliste per nytt innhold

Når du publiserer nytt innhold, sjekk alltid:

1. Har dokumentet riktig `contentType` (for artikler)?
2. Er `category` satt (for filtrering)?
3. Er relasjoner lagt til (`venue`, `contributors`, `relatedEvents`/`relatedArticles`)?
4. Er bildet satt med alt-tekst?
5. Skal innholdet løftes på forsiden via `siteSettings`?

## 11. Nyttige lenker

- [Sanity: Content modeling](https://www.sanity.io/docs/content-modeling)
- [Sanity: Schema types](https://www.sanity.io/docs/schema-types)
- [Sanity: Querying with GROQ](https://www.sanity.io/docs/query-cheat-sheet)
