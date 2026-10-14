export type Screen = 'home' | 'howto' | 'skins' | 'settings' | 'play';

const FOCUS_TARGETS: Record<Screen, string> = {
  home: '#btn-play',
  howto: '#howto-title',
  skins: '#skins-title',
  settings: '#settings-title',
  play: '#btn-pause',
};

/** Return the element that should receive focus after a screen becomes visible. */
export function screenFocusTarget(screen: Screen): string {
  return FOCUS_TARGETS[screen];
}
