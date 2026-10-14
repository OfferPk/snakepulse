import { describe, expect, it } from 'vitest';
import { setPersonalBestBadge } from '../src/game/results';

describe('personal-best result badge', () => {
  it('reveals the badge and includes the achieved score for a new record', () => {
    const badge = { hidden: true, textContent: '' as string | null };

    expect(setPersonalBestBadge(badge, 42, 31)).toBe(true);
    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toBe('New personal best — 42');
  });

  it('keeps a tied score hidden and clears stale announcement text', () => {
    const badge = { hidden: false, textContent: 'Old personal best' as string | null };

    expect(setPersonalBestBadge(badge, 31, 31)).toBe(false);
    expect(badge.hidden).toBe(true);
    expect(badge.textContent).toBe('');
  });

  it('does not announce a run below the previous best', () => {
    const badge = { hidden: true, textContent: '' as string | null };

    expect(setPersonalBestBadge(badge, 30, 31)).toBe(false);
    expect(badge.hidden).toBe(true);
  });
});
