import { chooseBotDir, tickBots } from './bots';
import type {
  Cell,
  Dir,
  GameConfig,
  GameState,
  Pellet,
  Snake,
} from './types';
import { DEFAULT_CONFIG, DIR_DELTA, OPPOSITE } from './types';

function cellKey(c: Cell): string {
  return `${c.x},${c.y}`;
}

function cloneCell(c: Cell): Cell {
  return { x: c.x, y: c.y };
}

export function createSnake(
  id: string,
  start: Cell,
  dir: Dir,
  length: number,
  color: string,
  isPlayer: boolean,
): Snake {
  const body: Cell[] = [];
  const back = OPPOSITE[dir];
  const d = DIR_DELTA[back];
  for (let i = 0; i < length; i++) {
    body.push({ x: start.x + d.x * i, y: start.y + d.y * i });
  }
  return {
    id,
    body,
    dir,
    pendingDir: null,
    alive: true,
    pulseTicks: 0,
    color,
    isPlayer,
  };
}

function allOccupied(state: GameState): Set<string> {
  const set = new Set<string>();
  for (const s of state.snakes) {
    if (!s.alive) continue;
    for (const seg of s.body) set.add(cellKey(seg));
  }
  for (const p of state.pellets) set.add(cellKey(p));
  return set;
}

export function spawnPellet(state: GameState, kind?: Pellet['kind']): Pellet | null {
  const { cols, rows } = state.config;
  const occ = allOccupied(state);
  const free: Cell[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occ.has(cellKey({ x, y }))) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const pick = free[Math.floor(Math.random() * free.length)]!;
  const k =
    kind ??
    (Math.random() < state.config.pulseChance ? 'pulse' : 'normal');
  const pellet: Pellet = { x: pick.x, y: pick.y, kind: k };
  state.pellets.push(pellet);
  return pellet;
}

function fillPellets(state: GameState): void {
  while (state.pellets.length < state.config.maxPellets) {
    if (!spawnPellet(state)) break;
  }
}

const BOT_COLORS = ['#f472b6', '#34d399', '#60a5fa', '#facc15', '#c084fc', '#fb923c'];

export function createGame(
  partial: Partial<GameConfig> = {},
  playerColor = '#22d3ee',
): GameState {
  const config: GameConfig = { ...DEFAULT_CONFIG, ...partial };
  const botCount = Math.min(6, Math.max(3, config.botCount));
  config.botCount = botCount;

  const midX = Math.floor(config.cols / 2);
  const midY = Math.floor(config.rows / 2);
  const player = createSnake('player', { x: midX, y: midY }, 'R', 4, playerColor, true);

  const snakes: Snake[] = [player];
  const corners: { cell: Cell; dir: Dir }[] = [
    { cell: { x: 4, y: 4 }, dir: 'R' },
    { cell: { x: config.cols - 5, y: 4 }, dir: 'L' },
    { cell: { x: 4, y: config.rows - 5 }, dir: 'R' },
    { cell: { x: config.cols - 5, y: config.rows - 5 }, dir: 'L' },
    { cell: { x: midX, y: 3 }, dir: 'D' },
    { cell: { x: midX, y: config.rows - 4 }, dir: 'U' },
  ];

  for (let i = 0; i < botCount; i++) {
    const spot = corners[i % corners.length]!;
    snakes.push(
      createSnake(
        `bot-${i}`,
        cloneCell(spot.cell),
        spot.dir,
        3,
        BOT_COLORS[i % BOT_COLORS.length]!,
        false,
      ),
    );
  }

  const state: GameState = {
    config,
    tick: 0,
    phase: 'playing',
    snakes,
    pellets: [],
    score: 0,
    coinsEarned: 0,
    length: player.body.length,
    continued: false,
  };
  fillPellets(state);
  return state;
}

export function setPlayerDir(state: GameState, dir: Dir): void {
  const p = state.snakes.find((s) => s.isPlayer);
  if (!p || !p.alive || state.phase !== 'playing') return;
  if (dir === OPPOSITE[p.dir]) return;
  p.pendingDir = dir;
}

export function relativeTurn(state: GameState, turn: 'left' | 'right'): void {
  const p = state.snakes.find((s) => s.isPlayer);
  if (!p) return;
  const order: Dir[] = ['U', 'R', 'D', 'L'];
  const idx = order.indexOf(p.pendingDir ?? p.dir);
  const next = turn === 'right' ? order[(idx + 1) % 4]! : order[(idx + 3) % 4]!;
  setPlayerDir(state, next);
}

function shouldMove(snake: Snake, tick: number, moveEvery: number): boolean {
  if (snake.pulseTicks > 0) return true;
  return tick % moveEvery === 0;
}

function headHitsWall(head: Cell, cols: number, rows: number): boolean {
  return head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows;
}

function bodyHit(head: Cell, body: Cell[], ignoreTail: boolean): boolean {
  const end = ignoreTail ? body.length - 1 : body.length;
  for (let i = 0; i < end; i++) {
    const seg = body[i]!;
    if (seg.x === head.x && seg.y === head.y) return true;
  }
  return false;
}

function otherBodyHit(head: Cell, self: Snake, snakes: Snake[]): boolean {
  for (const s of snakes) {
    if (!s.alive || s.id === self.id) continue;
    for (const seg of s.body) {
      if (seg.x === head.x && seg.y === head.y) return true;
    }
  }
  return false;
}

/** Pure collision helpers for tests. */
export function hitsWall(head: Cell, cols: number, rows: number): boolean {
  return headHitsWall(head, cols, rows);
}

export function hitsSelf(head: Cell, body: Cell[], growing: boolean): boolean {
  // When growing, tail stays — check full body; when not, tail vacates
  return bodyHit(head, body, !growing);
}

export function growSnake(snake: Snake, amount = 1): void {
  const tail = snake.body[snake.body.length - 1]!;
  for (let i = 0; i < amount; i++) {
    snake.body.push(cloneCell(tail));
  }
}

function eatAt(state: GameState, head: Cell): Pellet | null {
  const idx = state.pellets.findIndex((p) => p.x === head.x && p.y === head.y);
  if (idx < 0) return null;
  const [pellet] = state.pellets.splice(idx, 1);
  return pellet ?? null;
}

function respawnBot(state: GameState, snake: Snake): void {
  const { cols, rows } = state.config;
  const occ = allOccupied(state);
  // Prefer edges
  const candidates: { cell: Cell; dir: Dir }[] = [
    { cell: { x: 3, y: 3 }, dir: 'R' },
    { cell: { x: cols - 4, y: 3 }, dir: 'L' },
    { cell: { x: 3, y: rows - 4 }, dir: 'R' },
    { cell: { x: cols - 4, y: rows - 4 }, dir: 'L' },
  ];
  for (const c of candidates) {
    if (!occ.has(cellKey(c.cell))) {
      snake.body = [
        cloneCell(c.cell),
        { x: c.cell.x - DIR_DELTA[c.dir].x, y: c.cell.y - DIR_DELTA[c.dir].y },
        {
          x: c.cell.x - DIR_DELTA[c.dir].x * 2,
          y: c.cell.y - DIR_DELTA[c.dir].y * 2,
        },
      ];
      snake.dir = c.dir;
      snake.pendingDir = null;
      snake.alive = true;
      snake.pulseTicks = 0;
      return;
    }
  }
  // Fallback: center-ish empty
  for (let y = 2; y < rows - 2; y++) {
    for (let x = 2; x < cols - 2; x++) {
      if (!occ.has(cellKey({ x, y }))) {
        snake.body = [
          { x, y },
          { x: x - 1, y },
          { x: x - 2, y },
        ];
        snake.dir = 'R';
        snake.pendingDir = null;
        snake.alive = true;
        snake.pulseTicks = 0;
        return;
      }
    }
  }
}

function moveSnake(state: GameState, snake: Snake): void {
  if (!snake.alive) return;

  if (snake.pendingDir && snake.pendingDir !== OPPOSITE[snake.dir]) {
    snake.dir = snake.pendingDir;
  }
  snake.pendingDir = null;

  const d = DIR_DELTA[snake.dir];
  const head = snake.body[0]!;
  const newHead = { x: head.x + d.x, y: head.y + d.y };

  if (headHitsWall(newHead, state.config.cols, state.config.rows)) {
    snake.alive = false;
    return;
  }

  // Peek pellet before grow decision
  const willEat = state.pellets.some((p) => p.x === newHead.x && p.y === newHead.y);

  if (bodyHit(newHead, snake.body, !willEat)) {
    snake.alive = false;
    return;
  }
  if (otherBodyHit(newHead, snake, state.snakes)) {
    snake.alive = false;
    return;
  }

  snake.body.unshift(newHead);
  const eaten = eatAt(state, newHead);
  if (eaten) {
    if (eaten.kind === 'pulse') {
      snake.pulseTicks = state.config.pulseDurationTicks;
      if (snake.isPlayer) {
        state.score += 5;
        state.coinsEarned += 1;
      }
    } else if (snake.isPlayer) {
      state.score += 1;
      if (state.score % 5 === 0) state.coinsEarned += 1;
    }
    // keep extra segment (grew)
  } else {
    snake.body.pop();
  }

  if (snake.pulseTicks > 0) snake.pulseTicks -= 1;
}

/**
 * Advance one simulation tick. Bots decide, then snakes that should move do.
 */
export function tick(state: GameState): GameState {
  if (state.phase !== 'playing') return state;

  state.tick += 1;
  tickBots(state);

  const movers = state.snakes.filter(
    (s) => s.alive && shouldMove(s, state.tick, state.config.moveEvery),
  );
  for (const s of movers) {
    moveSnake(state, s);
  }

  // Respawn dead bots
  for (const s of state.snakes) {
    if (!s.isPlayer && !s.alive) {
      respawnBot(state, s);
    }
  }

  fillPellets(state);

  const player = state.snakes.find((s) => s.isPlayer)!;
  state.length = player.body.length;
  if (!player.alive) {
    state.phase = 'dead';
  }
  return state;
}

/** Revive player after rewarded continue (once per run in MVP). */
export function continueRun(state: GameState): boolean {
  if (state.phase !== 'dead' || state.continued) return false;
  const player = state.snakes.find((s) => s.isPlayer);
  if (!player) return false;

  // Clear collision: shrink to short snake near center if needed
  const { cols, rows } = state.config;
  const occ = new Set<string>();
  for (const s of state.snakes) {
    if (s.isPlayer || !s.alive) continue;
    for (const seg of s.body) occ.add(cellKey(seg));
  }
  let placed = false;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  for (let r = 0; r < Math.max(cols, rows) && !placed; r++) {
    for (let dy = -r; dy <= r && !placed; dy++) {
      for (let dx = -r; dx <= r && !placed; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 2 || y < 2 || x >= cols - 2 || y >= rows - 2) continue;
        if (occ.has(cellKey({ x, y }))) continue;
        player.body = [
          { x, y },
          { x: x - 1, y },
          { x: x - 2, y },
        ];
        player.dir = 'R';
        player.pendingDir = null;
        placed = true;
      }
    }
  }
  if (!placed) {
    player.body = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    player.dir = 'R';
  }
  player.alive = true;
  player.pulseTicks = 0;
  state.phase = 'playing';
  state.continued = true;
  state.length = player.body.length;
  return true;
}

export function pauseGame(state: GameState): void {
  if (state.phase === 'playing') state.phase = 'paused';
}

export function resumeGame(state: GameState): void {
  if (state.phase === 'paused') state.phase = 'playing';
}

/** Test helper: apply bot AI once without full tick. */
export function botDecide(state: GameState, snakeId: string): Dir {
  const snake = state.snakes.find((s) => s.id === snakeId);
  if (!snake) throw new Error('snake not found');
  return chooseBotDir(state, snake);
}

export { chooseBotDir, tickBots };
