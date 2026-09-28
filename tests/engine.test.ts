import { describe, expect, it } from 'vitest';
import {
  createGame,
  createSnake,
  growSnake,
  hitsSelf,
  hitsWall,
  setPlayerDir,
  tick,
} from '../src/game/engine';
import type { Cell } from '../src/game/types';

describe('collision', () => {
  it('hitsWall detects hard borders', () => {
    expect(hitsWall({ x: -1, y: 0 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 0, y: -1 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 10, y: 0 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 0, y: 10 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 0, y: 0 }, 10, 10)).toBe(false);
    expect(hitsWall({ x: 9, y: 9 }, 10, 10)).toBe(false);
  });

  it('hitsSelf when head overlaps body', () => {
    const body: Cell[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 3, y: 4 },
    ];
    expect(hitsSelf({ x: 3, y: 5 }, body, false)).toBe(true);
    expect(hitsSelf({ x: 6, y: 5 }, body, false)).toBe(false);
  });

  it('player dies on wall after forced direction', () => {
    const state = createGame({ cols: 12, rows: 12, botCount: 3, moveEvery: 1, maxPellets: 0 });
    // Clear pellets so random eat doesn't interfere
    state.pellets = [];
    const player = state.snakes.find((s) => s.isPlayer)!;
    // Place against left wall heading left
    player.body = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
    ];
    player.dir = 'L';
    player.pendingDir = null;
    // Kill bots so they don't block
    for (const s of state.snakes) {
      if (!s.isPlayer) s.alive = false;
    }
    tick(state);
    expect(player.alive).toBe(false);
    expect(state.phase).toBe('dead');
  });
});

describe('grow', () => {
  it('growSnake appends tail segments', () => {
    const snake = createSnake('t', { x: 5, y: 5 }, 'R', 3, '#fff', true);
    const before = snake.body.length;
    growSnake(snake, 2);
    expect(snake.body.length).toBe(before + 2);
    const tail = snake.body[snake.body.length - 1]!;
    expect(tail).toEqual(snake.body[before - 1]);
  });

  it('eating a pellet increases player length and score', () => {
    const state = createGame({ cols: 16, rows: 16, botCount: 3, moveEvery: 1, maxPellets: 0 });
    state.pellets = [];
    for (const s of state.snakes) {
      if (!s.isPlayer) s.alive = false;
    }
    const player = state.snakes.find((s) => s.isPlayer)!;
    player.body = [
      { x: 4, y: 8 },
      { x: 3, y: 8 },
      { x: 2, y: 8 },
    ];
    player.dir = 'R';
    player.pendingDir = null;
    state.pellets.push({ x: 5, y: 8, kind: 'normal' });
    const lenBefore = player.body.length;
    tick(state);
    expect(player.alive).toBe(true);
    expect(player.body.length).toBe(lenBefore + 1);
    expect(state.score).toBe(1);
    expect(state.length).toBe(player.body.length);
  });
});

describe('controls', () => {
  it('setPlayerDir ignores 180-degree reverse', () => {
    const state = createGame({ botCount: 3, moveEvery: 1 });
    const player = state.snakes.find((s) => s.isPlayer)!;
    player.dir = 'R';
    player.pendingDir = null;
    setPlayerDir(state, 'L');
    expect(player.pendingDir).toBeNull();
    setPlayerDir(state, 'U');
    expect(player.pendingDir).toBe('U');
  });
});
