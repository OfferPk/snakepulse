# SnakePulse — Status

**Status:** SHIPPED  
**Updated:** 2026-09-28T18:22:00+05:00 (PKT)  
**Version:** 0.1.2  
**Assignee:** Software Engineer 5  
**Path:** `/workspace/factory/projects/snakepulse`

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **25/25 passed** (engine, bots, skins, ads, share-howto) |
| `npm run build` | **green** (tsc + vite + PWA; `base: /snakepulse/`) |

## v0.1.2 release

Post-v0.1.1 polish pack (dual-clear; QA PASS + Security PASS_WITH_NOTES / IMPROVE-1817):

1. **Death Share** — Share on `#overlay-dead`; `navigator.share` or clipboard + toast; offline only.
2. **First-run howto (once)** — auto-show when `snakepulse:howto` unset; Got it persists; manual How to play still works; Play not blocked after dismiss.

See `CHANGELOG.md` → 0.1.2. Skin unlock clarity + death interstitial remain in **v0.1.1**.

## Shipped

- **v0.1.2** — death Share + first-run howto once

- **v0.1.1** — skin unlock clarity + death interstitial stub chrome
- **v0.1.0** — neon offline endless snake PWA, 8 skins, ad/IAP stubs

## Notes

- Keep `base: '/snakepulse/'` in vite.config.ts
- Original neon pulse IP — no Snake Clash / Hole.io / Paper.io names or assets
- Release commit is based on `4fe8add`; prior release commit `d9b47d6` was not amended
