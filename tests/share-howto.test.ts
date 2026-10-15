import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildDeathShareText, shouldCopyAfterShareError } from '../src/game/share';
import { isHowtoSeen, markHowtoSeen } from '../src/game/persist';

describe('buildDeathShareText', () => {
  it('formats score and best', () => {
    expect(buildDeathShareText(42, 100)).toBe('SnakePulse — score 42 · best 100');
  });

  it('appends skin name when provided', () => {
    expect(buildDeathShareText(12, 50, 'Lime Spark')).toBe(
      'SnakePulse — score 12 · best 50 · Lime Spark',
    );
  });

  it('ignores blank skin name', () => {
    expect(buildDeathShareText(1, 1, '  ')).toBe('SnakePulse — score 1 · best 1');
  });
});

describe('shouldCopyAfterShareError', () => {
  it('does not copy when the user cancels native sharing', () => {
    expect(shouldCopyAfterShareError({ name: 'AbortError' })).toBe(false);
  });

  it('allows clipboard fallback when native sharing fails', () => {
    expect(shouldCopyAfterShareError(new Error('Share unavailable'))).toBe(true);
    expect(shouldCopyAfterShareError({ name: 'NotAllowedError' })).toBe(true);
  });
});

describe('howto-seen helpers', () => {
  const KEY = 'snakepulse:howto';
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    const mem = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mem,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    store.clear();
  });

  it('is false until marked', () => {
    expect(isHowtoSeen()).toBe(false);
  });

  it('persists after markHowtoSeen', () => {
    markHowtoSeen();
    expect(isHowtoSeen()).toBe(true);
    expect(store.get(KEY)).toBe('1');
  });
});
