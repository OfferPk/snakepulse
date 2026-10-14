# Changelog

## 0.1.1 — 2026-09-28

### Improved
- **Skin unlock clarity:** locked cards show `Best {best}/{scoreUnlock}` plus `Buy {cost} (you have {coins})`; Buy line highlights when affordable; score-eligible skins show **Claim**; equipped skin shows **Equipped**.
- **Death interstitial stub chrome:** before the death panel, a brief “Ad placeholder (stub)” overlay with Continue (skipped when ads removed). Offline stub only — no real AdMob/network.

## Unreleased

### Improved
- **Background safety:** active runs auto-pause when the app or tab is hidden, preventing missed background frames from advancing into a sudden crash.
- **Run customization:** choose 3–6 local bots in Settings; the preference is saved offline and applied to each new run.
- **Audio feedback:** optional locally synthesized pickup, pulse, and crash cues now make the existing sound toggle functional.
- **Interface polish:** clearer controls/help copy, accessible sound-toggle state and keyboard focus, plus a compact settings control and reduced-motion-friendly transitions.
- **Keyboard pause:** Escape or P pauses/resumes a run, with focus moved to the pause controls for keyboard users; held-key repeats are ignored to prevent accidental toggling.
- **Accessible gameplay dialogs:** pause, death, and interstitial overlays are labeled modal dialogs with contained Tab navigation and focus placed on the primary action.

## 0.1.2 — 2026-09-28

### Improved
- **Death Share:** `#overlay-dead` **Share** button — text `SnakePulse — score N · best B · {skin}`; `navigator.share` when available, else clipboard + toast. Offline only.
- **First-run howto (once):** auto-show howto when `snakepulse:howto` unset; Got it → Home + persist seen; later launches skip auto; manual How to play still works.

## 0.1.0 — 2026-09-28

- Initial ship: neon offline endless snake PWA, 8 skins, death overlay, ad/IAP stubs.
