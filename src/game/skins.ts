export interface Skin {
  id: string;
  name: string;
  head: string;
  body: string;
  /** Unlock by best score OR coins cost (0 = free starter). */
  scoreUnlock: number;
  coinCost: number;
}

export const SKINS: Skin[] = [
  { id: 'pulse-cyan', name: 'Pulse Cyan', head: '#22d3ee', body: '#0891b2', scoreUnlock: 0, coinCost: 0 },
  { id: 'magenta-ring', name: 'Magenta Ring', head: '#e879f9', body: '#a21caf', scoreUnlock: 50, coinCost: 20 },
  { id: 'lime-spark', name: 'Lime Spark', head: '#a3e635', body: '#4d7c0f', scoreUnlock: 120, coinCost: 40 },
  { id: 'amber-flare', name: 'Amber Flare', head: '#fbbf24', body: '#b45309', scoreUnlock: 250, coinCost: 70 },
  { id: 'violet-wave', name: 'Violet Wave', head: '#a78bfa', body: '#5b21b6', scoreUnlock: 400, coinCost: 100 },
  { id: 'rose-nova', name: 'Rose Nova', head: '#fb7185', body: '#9f1239', scoreUnlock: 600, coinCost: 140 },
  { id: 'white-core', name: 'White Core', head: '#f8fafc', body: '#94a3b8', scoreUnlock: 900, coinCost: 200 },
  { id: 'tri-neon', name: 'Tri Neon', head: '#2dd4bf', body: '#f472b6', scoreUnlock: 1200, coinCost: 280 },
];

export function skinById(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0]!;
}

export function canUnlock(skin: Skin, bestScore: number, coins: number, unlocked: string[]): boolean {
  if (unlocked.includes(skin.id)) return true;
  if (skin.scoreUnlock === 0 && skin.coinCost === 0) return true;
  if (bestScore >= skin.scoreUnlock) return true;
  if (coins >= skin.coinCost && skin.coinCost > 0) return true;
  return false;
}
