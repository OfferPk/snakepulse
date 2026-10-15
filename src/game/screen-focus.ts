export type Screen = 'home' | 'howto' | 'skins' | 'settings' | 'play';

const FOCUS_TARGETS: Record<Screen, string> = {
  home: '#btn-play',
  howto: '#howto-title',
  skins: '#btn-skins-back',
  settings: '#btn-settings-back',
  play: '#btn-pause',
};

/** Return the element that should receive focus after a screen becomes visible. */
export function screenFocusTarget(screen: Screen): string {
  return FOCUS_TARGETS[screen];
}

/** Return the correct home target after closing automatic or manually opened how-to. */
export function howtoReturnFocusTarget(howtoWasAlreadySeen: boolean): string {
  return howtoWasAlreadySeen ? '#btn-howto' : '#btn-play';
}
