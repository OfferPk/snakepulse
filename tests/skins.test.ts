import { describe, expect, it } from 'vitest';
import {
  SKINS,
  canAffordBuy,
  canUnlock,
  isClaimableByScore,
  skinCardDisplay,
  skinById,
} from '../src/game/skins';

const lime = skinById('lime-spark'); // score 120, coins 40

describe('canUnlock', () => {
  it('allows free starter and already unlocked', () => {
    expect(canUnlock(SKINS[0]!, 0, 0, [])).toBe(true);
    expect(canUnlock(lime, 0, 0, ['lime-spark'])).toBe(true);
  });

  it('allows by score or coins', () => {
    expect(canUnlock(lime, 120, 0, [])).toBe(true);
    expect(canUnlock(lime, 0, 40, [])).toBe(true);
    expect(canUnlock(lime, 50, 10, [])).toBe(false);
  });
});

describe('skin display helpers', () => {
  it('isClaimableByScore only when milestone met and not unlocked', () => {
    expect(isClaimableByScore(lime, 120, [])).toBe(true);
    expect(isClaimableByScore(lime, 119, [])).toBe(false);
    expect(isClaimableByScore(lime, 200, ['lime-spark'])).toBe(false);
  });

  it('canAffordBuy when coins cover cost', () => {
    expect(canAffordBuy(lime, 40, [])).toBe(true);
    expect(canAffordBuy(lime, 39, [])).toBe(false);
    expect(canAffordBuy(lime, 100, ['lime-spark'])).toBe(false);
  });

  it('equipped shows Equipped', () => {
    const d = skinCardDisplay(lime, 200, 0, ['lime-spark'], 'lime-spark');
    expect(d.kind).toBe('equipped');
    expect(d.statusLabel).toBe('Equipped');
  });

  it('claimable shows Claim with Best progress', () => {
    const d = skinCardDisplay(lime, 150, 5, [], 'pulse-cyan');
    expect(d.kind).toBe('claim');
    expect(d.statusLabel).toBe('Claim');
    expect(d.progressLine).toBe('Best 150/120');
    expect(d.buyLine).toBeNull();
  });

  it('locked shows Best and Buy with afford highlight', () => {
    const short = skinCardDisplay(lime, 80, 10, [], 'pulse-cyan');
    expect(short.kind).toBe('locked');
    expect(short.progressLine).toBe('Best 80/120');
    expect(short.buyLine).toBe('Buy 40 (you have 10)');
    expect(short.buyAffordable).toBe(false);

    const rich = skinCardDisplay(lime, 80, 40, [], 'pulse-cyan');
    expect(rich.buyLine).toBe('Buy 40 (you have 40)');
    expect(rich.buyAffordable).toBe(true);
    expect(rich.statusLabel).toBe('');
  });
});
