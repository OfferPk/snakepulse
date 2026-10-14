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

/** A user-cancelled native share is not a failure and should not copy instead. */
export function shouldCopyAfterShareError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) return true;
  return (error as { name?: unknown }).name !== 'AbortError';
}
