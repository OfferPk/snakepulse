import type { GamePhase } from './types';

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
