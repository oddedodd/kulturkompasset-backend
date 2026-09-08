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

Skal du lenke til et arrangement midt i teksten — f.eks. når noen du intervjuer trekker
fram et konkret arrangement — har tekstfeltene i sidebyggeren to muligheter:

- Marker teksten og velg lenkeknappen i verktøylinja → `Lenke til arrangement`.
- Eller sett inn blokka `Arrangement` mellom avsnittene for et helt kort med dato, tittel
  og ingress. `Egen tittel` og `Egen ingress` kan overstyres per artikkel; står de tomme,
  brukes teksten fra arrangementet.

Begge viser bare kommende arrangement.

Skal du lenke videre til en hel side, bruk blokka `Lenke til side` under **Handling**
i sidebyggeren:

- Velg først hva lenken peker på:
  - `Intern side i Kulturkompasset` — en enkelt artikkel, arrangement, spilleliste,
    spillested, bidragsyter, bulletin eller kategori.
  - `Seksjon fra menyen` — en av seksjonene du har satt opp under
    **Sideinnstillinger › Navigasjon**. Lista henter menypunktene dine direkte,
    så du ser din egen menytekst («Historier», «Spillesteder») og ikke
    tekniske navn.
  - `Ekstern nettside` — en adresse utenfor Kulturkompasset.
- `Tittel` kan stå tom på interne lenker og seksjoner — da brukes tittelen på siden,
  eller teksten menypunktet har. På eksterne lenker må du skrive den selv.
- `Ingress` er valgfri. Lar du den stå tom, vises «Les mer her».
- `Bilde` er valgfritt, og kan enten lastes opp eller hentes fra bildebiblioteket.

## B2) Importere arrangement fra kommunene

Under **Importerte arrangement › Importer fra kommunene** kan du hente
programmet til Namsos, Grong eller Nærøysund. Ta én kommune om gangen.

- Alt som hentes blir **kladd** — ingenting publiseres automatisk.
- Gå gjennom dem under **Til gjennomgang** og publiser det som skal ut.
- Sjekk **Mulige duplikater** ekstra nøye: de ligner på noe vi har fra før.
- Spilles noe flere ganger, får hver forestilling sin egen kladd med sin dato.
- Bilder følger med automatisk.
- Står **Sted** tomt, fant ikke importen et sikkert treff. Kildens stedsnavn
  ligger under `Import › Sted hos kilden` — fyll inn selv.
- Når arrangementet er klart, velg **«Lagre som arrangement og slett oppføring»**
  nederst. Da publiseres det og forsvinner fra importlistene.

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
