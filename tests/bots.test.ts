import { describe, expect, it } from 'vitest';
import { botDecide, createGame, tickBots } from '../src/game/engine';
import { DIR_DELTA, OPPOSITE } from '../src/game/types';

describe('bot tick fixture', () => {
  it('chooseBotDir prefers a safe step toward a pellet', () => {
    const state = createGame({ cols: 20, rows: 20, botCount: 3, maxPellets: 0 });
    // Freeze player
    const player = state.snakes.find((s) => s.isPlayer)!;
    player.alive = false;
    // One bot only for clarity
    const bot = state.snakes.find((s) => s.id === 'bot-0')!;
    for (const s of state.snakes) {
      if (s.id !== 'bot-0') s.alive = false;
    }
    bot.alive = true;
    bot.body = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    bot.dir = 'R';
    bot.pendingDir = null;
    state.pellets = [{ x: 10, y: 5, kind: 'normal' }];

    const dir = botDecide(state, 'bot-0');
    expect(dir).toBe('R');
    const d = DIR_DELTA[dir];
    const nx = bot.body[0]!.x + d.x;
    const ny = bot.body[0]!.y + d.y;
    expect(nx).toBe(6);
    expect(ny).toBe(5);
    expect(dir).not.toBe(OPPOSITE[bot.dir]);
  });

  it('tickBots sets pendingDir without crashing', () => {
    const state = createGame({ botCount: 4, cols: 24, rows: 24 });
    expect(() => tickBots(state)).not.toThrow();
    for (const s of state.snakes) {
      if (!s.isPlayer && s.alive) {
        expect(s.pendingDir === null || ['U', 'D', 'L', 'R'].includes(s.pendingDir)).toBe(true);
      }
    }
  });

  it('bots avoid immediate wall when possible', () => {
    const state = createGame({ cols: 12, rows: 12, botCount: 3, maxPellets: 0 });
    for (const s of state.snakes) s.alive = false;
    const bot = state.snakes.find((s) => s.id === 'bot-0')!;
    bot.alive = true;
    // Head at top edge facing up — must turn
    bot.body = [
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
    ];
    bot.dir = 'U';
    bot.pendingDir = null;
    state.pellets = [{ x: 8, y: 0, kind: 'normal' }];
    const dir = botDecide(state, 'bot-0');
    expect(dir).not.toBe('U');
    expect(['L', 'R', 'D'].includes(dir)).toBe(true);
  });
});
