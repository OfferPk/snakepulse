import type { Cell, Dir, GameState, Pellet, Snake } from './types';
import { DIR_DELTA, OPPOSITE } from './types';

const DIRS: Dir[] = ['U', 'D', 'L', 'R'];

function cellKey(c: Cell): string {
  return `${c.x},${c.y}`;
}

function occupiedSet(state: GameState, ignoreSnakeId?: string): Set<string> {
  const set = new Set<string>();
  for (const s of state.snakes) {
    if (!s.alive) continue;
    if (ignoreSnakeId && s.id === ignoreSnakeId) {
      // Ignore own tail tip (will vacate) — keep body for self-avoid
      for (let i = 0; i < s.body.length - 1; i++) {
        set.add(cellKey(s.body[i]!));
      }
      continue;
    }
    for (const seg of s.body) set.add(cellKey(seg));
  }
  return set;
}

function inBounds(x: number, y: number, cols: number, rows: number): boolean {
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

function nearestPellet(head: Cell, pellets: Pellet[]): Pellet | null {
  if (pellets.length === 0) return null;
  let best: Pellet | null = null;
  let bestD = Infinity;
  for (const p of pellets) {
    const d = Math.abs(p.x - head.x) + Math.abs(p.y - head.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** Pick a safe direction seeking nearest pellet; avoid walls and bodies. */
export function chooseBotDir(state: GameState, snake: Snake): Dir {
  const head = snake.body[0]!;
  const occ = occupiedSet(state, snake.id);
  const { cols, rows } = state.config;
  const target = nearestPellet(head, state.pellets);

  const scored: { dir: Dir; score: number }[] = [];
  for (const dir of DIRS) {
    if (dir === OPPOSITE[snake.dir]) continue;
    const d = DIR_DELTA[dir];
    const nx = head.x + d.x;
    const ny = head.y + d.y;
    if (!inBounds(nx, ny, cols, rows)) continue;
    if (occ.has(cellKey({ x: nx, y: ny }))) continue;
    let score = 0;
    if (target) {
      const before = Math.abs(target.x - head.x) + Math.abs(target.y - head.y);
      const after = Math.abs(target.x - nx) + Math.abs(target.y - ny);
      score += before - after;
    }
    // Prefer continuing forward slightly
    if (dir === snake.dir) score += 0.25;
    scored.push({ dir, score });
  }

  if (scored.length === 0) {
    // No safe turn — keep current (will die next move if blocked)
    return snake.dir;
  }
  scored.sort((a, b) => b.score - a.score);
  return scored[0]!.dir;
}

/** One AI decision tick for all alive bots (mutates pendingDir). */
export function tickBots(state: GameState): void {
  for (const s of state.snakes) {
    if (!s.alive || s.isPlayer) continue;
    s.pendingDir = chooseBotDir(state, s);
  }
}
