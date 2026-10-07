# KPN Netwerk Uitleg: interactieve 3D-servicetool

## Wat we bouwen

Een interactieve 3D-uitleg die KPN-klanten laat zien hoe hun internetverbinding werkt, van het netwerk van KPN helemaal tot aan de apparaten in huis. Klanten kunnen ook een probleem kiezen dat ze ervaren. De tool licht dan de betrokken delen van het netwerk uit, legt in eenvoudige taal uit wat er aan de hand is en begeleidt ze stap voor stap naar een oplossing.

Dit is een **prototype** voor het KPN Experience Team (B2C digital). Optimaliseer voor helderheid, gevoel en snel kunnen itereren, niet voor productieklare robuustheid.

## Doelen

1. Het onzichtbare zichtbaar maken: de volledige keten van KPN tot apparaat in één rustige, begrijpelijke scène tonen.
2. Een frustrerend moment (iets werkt niet) omzetten in een moment van begrip en zelf kunnen oplossen.
3. Alle uitleg en probleemoplossing data-gedreven houden, zodat niet-ontwikkelaars de content kunnen aanpassen.

## Techstack

- Vite + React + TypeScript
- React Three Fiber (`@react-three/fiber`) + `@react-three/drei` voor de 3D-scène
- `zustand` voor app-state (gekozen probleem, actieve stap, verbindingstype, camerapositie)
- `framer-motion` voor 2D-UI-overgangen; `@react-spring/three` of drei-helpers voor 3D-animatie
- Tailwind CSS voor de UI-laag
- Deploy-doel: Vercel

## Scène: de netwerkketen

Gebruik een gestileerde low-poly look, opgebouwd uit eenvoudige procedurele geometrie (blokken, cilinders, afgeronde vormen). Geen externe modellen in fase 1. Houd de structuur geschikt om later `.glb`-assets in te wisselen (bijvoorbeeld uit Spline of Blender) door elk netwerkonderdeel een eigen component te geven.

De keten, van links naar rechts / van ver naar dichtbij:

| id | Label | Wat het is |
|---|---|---|
| `kpn-core` | KPN netwerk | Het kernnetwerk / datacenter van KPN, de "bron" |
| `backbone` | Glasvezelnetwerk | Glasvezelverbinding(en) naar de wijk |
| `street-cabinet` | Wijkkast | Straatkast / verdeelpunt in de wijk |
| `house-connection` | Aansluiting in huis | Glasvezel: FTU (glasvezelaansluitpunt). DSL: wandcontactdoos |
| `modem` | KPN Box (modem) | De router/modem in huis |
| `wifi` | Wifi-signaal | Gevisualiseerd als zachte uitdijende ringen / bereikvolume |
| `extender` | SuperWifi / wifi-punt | Optioneel mesh-punt in een andere kamer |
| `devices` | Apparaten | Laptop, telefoon, tv/decoder, elk als eigen subonderdeel |

Verbindingen tussen onderdelen zijn aparte entiteiten (`kpn-core→backbone`, enz.), zodat ze los van elkaar uitgelicht kunnen worden. Animeer kleine oplichtende "datapakketjes" die over de verbindingen richting het huis stromen.

### Verbindingstype

Ondersteun een schakelaar tussen **Glasvezel** en **DSL/koper**. De keten en labels veranderen per type een beetje (bijvoorbeeld de aansluiting in huis en de kleur van de kabel). Elk onderdeel en elk probleem geeft aan voor welke verbindingstypes het geldt.

### Het huis

Het huis is een eenvoudige opengewerkte woning met twee of drie kamers, zodat bereikproblemen (bijvoorbeeld "traag op de slaapkamer boven") ruimtelijk getoond kunnen worden.

## Interactiemodel

1. **Verkennen (standaard):** de camera geeft langzaam een overzicht van de keten. Hoveren/tikken op een onderdeel toont een korte tooltip; klikken zet de camera op dat onderdeel en opent de uitleg in het zijpaneel.
2. **Probleemmodus:** de gebruiker kiest een probleem uit een lijst ("Wat is er aan de hand?"). Dan:
   - Worden betrokken onderdelen/verbindingen uitgelicht (waarschuwingskleur, pulseren); de rest wordt gedimd.
   - Laat de pakketjesanimatie het probleem zien (pakketjes die ergens stoppen, vertragen of in een kamer vervagen).
   - Loopt het zijpaneel door de stappen heen. Elke stap verplaatst de camera naar het betreffende onderdeel en legt uit wat daar gebeurt.
   - Tonen de laatste stap(pen) de oplossing: concrete acties die de gebruiker zelf kan doen, plus een "Lukt het niet?"-route (link naar KPN klantenservice / storingenpagina / contact).
3. De gebruiker kan altijd terug naar verkennen of een ander probleem kiezen.

Camerabewegingen zijn vloeiend en vrij rustig (≈0,8–1,2 s) en nooit desoriënterend.

## Datamodel

Alle content staat in `src/content/` als getypeerde TS-bestanden (of JSON), nooit hardcoded in componenten. Code, types en identifiers zijn in het Engels; alle teksten voor de gebruiker in het Nederlands.

```ts
type ConnectionType = 'fiber' | 'dsl';

type NetworkNode = {
  id: string;
  label: string;          // kort label in de scène
  title: string;          // kop in het paneel
  description: string;    // uitleg in eenvoudige taal over wat dit onderdeel doet
  connectionTypes: ConnectionType[];
};

type NetworkLink = {
  id: string;             // bijv. 'street-cabinet__house-connection'
  from: string;
  to: string;
  connectionTypes: ConnectionType[];
};

type IssueStep = {
  focusNodeId: string;    // waar de camera naartoe gaat
  title: string;
  body: string;           // eenvoudige taal, max. ~3 korte zinnen
};

type Fix = {
  title: string;
  steps: string[];
  cta?: { label: string; href: string };
};

type Issue = {
  id: string;
  title: string;          // zoals de klant het zelf zou omschrijven
  symptom: string;        // herkenbaar symptoom in één zin
  connectionTypes: ConnectionType[];
  affectedNodes: string[];
  affectedLinks: string[];
  visualEffect: 'blocked' | 'slow' | 'weak-signal' | 'device-only';
  steps: IssueStep[];
  fixes: Fix[];
  escalation: { label: string; href: string };
};
```

## Eerste problemen (fase 1)

Schrijf conceptteksten voor deze vier. **Alle probleemoplossende content is een concept en moet door KPN Service worden gevalideerd voordat het echt gebruikt wordt.** Markeer dit duidelijk in de contentbestanden met de opmerking `// CONCEPT – valideren met KPN Service`.

1. **Ik heb helemaal geen internet**: geen verbinding op geen enkel apparaat. Betrokken: aansluiting in huis, modem (mogelijk ook verder in het netwerk). Effect: `blocked`. Oplossingen: lampjes op het modem controleren, modem herstarten, kabels controleren, de KPN storingenpagina bekijken.
2. **Mijn wifi is traag in één kamer**: dichtbij het modem gaat het goed, in een kamer verderop is het traag. Betrokken: wifi, apparaten in die kamer. Effect: `weak-signal`. Oplossingen: modem op een centrale, open plek zetten, obstakels vermijden, een SuperWifi-punt overwegen.
3. **Er is een storing in mijn buurt**: alles werkte, en ineens doet niets het meer in de hele wijk. Betrokken: glasvezelnetwerk, wijkkast. Effect: `blocked` vóór het huis. Oplossingen: thuis valt er niets op te lossen; storingenpagina bekijken en wachten op een update.
4. **Eén apparaat maakt geen verbinding**: alles werkt, behalve één apparaat. Betrokken: alleen dat apparaat. Effect: `device-only`. Oplossingen: wifi op het apparaat uit- en aanzetten, het netwerk vergeten en opnieuw toevoegen, het apparaat herstarten.

## Taal en toon

- UI en content standaard in het **Nederlands**, opgezet voor meertaligheid (Engels later als tweede taal). Gebruik een eenvoudige `t()`-helper of `react-i18next`.
- Eenvoudige taal, B1-niveau. Korte zinnen. Geen vakjargon zonder uitleg in één zin. Vriendelijk en rustig, nooit de klant de schuld geven.
- Spreek de klant aan met "je/jij", in lijn met de tone of voice van KPN.

## Visuele stijl

- Gestileerd, strak, zachte belichting, veel ruimte in de scène.
- KPN-groen (`#00C300`) als accent voor een gezonde verbinding; warm oranje/rood voor problemen. Neutraal grijs voor gedimde delen.
- Zet alle kleuren in één themabestand, zodat ze later op het KPN design system afgestemd kunnen worden.
- Typografie in de UI: voorlopig de systeemfont-stack, later te vervangen.

## Layout

- Desktop: het 3D-canvas vult het scherm; zijpaneel (≈380px) rechts voor uitleg, probleemkeuze en stappen.
- Mobiel: 3D-canvas bovenaan (~55% hoogte), paneel als uitschuifbare bottom sheet. Moet volledig met één hand te bedienen zijn.

## Toegankelijkheid (niet onderhandelbaar)

- Alle informatie die in 3D getoond wordt, moet ook als tekst in het paneel staan. Het paneel alleen moet genoeg zijn om het probleem te begrijpen en op te lossen.
- Volledige toetsenbordnavigatie: probleemkeuze, stap vooruit/terug, lijst met onderdelen.
- Respecteer `prefers-reduced-motion`: vervang cameravluchten door harde overgangen en stop de pakketjesanimaties.
- Voldoende contrast in het paneel; gebruik niet alleen kleur om "betrokken" aan te geven (ook iconen/labels).

## Performance

- Doel: soepel op een gemiddelde telefoon. Houd het aantal draw calls laag; hergebruik geometrie en materialen; gebruik instancing voor herhaalde objecten (pakketjes, huizen).
- Laad het 3D-canvas lazy; toon het tekstpaneel direct.
- Bied een 2D-fallback (eenvoudig SVG-diagram van de keten) als WebGL niet beschikbaar is.
- Pauzeer het renderen als het tabblad niet zichtbaar is (`frameloop="demand"` waar mogelijk).

## Projectstructuur (voorstel)

```
src/
  app/            App-shell, layout, routing (indien nodig)
  scene/          Canvas, camera-rig, belichting
  scene/nodes/    Eén component per netwerkonderdeel
  scene/links/    Verbindingen + pakketjesanimatie
  ui/             Zijpaneel, probleemkeuze, stappennavigatie, tooltips
  content/        nodes.ts, links.ts, issues.ts (NL), later en/
  state/          zustand-store
  theme/          kleuren, maten, animatietimings
  fallback/       2D SVG-versie
```

## Mijlpalen

1. **Basis opzetten**: Vite + R3F + Tailwind draaien, lege scène met camerabesturing, paneellayout op desktop en mobiel.
2. **Netwerkketen**: alle onderdelen en verbindingen procedureel gerenderd, pakketjesanimatie, schakelaar glasvezel/DSL.
3. **Verkennen**: tooltips bij hoveren, klikken om de camera te focussen, uitleg per onderdeel uit de contentbestanden.
4. **Probleemmodus**: probleemkeuze, uitlicht/dim-logica, visuele effecten per probleemtype, camerachoreografie per stap, oplossingen en doorverwijzing.
5. **Afwerking**: reduced motion, toetsenbordnavigatie, 2D-fallback, mobiele bottom sheet, performancecheck.
6. **Deploy**: preview-deployment op Vercel.

Werk mijlpaal voor mijlpaal. Start na elke mijlpaal de dev-server, controleer op typefouten en geef een korte samenvatting van wat er gedaan is en wat de volgende stap is voordat je verdergaat.

## Buiten scope (voorlopig)

- Echte klantdata, inloggen of live storings-API's (zet de code wel zo op dat een storingsfeed later aangesloten kan worden).
- 3D-assets op productieniveau.
- Analytics.

## Startprompt

> Lees CLAUDE.md. Begin met mijlpaal 1: zet het project op met de beschreven stack, maak de mappenstructuur aan en maak de content-typedefinities en lege contentbestanden. Stop daarna en laat me zien wat je gebouwd hebt voordat je doorgaat naar mijlpaal 2.
