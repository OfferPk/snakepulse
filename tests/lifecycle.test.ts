import { describe, expect, it } from 'vitest';
import { createGame } from '../src/game/engine';
import { pauseGameWhenHidden } from '../src/game/lifecycle';

describe('background lifecycle', () => {
  it('pauses a running game when the document becomes hidden', () => {
    const state = createGame({ botCount: 3 });
    const initialTick = state.tick;

    expect(pauseGameWhenHidden(state, true)).toBe(true);
    expect(state.phase).toBe('paused');
    expect(state.tick).toBe(initialTick);
  });

  it('does not pause while visible or auto-resume an already paused game', () => {
    const state = createGame({ botCount: 3 });

    expect(pauseGameWhenHidden(state, false)).toBe(false);
    expect(state.phase).toBe('playing');

    state.phase = 'paused';
    expect(pauseGameWhenHidden(state, false)).toBe(false);
    expect(state.phase).toBe('paused');
  });

  it('ignores missing and finished game states', () => {
    expect(pauseGameWhenHidden(null, true)).toBe(false);

    const state = createGame({ botCount: 3 });
    state.phase = 'dead';
    expect(pauseGameWhenHidden(state, true)).toBe(false);
    expect(state.phase).toBe('dead');
  });
});
