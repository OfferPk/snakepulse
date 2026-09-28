# SnakePulse — Security Review Report (IMPROVE Unreleased)

| Field | Value |
|-------|--------|
| **Project** | SnakePulse |
| **Path** | `/workspace/factory/projects/snakepulse` |
| **Scope** | Unreleased IMPROVE post-v0.1.0 (skin unlock clarity + death interstitial stub chrome) |
| **STATUS** | READY_FOR_QA |
| **HEAD** | `aee1698` — Improve Unreleased: skin unlock clarity + death interstitial stub chrome |
| **Base** | `f646ec7` SnakePulse v0.1.0 (prior SECURITY-REPORT.md **PASS_WITH_NOTES**) |
| **Review date** | 2026-09-28 18:02 PKT (Asia/Karachi) |
| **Reviewer** | Security Reviewer (factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |

No product code was edited. No git push was performed.

---

## Verdict summary

Offline-only neon endless-snake PWA. This IMPROVE pack adds skin-card display helpers and a local death interstitial modal presenter. Claim/buy remain catalog-driven from the UI; coin deduct path unchanged and correct; interstitial is in-process chrome only (no ad-network `fetch`); `adsRemoved` skips interstitial; interstitial reason uses `textContent`. Prior F1 (`innerHTML` skin cards) and F2 (persist unlock/selected not catalog-allowlisted) are **not closed** by this pack — residual notes only. No RELEASE_GATE ship blockers. MVP offline / secrets / PWA posture still OK.

**Ship blockers:** none.

---

## Ship blockers

*(none)*

---

## Master focus checklist

| # | Focus | Result |
|---|--------|--------|
| 1 | **Skin unlock/claim/buy local state integrity** | **PASS_WITH_NOTES** — UI iterates `SKINS` only; claim uses catalog `skin.id` + `scoreUnlock`; buy calls `buySkin(skin.id, skin.coinCost)` with balance check (`persist.ts:75–83`). Crafted localStorage can still store non-catalog unlock strings / bogus `selectedSkin` (F2 open); render/play constrained via catalog loop + `skinById` → `SKINS[0]` fallback (`skins.ts:22–23`, `canvas.ts` / `main.ts:220`). |
| 2 | **Interstitial stub** | **PASS** — `setInterstitialPresenter` shows `#overlay-interstitial` only; no network (`stubs.ts:31–44`, `main.ts:284–301`). Skipped when `adsRemoved`. No ad-network `fetch`. |
| 3 | **adsRemoved gate** | **PASS** — `purchaseRemoveAds` → `savePersist({ adsRemoved: true })`; `showInterstitial` early-returns + logs `interstitial:skipped`; settings `#ads-status` via `textContent`. Covered by `tests/ads.test.ts`. |
| 4 | **XSS in UI strings** | **PASS_WITH_NOTES** — Progress/buy/status lines built in `skinCardDisplay` (numbers + fixed labels) still concatenated into `btn.innerHTML` (`main.ts:99–115`) — same F1 pattern, sources remain catalog hex/names + `Number`-coerced persist fields. Interstitial reason: `textContent` (`main.ts:285–289`). HUD/home/death/toast/settings: `textContent`. No `eval` / `Function(` / `document.write` / `insertAdjacentHTML` / `outerHTML` in first-party `src/`. |

---

## Delta findings (vs `f646ec7`)

### D1 — Skin card meta still via `innerHTML` (Note / Low) — prior **F1 OPEN**

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/main.ts:79` (`grid.innerHTML = ''`); `src/main.ts:99–115` (`btn.innerHTML` with `skin.head`/`body`/`name` + `display.progressLine` / `buyLine` / `statusLabel`) |
| **Detail** | IMPROVE expands meta to `Best {best}/{scoreUnlock}`, `Buy {cost} (you have {coins})`, Claim/Equipped CTAs via `skinCardDisplay` (`skins.ts:62–120`). Values interpolated into HTML are still developer catalog strings or `Math.max(0, Number(...))`-coerced scores/coins — not raw unlock-id strings from save. Pattern not migrated to `createElement` + `textContent`. |
| **Prior F1** | **Still open** (not closed by this pack). |
| **Fix (hardening)** | Build swatch/name/meta with DOM APIs; set gradient via `style` on an element. |

### D2 — Persist unlock / selected skin still not catalog-allowlisted (Note / Low) — prior **F2 OPEN**

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/game/persist.ts:29–32` (load: `map(String)`, any `selectedSkin` string); `55–56` (save merge); `unlockSkin` / `buySkin` (`69–83`) accept any `id` without `SKINS` membership check |
| **Detail** | IMPROVE did not touch persist filtering. UI claim/buy/auto-unlock loops only pass catalog ids (`main.ts:116–141`, `201–205`). Arbitrary crafted unlock ids do not render as cards (grid = `SKINS` only). Unknown `selectedSkin` falls back via `skinById` to Pulse Cyan. Offline solo integrity only. |
| **Prior F2** | **Still open** (not closed by this pack). |
| **Fix (hardening)** | Filter `unlockedSkins` / `selectedSkin` to `SKINS.map(s => s.id)` on read/write; reject unknown ids in `unlockSkin`/`buySkin`. |

### D3 — Interstitial presenter is local modal only (Info / Safe) — **NEW**

| | |
|--|--|
| **Severity** | Info |
| **Evidence** | `src/ads/stubs.ts:8–17,31–44`; `src/main.ts:284–301`; `index.html` `#overlay-interstitial` / `#interstitial-reason` / `#btn-interstitial-continue` |
| **Detail** | Presenter awaits Continue click; reason set with `textContent` (fixed copy by reason). No SDK, no `fetch`, no iframe/script injection. `isAdsRemoved()` skips presenter entirely. |

### D4 — Prior F3 `.gitignore` (hygiene) — **CLOSED** on tree

| | |
|--|--|
| **Severity** | Info (resolved) |
| **Evidence** | `.gitignore` present (`node_modules`, `dist`, `.env`, `.env.*`, `!.env.example`, editor junk) |
| **Detail** | Addressed since MVP on-disk review; reduces risk of committing deps/build/secrets before publish. |

### D5 — DevDependency Vitest advisory — prior **F4** unchanged

| | |
|--|--|
| **Severity** | Note (dev-only) |
| **Evidence** | `npm audit --omit=dev`: **0**; full audit: 2× moderate vitest / `@vitest/mocker` (GHSA-82fw-gwwq-j7x9) |
| **Acceptance** | Not in production PWA bundle; same acceptance as v0.1.0. |

---

## Prior notes status

| ID | Topic | Status after IMPROVE |
|----|--------|----------------------|
| **F1** | Skin grid `innerHTML` | **OPEN** — still used; meta lines expanded (D1) |
| **F2** | Persist unlock/selected allowlist | **OPEN** — unchanged (D2) |
| **F3** | Missing `.gitignore` | **CLOSED** (D4) |
| **F4** | Vitest moderate (dev) | **OPEN / accepted** (D5) |
| F5–F6 | Canvas / ads stubs safe | **Still OK** |

---

## MVP regression (Still OK)

| Item | Status |
|------|--------|
| No secrets / AdMob / Play keys in source | **Still OK** |
| Offline-only — no gameplay `fetch` / `sendBeacon` / WebSocket / gtag in `src/` | **Still OK** (dist only Vite modulepreload same-origin `fetch`) |
| PWA `base: '/snakepulse/'`, SW precache, no GA route registered | **Still OK** |
| Ads/IAP stubs in-process only | **Still OK** (+ interstitial chrome) |
| Scores/HUD/toast/death/settings → `textContent` | **Still OK** |
| `npm audit --omit=dev` clean | **Still OK** (0 vulns) |

---

## RELEASE_GATE checklist

| # | Item | Status |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A |
| 2 | Authz / IDOR | N/A (local unlock; offline cheat via LS accepted) |
| 3 | Secrets & config | PASS |
| 4 | API surface & rate limits | N/A |
| 5 | Injection (XSS / etc.) | PASS_WITH_NOTES (F1/D1) |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES (F4/D5) |
| 8 | Logging / error leakage | PASS (in-memory ad log) |
| 9 | Transport | Deploy HTTPS concern only |
| 10 | Admin / debug surfaces | PASS |

---

## Evidence bullets

- **Git:** HEAD `aee1698`; base `f646ec7`; branch `main` ahead 1 of origin (no push this review)
- **Diff scope:** `src/ads/stubs.ts`, `src/game/skins.ts`, `src/main.ts`, `src/style.css`, `index.html`, `tests/ads.test.ts`, `tests/skins.test.ts`, docs
- **Grep `src/`:** `innerHTML` only `main.ts:79,112`; no `eval` / `Function(` / `document.write` / `insertAdjacentHTML` / `outerHTML`; no `fetch(` / `sendBeacon` / WebSocket in first-party TS
- **Claim/buy:** catalog-only click path `main.ts:116–141`; `buySkin` deducts `cost` when `coins >= cost` (`persist.ts:75–83`)
- **Interstitial:** presenter + `adsRemoved` skip — `tests/ads.test.ts` (4); `textContent` for reason
- **`npm test`:** **20/20** passed (engine 6, bots 3, skins 7, ads 4)
- **`npm audit --omit=dev`:** 0 vulnerabilities
- **Docs:** CHANGELOG Unreleased, STATUS READY_FOR_QA, prior SECURITY-REPORT.md, RELEASE_GATE.md

---

## Notes for Product / Engineer

1. F1 still open: prefer DOM APIs for skin cards before any user-/remote-supplied skin metadata.
2. F2 still open: allowlist `unlockedSkins` / `selectedSkin` against `SKINS` on load/save and in `unlockSkin`/`buySkin`.
3. When wiring real AdMob/IAP: keys via env / secret store only; re-request Security Review (interstitial presenter is the right hook — keep network out of MVP).
4. Vitest moderate advisory remains accepted for prod ship (dev-only).

---

## Sign-off

| | |
|--|--|
| **Verdict** | **PASS_WITH_NOTES** |
| **Ship blockers** | None |
| **Sign-off** | **CLEAR** — Unreleased IMPROVE may proceed to QA; no code change required for this gate; F1/F2 remain hardening notes |
| **Blocked?** | No |
| **Code edits / push** | None performed |

*Report path: `/workspace/factory/projects/snakepulse/SECURITY-REPORT-IMPROVE-1805.md`*
