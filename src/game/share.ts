/** Pure share-text builder (offline; no network). */
export function buildDeathShareText(
  score: number,
  best: number,
  skinName?: string,
): string {
  const base = `SnakePulse — score ${score} · best ${best}`;
  if (skinName && skinName.trim()) {
    return `${base} · ${skinName.trim()}`;
  }
  return base;
}
