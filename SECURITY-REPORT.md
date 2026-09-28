# SnakePulse — Security Review Report

| Field | Value |
|-------|--------|
| **Project** | SnakePulse |
| **Path** | `/workspace/factory/projects/snakepulse` |
| **Version** | 0.1.0 |
| **STATUS** | READY_FOR_QA |
| **Git** | No `.git` present (on-disk source review) |
| **Review date** | 2026-09-28 17:49 PKT (Asia/Karachi) |
| **Reviewer** | Security Reviewer (factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |

No product code was edited. No git push was performed.

---

## Verdict summary

Offline-only neon endless-snake PWA (Vite + TypeScript + Canvas + `vite-plugin-pwa`). No accounts, no backend, no third-party SDKs, no AdMob/Play keys. Persistence is same-origin `localStorage` (`snakepulse_save`). Ads/IAP are in-process stubs. Production dependency audit (`npm audit --omit=dev`) is clean. XSS path for scores/HUD uses `textContent`; skin UI HTML is built only from the hardcoded `SKINS` catalog.

**Ship blockers:** none.

Notes are hardening items (persist allowlist, prefer DOM APIs over `innerHTML` for skins, add `.gitignore` before first commit, accept/bump vitest-only advisory) — not RELEASE_GATE publish blockers for this MVP.

---

## Ship blockers

*(none)*

---

## Findings

### F1 — Skin grid uses `innerHTML` with catalog strings (Note / Low)

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/main.ts:74` (`grid.innerHTML = ''`); `src/main.ts:83–92` (`btn.innerHTML = \`...\${skin.head}...\${skin.name}...\``) |
| **Detail** | Skin cards concatenate `skin.head`, `skin.body`, and `skin.name` into HTML. Today those values come only from the static `SKINS` array in `src/game/skins.ts:11–20` (developer-controlled hex + names). `renderSkins()` iterates `SKINS`, not raw localStorage strings. |
| **Mitigating** | HUD / home / death / toast / settings all use `textContent` (`main.ts:40`, `49–50`, `55–58`, `63–66`, `185`). No `eval` / `Function(` / `document.write` / `insertAdjacentHTML` / `outerHTML` in first-party source. |
| **Risk if ignored** | If a future change renders skin metadata from localStorage or remote JSON without escaping, this pattern becomes XSS. |
| **Fix (when hardening)** | Build cards with `createElement` + `textContent`; set swatch via `style.background` on an element (still prefer allowlisted hex). |

### F2 — Persist unlock / selected skin ids not filtered to catalog (Note / Low)

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/game/persist.ts:25–35` — `JSON.parse` + coerce; `unlockedSkins` → `map(String)` without catalog filter; `selectedSkin` any string |
| **Detail** | Load path hardens numbers (`Math.max(0, Number(...) \|\| 0)`), booleans, and try/catch on parse. Unlock ids are **not** intersected with `SKINS` ids. A user who edits `localStorage` can store arbitrary unlock strings or a bogus `selectedSkin`. |
| **Mitigating** | UI unlock/buy paths pass catalog `skin.id` only (`main.ts:93–119`, `179–182`). `skinById()` (`skins.ts:22–23`) falls back to `SKINS[0]` for unknown ids. Canvas uses `skinById(selectedSkinId)` (`render/canvas.ts:62`). Skin grid never dumps raw unlock strings into the DOM. Integrity/cheat only for offline solo progress. |
| **Fix (when hardening)** | On read/write, filter `unlockedSkins` and `selectedSkin` to `SKINS.map(s => s.id)` (always keep `pulse-cyan`). Optionally reject oversized arrays. |

### F3 — No `.gitignore` (Note / Hygiene)

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | Project root: no `.gitignore`; no `.git`; `node_modules/` and `dist/` present on disk |
| **Detail** | MVP has no env secrets. Before first `git init` / publish, missing ignore risks committing `node_modules`, `dist`, or future `.env` with AdMob/Play keys. |
| **Fix** | Add `.gitignore` covering `node_modules/`, `dist/`, `.env`, `.env.*`, `!.env.example`, editor junk, before GitHub Manager ships. |

### F4 — DevDependency Vitest advisory (Note / Accepted for prod ship)

| | |
|--|--|
| **Severity** | Note (dev-only) |
| **Evidence** | `npm audit` (full): 2× moderate in `vitest` / `@vitest/mocker` (GHSA-82fw-gwwq-j7x9). `npm audit --omit=dev`: **0 vulnerabilities**. |
| **Detail** | All packages in `package.json` are `devDependencies` (vite, typescript, vite-plugin-pwa, vitest). Vitest is not shipped in the production PWA bundle. Advisory is CI/dev path-traversal via mocker redirects — not runtime player exposure. |
| **Acceptance** | Documented for Olivia: acceptable for MVP publish; bump Vitest when convenient (may be breaking → 5.x). |

### F5 — Canvas path has no HTML injection (Info / Safe)

| | |
|--|--|
| **Severity** | Info |
| **Evidence** | `src/render/canvas.ts` — Canvas 2D only (`fillRect`, `arc`, `fillStyle` from catalog hex / bot color constants) |
| **Detail** | Game state (score, length, snake ids) never becomes HTML. Player colors from `skinById`; bot colors from engine palette constants. |

### F6 — Ads / IAP stubs have no SDK keys (Info / Safe)

| | |
|--|--|
| **Severity** | Info |
| **Evidence** | `src/ads/stubs.ts:20–46` — in-memory `log[]`, `Promise.resolve`, `savePersist({ adsRemoved: true })` |
| **Detail** | No AdMob app id, `ca-app-pub`, Play Billing, or network calls. UI labels say “(stub)” (`index.html:69`, `98`). |

---

## Master focus checklist

| # | Focus | Result |
|---|--------|--------|
| 1 | **XSS (UI / skin labels / score → DOM)** | **PASS_WITH_NOTES** — Scores/HUD/toast/death meta use `textContent`. Skin cards use `innerHTML` but only with static `SKINS` catalog (F1). No eval/write/outerHTML. |
| 2 | **Secrets (no AdMob/Play keys)** | **PASS** — No keys/tokens/private material in source, lockfile, or config. Docs explicitly state stubs only. |
| 3 | **PWA / service worker hygiene** | **PASS** — `vite.config.ts`: `base: '/snakepulse/'`, `registerType: 'autoUpdate'`, `manifest: false` (static `public/manifest.webmanifest`), workbox glob for static assets, `devOptions.enabled: false`. Built `dist/registerSW.js` registers `/snakepulse/sw.js` with scope `/snakepulse/`. `dist/sw.js`: precache + `NavigationRoute` → `index.html` + `cleanupOutdatedCaches` / `clientsClaim`. Transitive `workbox-google-analytics` in lockfile is **not** registered in SW. |
| 4 | **Offline-only / no unexpected telemetry** | **PASS** — No `fetch(` / `sendBeacon` / gtag / analytics / AdMob / WebSocket in `src/`. Dist app JS has no third-party hosts (only Vite modulepreload `fetch` for same-origin assets). Ads stubs do not phone home. |
| 5 | **Ads stubs** | **PASS** — `src/ads/stubs.ts` interstitial / rewarded / remove-ads are no-op network stubs; flag in localStorage only. |
| 6 | **Dependency audit** | **PASS_WITH_NOTES** — `npm audit --omit=dev`: 0. Full audit: vitest-only moderate (F4). |

### Also useful

| Item | Result |
|------|--------|
| Skin unlock ids allowlisted vs catalog if stored | **PARTIAL** — not filtered on load (F2); UI/render constrained to catalog |
| Persist JSON parse hardening | **PASS_WITH_NOTES** — try/catch, Number/Boolean coerce; unlock/selected not catalog-filtered (F2) |
| Canvas path no HTML from game state | **PASS** (F5) |

### RELEASE_GATE checklist

| # | Item | Status |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A (no accounts) |
| 2 | Authz / IDOR | N/A (local unlock client-side only) |
| 3 | Secrets & config | PASS (stubs; note F3 before secrets land) |
| 4 | API surface & rate limits | N/A (no server API) |
| 5 | Injection (XSS / etc.) | PASS_WITH_NOTES (F1) |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES (F4) |
| 8 | Logging / error leakage | PASS (ad stub in-memory log; no PII to network) |
| 9 | Transport | Deploy concern (serve over HTTPS); app has no cookie auth |
| 10 | Admin / debug surfaces | PASS (no debug endpoints) |

---

## Evidence bullets (tests / tools)

- **On-disk review** — no `.git`; source under `/workspace/factory/projects/snakepulse`
- **Grep (excl. node_modules/dist/lock):** `innerHTML` only in `src/main.ts:74,83`; no `eval` / `Function(` / `document.write` / `sendBeacon` / `gtag` / AdMob SDK / `fetch(` in first-party app code
- **Secrets grep:** no `ca-app-pub`, API keys, `AIza`, private PEM — only documentation mentions of AdMob/password placeholders
- **Persist:** `src/game/persist.ts` key `snakepulse_save`; JSON parse + field coerce
- **Skins catalog:** 8 ids in `src/game/skins.ts` (`pulse-cyan` … `tri-neon`)
- **Canvas:** `src/render/canvas.ts` — 2D draw only
- **Ads:** `src/ads/stubs.ts` — stub interstitial/rewarded/IAP
- **PWA:** `dist/sw.js` precache of app assets under `/snakepulse/`; no GA route
- **`npm test`:** 9/9 passed (`tests/engine.test.ts` 6, `tests/bots.test.ts` 3)
- **`npm audit --omit=dev`:** 0 vulnerabilities
- **`npm audit` (full):** 2 moderate (vitest / `@vitest/mocker` GHSA-82fw-gwwq-j7x9)
- **Docs read:** README.md, STATUS.md, GUIDE-roman-urdu.md, RELEASE_GATE.md

---

## Notes for Product / Engineer

1. Prefer DOM APIs for skin cards before any user- or remote-supplied skin metadata.
2. Allowlist `unlockedSkins` / `selectedSkin` against `SKINS` on load/save.
3. Add `.gitignore` before first git publish (`node_modules`, `dist`, `.env*`).
4. When wiring real AdMob/IAP: keys via env / secret store only; re-request Security Review.

---

## Sign-off

| | |
|--|--|
| **Verdict** | **PASS_WITH_NOTES** |
| **Ship blockers** | None |
| **Sign-off** | **CLEAR** — may proceed to QA / GitHub Manager after Product acknowledges notes (no code change required for this gate) |
| **Blocked?** | No |

*Report path: `/workspace/factory/projects/snakepulse/SECURITY-REPORT.md`*
