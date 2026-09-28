export type Dir = 'U' | 'D' | 'L' | 'R';

export interface Cell {
  x: number;
  y: number;
}

export interface Snake {
  id: string;
  body: Cell[];
  dir: Dir;
  pendingDir: Dir | null;
  alive: boolean;
  /** Remaining ticks of speed pulse (move every tick instead of every other). */
  pulseTicks: number;
  color: string;
  isPlayer: boolean;
}

export type PelletKind = 'normal' | 'pulse';

export interface Pellet {
  x: number;
  y: number;
  kind: PelletKind;
}

export type GamePhase = 'playing' | 'paused' | 'dead';

export interface GameConfig {
  cols: number;
  rows: number;
  botCount: number;
  /** Base ticks between moves for non-pulse snakes. */
  moveEvery: number;
  maxPellets: number;
  pulseChance: number;
  pulseDurationTicks: number;
}

export interface GameState {
  config: GameConfig;
  tick: number;
  phase: GamePhase;
  snakes: Snake[];
  pellets: Pellet[];
  score: number;
  coinsEarned: number;
  length: number;
  continued: boolean;
}

export const DIR_DELTA: Record<Dir, Cell> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Dir, Dir> = {
  U: 'D',
  D: 'U',
  L: 'R',
  R: 'L',
};

export const DEFAULT_CONFIG: GameConfig = {
  cols: 28,
  rows: 28,
  botCount: 4,
  moveEvery: 2,
  maxPellets: 12,
  pulseChance: 0.12,
  pulseDurationTicks: 45,
};
