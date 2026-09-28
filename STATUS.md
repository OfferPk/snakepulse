# SnakePulse — Status

**Status:** READY_FOR_QA  
**Updated:** 2026-09-28T18:20:00+05:00 (PKT)  
**Version:** 0.1.1 + Unreleased improve  
**Assignee:** Software Engineer 5  
**Path:** `/workspace/factory/projects/snakepulse`

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **25/25 passed** (engine, bots, skins, ads, share-howto) |
| `npm run build` | **green** (tsc + vite + PWA; `base: /snakepulse/`) |

## Unreleased improve (READY_FOR_QA)

Post-v0.1.1 polish pack (inbox `IMPROVE-snakepulse-20260928-1808.md`):

1. **Death Share** — Share on `#overlay-dead`; `navigator.share` or clipboard + toast; offline only.
2. **First-run howto (once)** — auto-show when `snakepulse:howto` unset; Got it persists; manual How to play still works; Play not blocked after dismiss.

See `CHANGELOG.md` → Unreleased. Do **not** rebuild 1758 (skin unlock clarity + death interstitial) — already in **v0.1.1**.

## Shipped

- **v0.1.1** — skin unlock clarity + death interstitial stub chrome
- **v0.1.0** — neon offline endless snake PWA, 8 skins, ad/IAP stubs

## Notes

- Keep `base: '/snakepulse/'` in vite.config.ts
- Original neon pulse IP — no Snake Clash / Hole.io / Paper.io names or assets
- No git push this turn; never amend release commit `d9b47d6`
