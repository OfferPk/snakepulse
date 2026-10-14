import { pauseGame } from './engine';
import type { GameState } from './types';

/** Pause an active run when its document becomes hidden; never auto-resume it. */
export function pauseGameWhenHidden(
  state: GameState | null,
  isHidden: boolean,
): boolean {
  if (!state || !isHidden || state.phase !== 'playing') return false;
  pauseGame(state);
  return true;
}
