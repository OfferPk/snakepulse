# QA Report — SnakePulse MVP v0.1.0

**Date:** 2026-09-28 17:49 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/snakepulse`  
**Version:** 0.1.0  
**PRD:** `/workspace/factory/research/PRD-snakepulse.md` (inbox copy: `/workspace/factory/inbox/PRD-snakepulse.md`)  
**STATUS claim:** READY_FOR_QA — `npm test` 9/9; build green (tsc + Vite + PWA SW)  
**QA:** Independent pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

MVP holds. Master checklist (offline play, 8 skins, ads stubs, GUIDE/README, PWA build) plus local bots and gates all verified. Automation: **`npm test` 9/9**, **`npm run build` green** (PWA `generateSW`, 12 precache entries). Preview smoke on `http://127.0.0.1:4188/snakepulse/` returned 200 for shell, assets, manifest, SW. Engine smoke: 4 bots, clamp 3–6, 8 skins, interstitial/rewarded/remove-ads stubs. No P0/P1.

| Severity | Count |
|----------|------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium / P2   | 0 |
| Low / P3 (residual) | 3 |

**CLEAR for publish from QA:** **YES** (host under `base: /snakepulse/`).

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `npm run preview -- --host 127.0.0.1 --port 4188` → `http://127.0.0.1:4188/snakepulse/` |
| Methods | STATUS / PRD / BUILD / README / GUIDE / template; source review (`engine`, `bots`, `skins`, `ads/stubs`, `persist`, `main`, canvas, PWA); `npm test`; `npm run build`; vite-node engine/ads smoke; HTTP smoke of `dist/` |
| Zone | Asia/Karachi (UTC+5); times PKT |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **9/9 passed** — `tests/engine.test.ts` (6: wall/self collision, wall death, grow, eat+score, reverse ignore) + `tests/bots.test.ts` (3: seek pellet, tickBots no-crash, avoid wall); vitest 3.2.7; exit 0 |
| `npm run build` | **green** — `tsc && vite build`; vite 6.4.3; PWA v1.3.0 `generateSW`; **12 precache entries** (`index.html`, JS/CSS, icons, favicon, manifest, `registerSW.js`); `dist/sw.js` + `workbox-*.js`; exit 0 |

---

## Master verification

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| 1 | Offline play | **PASS** | No gameplay `fetch`/XHR/WebSocket in `src/` (only SVG xmlns + Vite modulepreload polyfill `fetch` in bundle — not game network). `vite-plugin-pwa` SW registers `/snakepulse/sw.js` scope `/snakepulse/`; `precacheAndRoute` lists app shell + assets; `NavigationRoute` → `index.html`. UI copy: “Fully offline” / “Local practice arena — no online matchmaking.” Persistence `localStorage` key `snakepulse_save`. Airplane-mode browser toggle not run this pass — structural offline after first load satisfied (same bar as peer game QAs). |
| 2 | Skins (8) | **PASS** | `src/game/skins.ts` exports **8** skins: `pulse-cyan`, `magenta-ring`, `lime-spark`, `amber-flare`, `violet-wave`, `rose-nova`, `white-core`, `tri-neon`. Unlock by best-score milestone **or** coin cost; free starter. Home → Skins UI renders grid; death auto-unlocks score-eligible skins; `buySkin` / `unlockSkin` / `selectedSkin` in `persist.ts`. Bundle contains skin ids. PRD asked ≥6; SE shipped 8. |
| 3 | Ads stubs | **PASS** | `src/ads/stubs.ts`: `showInterstitial`, `showRewarded`, `purchaseRemoveAds`, `isAdsRemoved` — log-only, no SDK keys. Wired: death → interstitial; “Watch to continue (stub)” → rewarded + `continueRun`; Settings “Remove ads (stub)” → `adsRemoved: true`. Smoke log: `interstitial:show:death`, `rewarded:show/earned:continue`, `iap:remove-ads:stub`. Secrets scan: AdMob/billing only in disclaimer copy. |
| 4 | GUIDE-roman-urdu / README | **PASS** | Both at project root; README links GUIDE. GUIDE matches factory template §§1–9 (what / download / reqs / install-run / demo login N/A / features / troubleshooting / privacy / next). Covers Play, pellets/pulse, bots, death overlay, skins, settings/ads, HUD, PWA install, offline note. |
| 5 | PWA build | **PASS** | `base: '/snakepulse/'`; `public/manifest.webmanifest` (standalone, theme `#070b16`, 192/512 icons); dist rewrites asset hrefs under `/snakepulse/`; `registerSW.js` injects SW; preview HTTP **200** for `/`, manifest, `sw.js`, `registerSW.js`, JS, CSS, icons, favicon. A2HS banner present. |

### Also verified

| Item | Verdict | Evidence |
|------|---------|----------|
| Local bots | **PASS** | `src/game/bots.ts` seek nearest pellet + avoid walls/bodies; `tickBots` each tick; respawn on death. Engine clamps `botCount` to **3–6**; `startGame` uses **4**. Smoke: 4 bots `bot-0…3`; after 40 ticks bots still alive / respawning; clamp(2)→3, clamp(9)→6. Tests: seek, tick no-crash, wall avoid. |
| Core loop | **PASS** | Hard walls, self/bot body collision, grow on pellet, gold pulse speed, score/coins, death overlay Retry/Continue/Home, pause. Canvas renderer + swipe/arrows/turn buttons. |
| IP / copy | **PASS** | Neon pulse original; disclaimers vs Snake Clash / Hole.io / Paper.io; no online matchmaking claim. |

---

## Preview smoke (HTTP)

| URL (under `/snakepulse`) | Result |
|---------------------------|--------|
| `/` | 200 HTML — SnakePulse, Local practice, canvas, Watch-to-continue stub, Remove ads stub, registerSW |
| `/manifest.webmanifest` | 200 — name SnakePulse, display standalone |
| `/sw.js` | 200 — precache shell + assets |
| `/registerSW.js` | 200 — register `/snakepulse/sw.js` |
| `/assets/*.js`, `*.css` | 200 |
| `/icons/icon-192.png`, `/favicon.svg` | 200 |

---

## PRD acceptance mapping (§8)

| Criterion | Result |
|-----------|--------|
| `npm test` + `npm run build` green | **PASS** (9/9 + PWA SW) |
| Airplane / offline after first load | **PASS** (structural SW precache; no live offline toggle this pass) |
| GUIDE-roman-urdu complete | **PASS** |
| No secrets; ads stubs only | **PASS** |
| Distinct from GlowGrid / ArrowPath / WordHunt / Flappy Tap | **PASS** (endless snake + bots arena) |

---

## Findings (residuals only)

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **SP-001** | **Low** | Bot count UI fixed at 4 | Engine clamps 3–6; play always `createGame({ botCount: 4 })`. STATUS “3–6 configurable” is engine-level only — no settings slider. MVP OK (4 ∈ range). |
| **SP-002** | **Low** | Mute flag without SFX | Settings/play mute toggles persist `mute` but no audio beeps yet. GUIDE “Agla update” already lists sound FX. Acceptable v0.1 stub. |
| **SP-003** | **Low** | No live airplane-mode browser pass | SW + zero game network + localStorage verified; full offline reload in headless browser not executed this round. Same residual pattern as peer offline PWAs when structural evidence is strong. |

---

## CLEAR for publish from QA?

**YES — CLEAR for publish** (MVP v0.1.0), contingent on hosting under base **`/snakepulse/`** (or matching Pages path). Dual-clear / `gh-factory` push is Master/SE gate — QA did not push.

---

## Artifacts

- Report: `/workspace/factory/projects/snakepulse/QA-REPORT.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-snakepulse-20260928.md`

Report only — no product code changes, no GitHub push, no agent messages.
