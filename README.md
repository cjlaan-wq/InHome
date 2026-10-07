# KPN Netwerk Uitleg (prototype)

Interactieve 3D-uitleg van de internetverbinding, van KPN tot apparaat. Zie `CLAUDE.md` voor doelen, scope en mijlpalen.

```bash
npm install
npm run dev        # dev-server op http://localhost:5173
npm run typecheck
npm run build
```

Content (onderdelen, verbindingen, problemen) staat in `src/content/`; kleuren en timings in `src/theme/`.

## Handig bij testen

- `?2d` – toon de 2D-fallback (SVG) in plaats van de 3D-scène
- `?perf` – toon draw calls, driehoeken en fps in de scène

## Sneltoetsen

- `Esc` – terug naar het overzicht
- `←` / `→` – vorige/volgende stap bij een probleem

## Deploy (Vercel)

`vercel.json` bevat de build-instellingen. Importeer de repository in Vercel
(Add New → Project → `cjlaan-wq/inhome`); Vite wordt herkend en elke push
krijgt een eigen preview-URL.
