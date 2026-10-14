import type { Dir, GamePhase } from './types';

export type PauseShortcutAction = 'pause' | 'resume' | null;

/** Map the pause shortcut to an action only while a run can be paused or resumed. */
export function pauseShortcutAction(
  key: string,
  phase: GamePhase,
  repeat = false,
): PauseShortcutAction {
  if (repeat) return null;
  if (key !== 'Escape' && key.toLowerCase() !== 'p') return null;
  if (phase === 'playing') return 'pause';
  if (phase === 'paused') return 'resume';
  return null;
}

const KEY_DIRECTIONS: Record<string, Dir> = {
  ArrowUp: 'U',
  ArrowDown: 'D',
  ArrowLeft: 'L',
  ArrowRight: 'R',
  w: 'U',
  s: 'D',
  a: 'L',
  d: 'R',
};

/** Map arrow or WASD input to a direction, accepting either WASD letter case. */
export function directionFromKey(key: string): Dir | null {
  return KEY_DIRECTIONS[key] ?? KEY_DIRECTIONS[key.toLowerCase()] ?? null;
}

/** Return the focus index to use when Tab would otherwise leave a modal dialog. */
export function dialogTabTargetIndex(
  activeIndex: number,
  focusableCount: number,
  shiftKey: boolean,
): number | null {
  if (focusableCount <= 0) return null;
  if (shiftKey) return activeIndex <= 0 ? focusableCount - 1 : null;
  return activeIndex < 0 || activeIndex === focusableCount - 1 ? 0 : null;
}
