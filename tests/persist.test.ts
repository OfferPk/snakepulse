import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadPersist, savePersist } from '../src/game/persist';

const KEY = 'snakepulse_save';
const store = new Map<string, string>();

describe('bot-count preference', () => {
  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => store.set(key, String(value)),
        removeItem: (key: string) => store.delete(key),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => store.clear());

  it('defaults older saves to the classic four bots', () => {
    store.set(KEY, JSON.stringify({ bestScore: 12, mute: true }));
    expect(loadPersist().botCount).toBe(4);
  });

  it('persists a selected bot count', () => {
    expect(savePersist({ botCount: 6 }).botCount).toBe(6);
    expect(loadPersist().botCount).toBe(6);
  });

  it('clamps invalid values to the supported 3–6 range', () => {
    expect(savePersist({ botCount: 1 }).botCount).toBe(3);
    expect(savePersist({ botCount: 9 }).botCount).toBe(6);
    expect(savePersist({ botCount: Number.NaN }).botCount).toBe(4);
    expect(savePersist({ botCount: null as unknown as number }).botCount).toBe(4);
  });
});
