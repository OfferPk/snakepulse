import { describe, expect, it } from 'vitest';
import { screenFocusTarget } from '../src/game/screen-focus';

describe('screen keyboard focus targets', () => {
  it('focuses the primary action on home and gameplay controls in play', () => {
    expect(screenFocusTarget('home')).toBe('#btn-play');
    expect(screenFocusTarget('play')).toBe('#btn-pause');
  });

  it('focuses screen context or the first navigation action on entry', () => {
    expect(screenFocusTarget('howto')).toBe('#howto-title');
    expect(screenFocusTarget('skins')).toBe('#btn-skins-back');
    expect(screenFocusTarget('settings')).toBe('#btn-settings-back');
  });
});
