# Seed av testdata i Sanity

Filen `kulturkompasset-seed.ndjson` inneholder eksempeldata for:

- `category`
- `contributor`
- `venue`
- `partner`
- `event`
- `article` (inkl. `contentType: news`)
- `playlist`
- `siteSettings` (`_id: site-settings`)

## Import (anbefalt)

Kjør fra prosjektroten:

```bash
npx sanity dataset import seed/kulturkompasset-seed.ndjson <dataset-navn> --replace
```

Eksempel:

```bash
npx sanity dataset import seed/kulturkompasset-seed.ndjson production --replace
```

`--replace` gjør at dokumenter med samme `_id` oppdateres/erstattes.

## Viktig

- Ta backup av eksisterende data om du har viktig innhold i datasettet.
- Seed-filen bruker faste `_id` for forutsigbar frontend-testing.
