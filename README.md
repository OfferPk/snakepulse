# SnakePulse

**Offline neon endless-snake PWA** — grow on pellets, dodge local AI bots, unlock trail skins. One-thumb arcade. No accounts, no online multiplayer.

> Roman Urdu guide: **[GUIDE-roman-urdu.md](./GUIDE-roman-urdu.md)**

## Quick start

```bash
cd /workspace/factory/projects/snakepulse
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173/snakepulse/`).

```bash
npm test
npm run build
npm run preview
```

## Features (v0.1.0)

- Canvas arena with neon grid + hard walls
- Player snake: swipe / arrow keys / turn buttons
- Pellets + rare gold **pulse** speed pickup
- 3–6 local AI bots (seek pellets, avoid walls; respawn)
- Death overlay: Retry · Watch-to-continue stub · Home
- Interstitial + remove-ads stubs (no AdMob keys)
- ≥6 offline skins via best-score milestones or coins (`localStorage`)
- Installable PWA (manifest + service worker via `vite-plugin-pwa`)

## Persistence keys

Prefix `snakepulse_`: `save` JSON with `bestScore`, `coins`, `unlockedSkins`, `selectedSkin`, `adsRemoved`, `mute`.

## Stack

Vite + TypeScript + Canvas + Vitest + vite-plugin-pwa.

## License / IP

Original “neon pulse” theme. Not affiliated with Snake Clash, Hole.io, or Paper.io.
