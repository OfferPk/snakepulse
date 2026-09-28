# SnakePulse — Status

**Status:** READY_FOR_QA  
**Updated:** 2026-09-28T18:05:00+05:00 (PKT)  
**Version:** 0.1.0 + Unreleased improve  
**Assignee:** Software Engineer 5  
**Path:** `/workspace/factory/projects/snakepulse`

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **20/20 passed** (engine, bots, skins display, ads interstitial) |
| `npm run build` | **green** (tsc + vite + PWA; `base: /snakepulse/`) |

## Unreleased improve (READY_FOR_QA)

Post-ship polish pack (inbox `IMPROVE-snakepulse-20260928-1758.md`):

1. **Skin unlock clarity** — locked meta `Best {best}/{scoreUnlock}` + `Buy {cost} (you have {coins})`; Buy highlight when affordable; score-eligible **Claim**; equipped **Equipped**.
2. **Death interstitial stub chrome** — modal before `#overlay-dead` (“Ad placeholder (stub)” + Continue); skipped when `adsRemoved`. No throttle. Offline only.

See `CHANGELOG.md` → Unreleased.

## Shipped (MVP v0.1.0)

- Vite + TS + Canvas + PWA scaffold (`base: /snakepulse/`)
- Core loop: grow, hard-wall + self/bot collision, 4 local AI bots
- Death overlay + Retry + rewarded-continue stub + remove-ads stub
- 8 offline skins via best-score milestones or coins (`snakepulse_save`)
- Vitest engine/bots fixtures; README + GUIDE-roman-urdu.md

## Notes

- Original neon pulse IP — no Snake Clash / Hole.io / Paper.io names or assets
- No git push this turn; no real AdMob/Play keys
- Do not amend v0.1.0 commit (`f646ec7`)
