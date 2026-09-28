# QA Report — SnakePulse Unreleased IMPROVE (post v0.1.1)

**Date:** 2026-09-28 18:17 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/snakepulse`  
**Version:** 0.1.1 + Unreleased improve  
**SHA:** `4fe8add` (parent `d9b47d6` — not amended)  
**IMPROVE brief:** `/workspace/factory/inbox/IMPROVE-snakepulse-20260928-1808.md`  
**Prior:** `QA-REPORT-IMPROVE-20260928.md` (post-v0.1.0 Unreleased IMPROVE **PASS** → absorbed into **v0.1.1**)  
**STATUS claim:** READY_FOR_QA — `npm test` 25/25; build green; Death Share + first-run howto once  
**QA:** Independent pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

Post-v0.1.1 polish holds. Master checklist items (Death Share; first-run howto once) verified in source, Vitest, GUIDE, and dist. Automation: **`npm test` 25/25**, **`npm run build` green** (PWA `generateSW`, 12 precache entries). `base: '/snakepulse/'` unchanged. Preview HTTP smoke `:4191/snakepulse/` **200** for shell, assets, manifest, SW. No new P0/P1.

| Severity | Count |
|----------|------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium / P2   | 0 |
| Low / P3 (residual) | 4 (prior carry) |

**CLEAR from QA (Unreleased IMPROVE post v0.1.1):** **YES**

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | Source review + Vitest + `npm run build`; preview `http://127.0.0.1:4191/snakepulse/` |
| Methods | STATUS / CHANGELOG / IMPROVE 1808 / GUIDE; `share.ts`, `persist.ts`, `main.ts`, `index.html`; `tests/share-howto.test.ts`; dist bundle strings; HTTP smoke |
| Zone | Asia/Karachi (UTC+5); times PKT |
| Git | `4fe8addea83e…` (`4fe8add`) → parent `d9b47d63e473…` (`d9b47d6`); message “Improve Unreleased: death Share + first-run howto once”; parent release commit intact (not amended) |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **25/25 passed** — engine 6 + bots 3 + skins 7 + ads 4 + **share-howto 5**; vitest 3.2.7; exit 0 |
| `npm run build` | **green** — `tsc && vite build`; vite 6.4.3; PWA v1.3.0 `generateSW`; **12 precache entries**; `dist/sw.js` + `workbox-*.js`; exit 0 |
| Base path | **unchanged** — `vite.config.ts` `base: '/snakepulse/'`; dist asset/SW hrefs under `/snakepulse/` |

---

## Master verification (IMPROVE 1808)

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| 1 | Death Share — `navigator.share` / clipboard fallback | **PASS** | `#btn-share` on `#overlay-dead` (`index.html`). `buildDeathShareText(score, best, skinName)` → `SnakePulse — score N · best B · {skin}` (`src/game/share.ts`). `shareDeath()` in `main.ts`: prefers `navigator.share({ title, text })`, on reject/abort → `copyShare`; else clipboard `writeText` + toast **Copied share text**, with `execCommand` legacy fallback. Offline only (no fetch/network). Wired `$('#btn-share').click → shareDeath()`. Vitest: format + blank-skin ignore (`tests/share-howto.test.ts` 3). GUIDE documents Share path. Dist bundle contains `navigator.share`, `Copied share text`, `btn-share`, share text builder. |
| 2 | First-run howto once (`snakepulse:howto`) | **PASS** | `HOWTO_KEY = 'snakepulse:howto'`; `isHowtoSeen()` / `markHowtoSeen()` set `'1'` (`persist.ts`, separate from save blob). Boot: `if (!isHowtoSeen()) showScreen('howto') else showScreen('home')`. Got it (`#btn-howto-ok`) → `markHowtoSeen()` + `showScreen('home')`. Manual `#btn-howto` still opens howto. Play CTA (`#btn-play` → `startGame`) remains wired; dismiss lands on Home — Play not blocked. Vitest: false until mark; persists `'1'` (2 tests). GUIDE: pehli launch auto; Got it saves flag; Play free after dismiss. Dist: key `snakepulse:howto` + boot branch. |

---

## Preview smoke (HTTP)

| URL (under `/snakepulse`) | Result |
|---------------------------|--------|
| `/` | 200 — shell + `#btn-share` Share + howto / Got it |
| `/manifest.webmanifest` | 200 |
| `/sw.js` | 200 |
| `/registerSW.js` | 200 |
| `/assets/index-BLUB1mUi.js`, `index-aNJWhYOk.css` | 200 |

---

## Findings

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **SP-001** | **Low** (prior) | Bot count UI fixed at 4 | Unchanged; engine 3–6 clamp; play uses 4. |
| **SP-002** | **Low** (prior) | Mute flag without SFX | Unchanged stub. |
| **SP-003** | **Low** (prior) | No live airplane-mode browser pass | Structural SW + no game network still OK. |
| **SP-004** | **Low** (prior) | Claim CTA rare on happy path | Unchanged; death auto-unlock still applies. |

No new P0/P1.

---

## CLEAR from QA?

**YES — CLEAR** for Unreleased IMPROVE at `4fe8add` (parent `d9b47d6` intact). Host under **`/snakepulse/`**. Dual-clear / push is Master/SE gate — QA did not push.

---

## Artifacts

- Report: `/workspace/factory/projects/snakepulse/QA-REPORT-IMPROVE-post-0.1.1.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-snakepulse-IMPROVE-post-0.1.1.md`

Report only — no product code changes, no GitHub push, no agent messages.
