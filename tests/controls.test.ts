import { describe, expect, it } from 'vitest';
import { dialogTabTargetIndex, pauseShortcutAction } from '../src/game/controls';

describe('pause keyboard shortcuts', () => {
  it('pauses with Escape or P while playing', () => {
    expect(pauseShortcutAction('Escape', 'playing')).toBe('pause');
    expect(pauseShortcutAction('p', 'playing')).toBe('pause');
    expect(pauseShortcutAction('P', 'playing')).toBe('pause');
  });

  it('resumes with Escape or P while paused', () => {
    expect(pauseShortcutAction('Escape', 'paused')).toBe('resume');
    expect(pauseShortcutAction('p', 'paused')).toBe('resume');
  });

  it('ignores held-key repeats while playing or paused', () => {
    expect(pauseShortcutAction('p', 'playing', true)).toBeNull();
    expect(pauseShortcutAction('Escape', 'paused', true)).toBeNull();
  });

  it('ignores unrelated keys and finished runs', () => {
    expect(pauseShortcutAction('ArrowUp', 'playing')).toBeNull();
    expect(pauseShortcutAction('Escape', 'dead')).toBeNull();
    expect(pauseShortcutAction('p', 'dead')).toBeNull();
  });
});

describe('modal dialog keyboard focus', () => {
  it('wraps forward and reverse tabbing at the dialog boundaries', () => {
    expect(dialogTabTargetIndex(2, 3, false)).toBe(0);
    expect(dialogTabTargetIndex(0, 3, true)).toBe(2);
  });

  it('moves focus back inside when it is outside the dialog', () => {
    expect(dialogTabTargetIndex(-1, 3, false)).toBe(0);
    expect(dialogTabTargetIndex(-1, 3, true)).toBe(2);
  });

  it('leaves normal tab movement alone and handles a one-control dialog', () => {
    expect(dialogTabTargetIndex(1, 3, false)).toBeNull();
    expect(dialogTabTargetIndex(0, 1, false)).toBe(0);
    expect(dialogTabTargetIndex(0, 1, true)).toBe(0);
    expect(dialogTabTargetIndex(0, 0, false)).toBeNull();
  });
});
