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
