# Changelog

## 0.1.1 — 2026-09-28

### Improved
- **Skin unlock clarity:** locked cards show `Best {best}/{scoreUnlock}` plus `Buy {cost} (you have {coins})`; Buy line highlights when affordable; score-eligible skins show **Claim**; equipped skin shows **Equipped**.
- **Death interstitial stub chrome:** before the death panel, a brief “Ad placeholder (stub)” overlay with Continue (skipped when ads removed). Offline stub only — no real AdMob/network.

## Unreleased

_No changes yet._

## 0.1.2 — 2026-09-28

### Improved
- **Death Share:** `#overlay-dead` **Share** button — text `SnakePulse — score N · best B · {skin}`; `navigator.share` when available, else clipboard + toast. Offline only.
- **First-run howto (once):** auto-show howto when `snakepulse:howto` unset; Got it → Home + persist seen; later launches skip auto; manual How to play still works.

## 0.1.0 — 2026-09-28

- Initial ship: neon offline endless snake PWA, 8 skins, death overlay, ad/IAP stubs.
