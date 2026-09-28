const PREFIX = 'snakepulse_';

export interface PersistState {
  bestScore: number;
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  adsRemoved: boolean;
  mute: boolean;
}

const DEFAULT: PersistState = {
  bestScore: 0,
  coins: 0,
  unlockedSkins: ['pulse-cyan'],
  selectedSkin: 'pulse-cyan',
  adsRemoved: false,
  mute: false,
};

function read(): PersistState {
  try {
    const raw = localStorage.getItem(PREFIX + 'save');
    if (!raw) return { ...DEFAULT, unlockedSkins: [...DEFAULT.unlockedSkins] };
    const parsed = JSON.parse(raw) as Partial<PersistState>;
    return {
      bestScore: Math.max(0, Number(parsed.bestScore) || 0),
      coins: Math.max(0, Number(parsed.coins) || 0),
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? Array.from(new Set(['pulse-cyan', ...parsed.unlockedSkins.map(String)]))
        : [...DEFAULT.unlockedSkins],
      selectedSkin: typeof parsed.selectedSkin === 'string' ? parsed.selectedSkin : DEFAULT.selectedSkin,
      adsRemoved: Boolean(parsed.adsRemoved),
      mute: Boolean(parsed.mute),
    };
  } catch {
    return { ...DEFAULT, unlockedSkins: [...DEFAULT.unlockedSkins] };
  }
}

function write(state: PersistState): void {
  try {
    localStorage.setItem(PREFIX + 'save', JSON.stringify(state));
  } catch {
    /* quota / private */
  }
}

export function loadPersist(): PersistState {
  return read();
}

export function savePersist(partial: Partial<PersistState>): PersistState {
  const next = { ...read(), ...partial };
  if (partial.unlockedSkins) {
    next.unlockedSkins = Array.from(new Set(['pulse-cyan', ...partial.unlockedSkins]));
  }
  write(next);
  return next;
}

export function recordRun(score: number, coinsEarned: number): PersistState {
  const cur = read();
  const bestScore = Math.max(cur.bestScore, score);
  const coins = cur.coins + Math.max(0, coinsEarned);
  return savePersist({ bestScore, coins });
}

export function unlockSkin(id: string): PersistState {
  const cur = read();
  if (cur.unlockedSkins.includes(id)) return cur;
  return savePersist({ unlockedSkins: [...cur.unlockedSkins, id] });
}

export function buySkin(id: string, cost: number): PersistState | null {
  const cur = read();
  if (cur.unlockedSkins.includes(id)) return cur;
  if (cur.coins < cost) return null;
  return savePersist({
    coins: cur.coins - cost,
    unlockedSkins: [...cur.unlockedSkins, id],
    selectedSkin: id,
  });
}
