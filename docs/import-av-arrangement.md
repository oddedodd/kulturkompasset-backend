# Import av arrangement fra kommunene

Redaktører kan hente kulturprogrammet fra Namsos, Grong og Nærøysund rett inn i
Kulturkompasset. Alt som importeres blir liggende som **kladd** til noen har gått
gjennom det og publisert manuelt.

## For redaksjonen

1. Gå til **Importerte arrangement › Importer fra kommunene** i menyen.
2. Trykk **Importer** på én kommune. Ta én om gangen.
3. Vent noen sekunder. Panelet viser hva som ble hentet, opprettet og hoppet over.
4. Gå til **Til gjennomgang**, åpne hvert arrangement og rett opp det som mangler.
5. Velg **«Lagre som arrangement og slett oppføring»** i handlingsmenyen nederst.
   Arrangementet publiseres og forsvinner fra Importerte arrangement.

Knappen er den samme typen som «Godkjenn, opprett bulletin og slett innsending»
på tips-innsendinger. Den er grået ut til Tittel, Start og Slug er fylt ut, og
sier hva som mangler når du holder musepekeren over.

### Undermenyene

- **Til gjennomgang** — importerte arrangement som ennå ikke er publisert. Et
  arrangement forsvinner herfra så snart du publiserer det.
- **Mulige duplikater** — importerte kladder som ligner på noe vi har fra før.
  Sjekk disse ekstra nøye.
- **Alle importerte** — alt som noen gang er importert, publisert eller ikke.
- **Importlogg** — kvittering for hver kjørte import.

Vil du heller bruke den vanlige Publiser-knappen, går det fint: arrangementet
forsvinner da fra «Til gjennomgang», men blir liggende under «Alle importerte».
«Lagre som arrangement og slett oppføring» fjerner det fra alle importlistene.

### Hva importen fyller ut

Tittel, dato, sluttid, ingress, brødtekst, billettlenke, kategori, bilde og sted
kommer fra kilden.

**Ett arrangement per forestilling.** Spilles noe flere ganger, blir hver
forestilling sin egen kladd med sin egen dato og sitt eget sted. «Barnas lørdag»
gir sju kladder, og Allehelgenskonserten gir to — én i Steinkjer Kirke 31.10 og
én i Namsos Kirke 01.11.

**Bilder** lastes ned automatisk til Hovedbilde, i full oppløsning. Deler flere
forestillinger samme bilde, lastes det bare opp én gang.

### Sted

Sted kobles automatisk mot `venue`-dokumentene, med litt slark for at kildene
skriver navnene fritt:

| Kilden skriver | Kobles til |
| --- | --- |
| `Namsos folkebibliotek` | Namsos Folkebibliotek |
| `Kunstmuseet Nord-Trøndelag` | Kunstmuseet NordTrøndelag |
| `Fyret` | Fyret Flerbrukshall |
| `Konsertsalen` | Konsertsalen, Kulturhuset i Namsos |
| `NTE-Arena (sittende)` | NTE Arena Rock City |

**Grong er et unntak:** alt fra Kulturhuset Kuben legges alltid på *Kuben
Kulturhus*, uansett om kilden skriver «Symfoni Namsen», «Grong Sparebanksalen»
eller «Foajeen». Det er salene i huset, ikke egne spillesteder.

Finner importen ikke et sikkert nok treff, **står Sted tomt** — det er bedre enn
å plassere arrangementet på feil scene. Kildens stedsnavn ligger under `Import ›
Sted hos kilden`, og det står i importloggen hvilke som ikke ble koblet. I dag
gjelder det blant annet «Steinkjer Kirke» og «Kolvereid Prestegård», som vi ikke
har som spillesteder.

### Duplikatsjekken

Importen sammenligner dato, sted og navn:

- **Sikkert duplikat** — samme **starttid**, samme sted og samme navn. Hoppes
  over, og det står i loggen hvorfor. Klokkeslettet teller, ikke bare datoen:
  «Stakkars Klovn» spilles både 14:00 og 18:00 den 19. september, og med bare
  datosammenligning ville den ene forestillingen slukt den andre.
- **Mulig duplikat** — samme dag og sted, men avvikende navn, eller nesten samme
  navn samme dag. Importeres likevel som kladd, med et varsel i feltet
  `Import › Varsel fra importen`. Du bestemmer om den skal publiseres eller slettes.

Importerer du samme kommune to ganger, gjenkjennes arrangementene på kildens egen
ID — også om de har blitt flyttet til en annen dato siden sist. Du får altså ikke
dobbelt opp av å trykke Importer en gang til.

## For utviklere

### Hvorfor en Sanity Function

Namsos og Grong sender ingen CORS-headere. Et `fetch` fra studioet i nettleseren
blir blokkert av begge. Bare Nærøysund (TicketCo) svarer med
`access-control-allow-origin: *`. Hentingen må derfor skje serverside, og den
kjører som Sanity Function slik at vi slipper egen infrastruktur.

Flyten er:

```
Studio (importEventsPane)
  └─ oppretter eventImport-dokument, status "pending"
       └─ Sanity Function "import-events" trigges på create
            ├─ henter programmet fra kilden
            ├─ sammenligner med eksisterende arrangement
            ├─ oppretter event-kladder (createIfNotExists)
            └─ patcher eventImport med resultat + logg
                 └─ Studio poller og viser resultatet
```

Jobbdokumentet opprettes som *publisert*, ikke kladd: funksjonen lytter på
`create` uten `includeDrafts`, så en kladd ville ikke trigget den.

Funksjonen lytter kun på `create`. Den patcher jobbdokumentet selv, og hadde
`update` også vært med ville den trigget seg selv i en løkke.

### Kildene

| Kilde | Plattform | Hvordan dataene hentes |
| --- | --- | --- |
| Namsos kulturhus | DX (Gatsby) | Programmet er ikke server-rendret. Det ligger i byggebundelen `path---kulturprogram-<hash>.js` som minifisert JS. Hashen leses ut av HTML-en først, siden den endres ved hver ny bygging. |
| Kulturhuset Kuben (Grong) | DX (Gatsby) | Identisk oppsett som Namsos — samme parser. |
| Kultur i Nærøysund | TicketCo | Server-rendret med schema.org-JSON-LD per arrangement. Den ryddigste av de tre. |

`functions/import-events/dx.ts` er den skjøreste delen: den leser et minifisert
JS-objektliteral. Slutter Namsos eller Grong å levere programmet i bundelen, feiler
importen med en tydelig melding om at parseren må oppdateres — den finner ingen
arrangement i stillhet.

I DX-dataene ligger forestillingene i `tickets[]`, hver med sin egen `date` og
`location`. De må leses ut **i par** fra samme oppføring; blandes dato fra én og
sted fra en annen, havner arrangementet på feil scene. `readShowings()` gjør
dette, og hver oppføring blir sitt eget arrangement.

Stedsmatchingen ligger i `venues.ts`. Den prøver flere strategier fra strengest
til løsest — eksakt navn, navn uten tegnsetting, navn uten parentes, prefiks,
delstreng, og til slutt likhet i skrivemåte — og godtar bare treff over en
terskel. `sources.ts` kan sette `fixedVenueName` for kilder der alt spilles på
samme scene, slik Grong gjør.

### Tidssoner

Begge plattformene oppgir lokal tid, men ingen av dem korrekt. DX skriver
`"2026-09-08 18:00:00"` uten tidssone. TicketCo skriver `"2026-09-10T19:00:00Z"`
— med Z for UTC — samtidig som siden viser 19:00 lokalt. I september er Oslo
UTC+2, så Z-en er feil. `functions/import-events/time.ts` regner derfor alle
tidspunkt om fra Oslo-veggklokke til ekte UTC, med riktig håndtering av sommer- og
vintertid.

### Deploy

Funksjonen ligger ikke live før blueprintet er deployet:

```sh
npx sanity blueprints init .   # bare første gang, kobler repoet til en stack
npx sanity blueprints deploy
```

Studioet må deployes separat med `npx sanity deploy` som vanlig. Importknappen
vises i studioet så snart det er deployet, men den vil bli stående på «Venter på
importfunksjonen…» til blueprintet er ute.

Nyttige kommandoer:

```sh
npx sanity functions logs import-events   # se hva funksjonen gjorde
npx sanity blueprints plan                # forhåndsvis endringer før deploy
```

### «Lagre som arrangement og slett oppføring»

`studio/publishImportedEventAction.tsx` er en dokument-handling som speiler
`approveBulletinSubmissionAction`. Forskjellen er at et importert arrangement
allerede *er* av typen `event` — det som skal bort er importsporet, ikke
dokumentet. Handlingen publiserer kladden og fjerner `importSource`,
`importWarning`, `importVenueName`, `importImageUrl` og `importedAt` i én
transaksjon.

`importExternalId` beholdes med vilje. Det er kildens egen ID, og den er det
sterkeste signalet importen har for å kjenne arrangementet igjen ved neste
kjøring. Uten den ville en ny import laget en ny kladd av noe redaksjonen
allerede har publisert — særlig hvis tittelen er redigert, for da treffer heller
ikke sammenligningen på navn. Siden `importSource` er fjernet, dukker
arrangementet likevel ikke opp i importlistene.

Selve feltomskrivingen ligger i den rene funksjonen `toPublishedEvent()`, adskilt
fra handlingen slik at den kan testes uten et kjørende studio.

### Legge til en ny kommune

1. Skriv en parser som returnerer `SourceEvent[]` (se `dx.ts` eller `ticketco.ts`).
2. Registrer kilden i `functions/import-events/sources.ts`.
3. Legg verdien inn i `SOURCE_OPTIONS` i `schemaTypes/documents/eventImport.ts`
   og i `importSource`-lista i `schemaTypes/documents/event.ts`.
4. Legg URL-en inn i `SOURCE_HOMEPAGES` i `studio/importEventsPane.tsx`.
5. Deploy blueprintet på nytt.
