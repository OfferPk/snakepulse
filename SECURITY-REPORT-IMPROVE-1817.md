# SnakePulse — Security Review Report (IMPROVE Unreleased post-v0.1.1)

| Field | Value |
|-------|--------|
| **Project** | SnakePulse |
| **Path** | `/workspace/factory/projects/snakepulse` |
| **Scope** | Unreleased IMPROVE post-v0.1.1 (death Share + first-run howto once) |
| **STATUS** | READY_FOR_QA |
| **HEAD** | `4fe8add` — Improve Unreleased: death Share + first-run howto once |
| **Base** | `d9b47d6` SnakePulse v0.1.1; prior IMPROVE review `SECURITY-REPORT-IMPROVE-1805.md` @ `aee1698` **PASS_WITH_NOTES** |
| **Review date** | 2026-09-28 18:18 PKT (Asia/Karachi) |
| **Reviewer** | Security Reviewer (factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |

No product code was edited. No git push was performed.

---

## Verdict summary

Offline-only neon endless-snake PWA. This IMPROVE pack adds death-overlay Share (`navigator.share` / clipboard + toast) and a first-run howto flag (`snakepulse:howto`). Share payload is static game stats + catalog skin name; toast uses `textContent`; no `innerHTML` of share text; share path has no `fetch` / `sendBeacon` / analytics. Howto flag is strict `=== '1'` boolean gate, never rendered into DOM — crafted values cannot inject. Prior F1 (skin grid `innerHTML`) and F2 (persist unlock/selected not catalog-allowlisted) remain **OPEN** residual notes — not closed by this pack. No RELEASE_GATE ship blockers. Secrets / ads stubs / offline PWA posture unchanged and OK.

**Ship blockers:** none.

---

## Ship blockers

*(none)*

---

## Master focus checklist

| # | Focus | Result |
|---|--------|--------|
| 1 | **share/clipboard text safe (no XSS)** | **PASS** — `buildDeathShareText` (`share.ts:2–12`) interpolates numeric `score`/`best` + optional catalog `skinName` into a plain string. `shareDeath` (`main.ts:89–101`) feeds only `navigator.share({ title: 'SnakePulse', text })` or `clipboard.writeText` / `textarea.value` (`legacyCopy` `main.ts:61–74`). Toast is static `'Copied share text'` via `textContent` (`main.ts:52–54,77`). Share text never assigned to `innerHTML` / `insertAdjacentHTML` / `outerHTML`. Skin name from `skinById(persist.selectedSkin)` → catalog or `SKINS[0]` fallback (`skins.ts:22–23`). |
| 2 | **howto localStorage flag** | **PASS** — Key `snakepulse:howto` (`persist.ts:87`). `isHowtoSeen` is `getItem === '1'` only (`persist.ts:89–94`); `markHowtoSeen` writes `'1'` (`persist.ts:97–102`). Boot: `if (!isHowtoSeen()) showScreen('howto')` (`main.ts:443–447`); Got it → `markHowtoSeen()` then home (`main.ts:356–358`). Flag value never read into HTML/CSS/JS eval — only boolean gate. Non-`'1'` values (including XSS payloads) → treated as unseen; no injection surface. Manual How to play still works without clearing flag. |
| 3 | **no unexpected network from share** | **PASS** — Share path uses Web Share API and/or Clipboard API / `document.execCommand('copy')` only. Grep of first-party `src/`: no `fetch(`, `sendBeacon`, `WebSocket`, `XMLHttpRequest`, `gtag`, analytics. Ads stubs remain in-process (`stubs.ts`). Offline PWA posture unchanged. |

---

## Delta findings (vs `aee1698` / v0.1.1)

### D1 — Death share text is plain / non-HTML (Info / Safe) — **NEW**

| | |
|--|--|
| **Severity** | Info |
| **Evidence** | `src/game/share.ts:1–12`; `src/main.ts:52–101,405`; `index.html` `#btn-share` |
| **Detail** | Pure string builder; clipboard/share APIs only; toast `textContent`. Covered by `tests/share-howto.test.ts` (format + blank skin). |

### D2 — Howto flag boolean-only, not injectable (Info / Safe) — **NEW**

| | |
|--|--|
| **Severity** | Info |
| **Evidence** | `src/game/persist.ts:86–103`; `src/main.ts:356–358,443–447`; `tests/share-howto.test.ts` howto helpers |
| **Detail** | Separate key from save blob. Strict equality to `'1'`. Value never interpolated into DOM. |

### D3 — Skin card meta still via `innerHTML` (Note / Low) — prior **F1 OPEN**

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/main.ts:130` (`grid.innerHTML = ''`); `src/main.ts:163–166` (`btn.innerHTML` with catalog hex/names + display lines) |
| **Detail** | Unchanged by this pack. Sources remain developer catalog + `Number`-coerced persist fields. |
| **Prior F1** | **Still open**. |

### D4 — Persist unlock / selected skin still not catalog-allowlisted (Note / Low) — prior **F2 OPEN**

| | |
|--|--|
| **Severity** | Note |
| **Evidence** | `src/game/persist.ts:29–32,55–56,69–83` |
| **Detail** | Unchanged. UI claim/buy loops catalog only; unknown `selectedSkin` falls back via `skinById` (also protects share skin name). |
| **Prior F2** | **Still open**. |

### D5 — DevDependency Vitest advisory — prior **F4** unchanged

| | |
|--|--|
| **Severity** | Note (dev-only) |
| **Evidence** | `npm audit --omit=dev`: **0**; full audit: 2× moderate vitest / `@vitest/mocker` (GHSA-82fw-gwwq-j7x9) |
| **Acceptance** | Not in production PWA bundle; same acceptance as v0.1.0 / 1805. |

---

## Prior notes status

| ID | Topic | Status after this IMPROVE |
|----|--------|---------------------------|
| **F1** | Skin grid `innerHTML` | **OPEN** — unchanged (D3) |
| **F2** | Persist unlock/selected allowlist | **OPEN** — unchanged (D4) |
| **F3** | Missing `.gitignore` | **CLOSED** (still present) |
| **F4** | Vitest moderate (dev) | **OPEN / accepted** (D5) |
| F5–F6 | Canvas / ads stubs safe | **Still OK** |
| 1805 D3 | Interstitial local modal | **Still OK** |

---

## MVP / v0.1.1 regression (Still OK)

| Item | Status |
|------|--------|
| No secrets / AdMob / Play keys in source | **Still OK** (no `.env`; stubs comment “no real SDK keys”) |
| Offline-only — no gameplay `fetch` / `sendBeacon` / WebSocket / gtag in `src/` | **Still OK** (+ share uses OS share/clipboard only) |
| PWA `base: '/snakepulse/'`, SW precache | **Still OK** (docs / prior) |
| Ads/IAP stubs in-process only | **Still OK** (`src/ads/stubs.ts` unchanged this pack) |
| Scores/HUD/toast/death/settings → `textContent` | **Still OK** (+ share toast) |
| `npm audit --omit=dev` clean | **Still OK** (0 vulns) |
| `.gitignore` present | **Still OK** |

---

## RELEASE_GATE checklist

| # | Item | Status |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A |
| 2 | Authz / IDOR | N/A (local unlock; offline cheat via LS accepted) |
| 3 | Secrets & config | PASS |
| 4 | API surface & rate limits | N/A |
| 5 | Injection (XSS / etc.) | PASS_WITH_NOTES (F1/D3 residual; share/howto PASS) |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES (F4/D5) |
| 8 | Logging / error leakage | PASS (in-memory ad log) |
| 9 | Transport | Deploy HTTPS concern only |
| 10 | Admin / debug surfaces | PASS |

---

## Evidence bullets

- **Git:** HEAD `4fe8add` (`4fe8addea83e378366e4d53401d8faa8c4aaea8e`); parents via `d9b47d6` v0.1.1 / prior review @ `aee1698`; branch `main` ahead 1 of origin (no push this review)
- **Diff scope:** `src/game/share.ts` (new), `src/game/persist.ts` (howto helpers), `src/main.ts` (share + howto boot), `index.html` (`#btn-share`), `tests/share-howto.test.ts`, docs
- **Share XSS:** payload = `SnakePulse — score ${n} · best ${n}[ · ${catalogName}]`; sinks = `navigator.share` / `clipboard.writeText` / `textarea.value`; toast `textContent` only — `main.ts:52–101`
- **Howto injection:** `localStorage.getItem('snakepulse:howto') === '1'` — value never into DOM — `persist.ts:86–103`, `main.ts:443–447`
- **Network (share path):** no `fetch`/`sendBeacon`/analytics in `src/`; share = Web Share + Clipboard only
- **Secrets/ads stubs:** no keys; `stubs.ts` in-process interstitial/rewarded/IAP unchanged
- **Grep `src/`:** `innerHTML` only `main.ts:130,163` (prior F1); no `eval` / `Function(` / `document.write` / `insertAdjacentHTML` / `outerHTML`
- **`npm test`:** **25/25** passed (engine 6, bots 3, skins 7, ads 4, share-howto 5)
- **`npm audit --omit=dev`:** 0 vulnerabilities
- **Docs:** CHANGELOG Unreleased, STATUS READY_FOR_QA, prior SECURITY-REPORT-IMPROVE-1805.md, RELEASE_GATE.md

---

## Notes for Product / Engineer

1. F1 still open: prefer DOM APIs for skin cards before any user-/remote-supplied skin metadata.
2. F2 still open: allowlist `unlockedSkins` / `selectedSkin` against `SKINS` on load/save and in `unlockSkin`/`buySkin` (share already safe via `skinById` fallback).
3. Share/howto pack is clear for QA — no remediations required for Master focus items.
4. When wiring real AdMob/IAP: keys via env / secret store only; re-request Security Review.
5. Vitest moderate advisory remains accepted for prod ship (dev-only).

---

## Sign-off

| | |
|--|--|
| **Verdict** | **PASS_WITH_NOTES** |
| **Ship blockers** | None |
| **Sign-off** | **CLEAR** — Unreleased IMPROVE (death Share + first-run howto) may proceed to QA; no code change required for this gate; F1/F2 remain hardening notes |
| **Blocked?** | No |
| **Code edits / push** | None performed |

*Report path: `/workspace/factory/projects/snakepulse/SECURITY-REPORT-IMPROVE-1817.md`*
