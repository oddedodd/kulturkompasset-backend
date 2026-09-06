# AGENTS.md

Retningslinjer for AI-agenter (Claude Code, Codex o.l.) som jobber i dette repoet.

## Om prosjektet

Kulturkompasset backend = et **Sanity Studio v5** (React 19, TypeScript). Repoet inneholder
kun studio/schema — ingen frontend. Frontend ligger i et eget repo og leser fra samme dataset.

Struktur:

- `schemaTypes/documents/` — dokumenttyper (event, article, venue, bulletin, …)
- `schemaTypes/objects/` — gjenbrukbare objekter (`seo`, `cta`)
- `schemaTypes/objects/pageBuilder/` — blokker til pageBuilder-arrayet
- `schemaTypes/index.ts` — samlet eksport, alle nye typer må registreres her
- `sanity.structure.ts` — desk-strukturen (menyen i studioet)
- `studio/` — egne React-komponenter: dashboard, guide-paner, dokument-actions
- `docs/` — norsk dokumentasjon for redaksjon og utviklere
- `seed/` — ndjson-seed for datasettet

## Viktige regler

### Ikke kjør build

**Kjør aldri `npm run build` (eller `sanity build`) uten at jeg eksplisitt ber om det.**
Jeg kjører build manuelt når det er behov for det.

Det samme gjelder:

- `npm run deploy` / `sanity deploy` — aldri uten eksplisitt beskjed
- `npm run dev` / `sanity start` — ikke start dev-server på eget initiativ; hvis noe må
  verifiseres i studioet, si ifra så starter jeg den selv
- `sanity dataset`-kommandoer som skriver/sletter data — aldri uten eksplisitt beskjed

Bruk `npx tsc --noEmit` eller `npx eslint .` hvis du trenger å sjekke at koden holder mål.

### Git

- Ikke commit eller push uten at jeg ber om det.
- Aldri commit `.env` eller andre hemmeligheter.
- Jobb på branch, ikke direkte på `main`, hvis det skal committes.

## Kodekonvensjoner

- TypeScript overalt, `defineType` / `defineField` / `defineArrayMember` fra `sanity`.
- Én dokumenttype per fil, navngitt eksport som matcher `name` (`export const event = ...`).
- Prettier-oppsettet ligger i `package.json`: ingen semikolon, enkle fnutter,
  `printWidth: 100`, `bracketSpacing: false`. Følg det.
- Nye typer må importeres og legges inn i `schemaTypes` i `schemaTypes/index.ts`,
  ellers dukker de ikke opp i studioet.
- Trenger typen egen plass i menyen? Legg den til i `sanity.structure.ts`.

## Språk

- **All tekst som vises i studioet skal være på norsk** — `title`, `description`,
  valideringsmeldinger, previews og optionslister. Redaksjonen er norsk.
- Feltnavn (`name`) og kode er på engelsk (`startsAt`, `venue`, `pageBuilder`).
- Alle felt bør ha en `description` som forklarer for redaksjonen hva feltet brukes til.
- Kommentarer og dokumentasjon i `docs/` skrives på norsk.

## Schema-endringer

- Endringer i schema påvirker eksisterende innhold i datasettet. Vær varsom med å
  endre eller fjerne feltnavn — nevn migreringsbehov i stedet for å gjøre det stille.
- `siteSettings` er en singleton (dokument-ID `site-settings`) — ikke lag flere.
- Oppdater `docs/sanity-skjema-guide-no.md` når schemaet endres på en måte som
  påvirker redaksjonen.

## Miljøvariabler

Konfigurasjon leses fra `.env` (ikke i git, se `.env.example`):
`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_STUDIO_HOST`.

## Arbeidsmåte

- Gjør det som er bedt om — ikke utvid oppgaven på eget initiativ.
- Er noe uklart eller får store konsekvenser, spør før du gjør det.
- Oppsummer kort hva som ble endret, ikke lange rapporter.
