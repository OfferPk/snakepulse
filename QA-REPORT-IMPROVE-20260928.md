# QA Report — SnakePulse Unreleased IMPROVE (post v0.1.0)

**Date:** 2026-09-28 18:02 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/snakepulse`  
**Version:** 0.1.0 + Unreleased improve  
**SHA:** `aee1698` (parent `f646ec7` — not amended)  
**IMPROVE brief:** `/workspace/factory/inbox/IMPROVE-snakepulse-20260928-1758.md`  
**Prior:** `QA-REPORT.md` (MVP v0.1.0 **PASS**)  
**STATUS claim:** READY_FOR_QA — `npm test` 20/20; build green; Unreleased skin clarity + death interstitial stub chrome  
**QA:** Independent pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

Post-ship polish holds. Master checklist items (skin unlock clarity; death interstitial stub chrome) verified in source, Vitest, GUIDE, and dist. Automation: **`npm test` 20/20**, **`npm run build` green** (PWA `generateSW`, 12 precache entries). `base: '/snakepulse/'` unchanged. Preview HTTP smoke `:4189/snakepulse/` **200** for shell, assets, manifest, SW. No new P0/P1.

| Severity | Count |
|----------|------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium / P2   | 0 |
| Low / P3 (residual) | 4 (3 prior MVP + 1 note) |

**CLEAR from QA (Unreleased IMPROVE):** **YES**

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | Source review + Vitest + `npm run build`; preview `http://127.0.0.1:4189/snakepulse/` |
| Methods | STATUS / CHANGELOG / IMPROVE brief / GUIDE; `skins.ts`, `ads/stubs.ts`, `main.ts`, `index.html`, `style.css`; tests; dist bundle strings; HTTP smoke |
| Zone | Asia/Karachi (UTC+5); times PKT |
| Git | `aee1698` → parent `f646ec72…` (`f646ec7`); message “Improve Unreleased: skin unlock clarity + death interstitial stub chrome” |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **20/20 passed** — `engine` 6 + `bots` 3 + `skins` 7 + `ads` 4; vitest 3.2.7; exit 0 |
| `npm run build` | **green** — `tsc && vite build`; vite 6.4.3; PWA v1.3.0 `generateSW`; **12 precache entries**; `dist/sw.js` + `workbox-*.js`; exit 0 |
| Base path | **unchanged** — `vite.config.ts` `base: '/snakepulse/'`; dist asset hrefs under `/snakepulse/` |

---

## Master verification (IMPROVE)

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| 1 | Skin unlock clarity — Best progress, Buy, Claim, Equipped | **PASS** | `skinCardDisplay` in `src/game/skins.ts`: locked → `Best {best}/{scoreUnlock}` + `Buy {cost} (you have {coins})` with `buyAffordable`; score-eligible → kind `claim` / status **Claim**; selected unlocked → **Equipped**. `renderSkins` wires `skin-meta-line`, `.buy-affordable`, `.claimable` / `.can-buy` CSS. Click toasts: Equipped / Claimed / Bought. Vitest: equipped, claim+Best, locked Best+Buy afford highlight (`tests/skins.test.ts` 7). GUIDE Roman-Urdu documents Best/Buy/Claim/Equipped. Bundle contains `Equipped`, ``Best ${n}/``, ``Buy ${…} (you have ${…})``, Claim path. |
| 2 | Death interstitial stub chrome — modal before death panel; skip if `adsRemoved` | **PASS** | `#overlay-interstitial` in `index.html` (“Ad placeholder (stub)” + Continue) before `#overlay-dead`. `onDeath` **awaits** `showInterstitial('death')` then unhides `#overlay-dead`. `setInterstitialPresenter` shows overlay until Continue. `showInterstitial` skips when `isAdsRemoved()` (`interstitial:skipped`, presenter not called). No throttle; offline stub only. Vitest ads: show+dismissed, awaits presenter, purchaseRemoveAds skips presenter (`tests/ads.test.ts` 4). GUIDE: Ad placeholder → Continue → death panel; skip if remove-ads. |

---

## Preview smoke (HTTP)

| URL (under `/snakepulse`) | Result |
|---------------------------|--------|
| `/` | 200 — shell + `#overlay-interstitial` + Ad placeholder |
| `/manifest.webmanifest` | 200 |
| `/sw.js` | 200 |
| `/registerSW.js` | 200 |
| `/assets/index-D8s6tK2S.js`, `index-aNJWhYOk.css` | 200 |

---

## Findings

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **SP-001** | **Low** (prior) | Bot count UI fixed at 4 | Unchanged; engine 3–6 clamp; play uses 4. |
| **SP-002** | **Low** (prior) | Mute flag without SFX | Unchanged stub. |
| **SP-003** | **Low** (prior) | No live airplane-mode browser pass | Structural SW + no game network still OK. |
| **SP-004** | **Low** (note) | Claim CTA rare on happy path | Death still auto-unlocks score-eligible skins before interstitial; Claim remains for skins-screen desync / pre-unlock edge (IMPROVE acknowledged). Not a fail. |

No new P0/P1.

---

## CLEAR from QA?

**YES — CLEAR** for Unreleased IMPROVE at `aee1698` (parent `f646ec7` intact). Host under **`/snakepulse/`**. Dual-clear / push is Master/SE gate — QA did not push.

---

## Artifacts

- Report: `/workspace/factory/projects/snakepulse/QA-REPORT-IMPROVE-20260928.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-snakepulse-IMPROVE-20260928.md`

Report only — no product code changes, no GitHub push, no agent messages.
