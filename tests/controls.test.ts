import { describe, expect, it } from 'vitest';
import { pauseShortcutAction } from '../src/game/controls';

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
