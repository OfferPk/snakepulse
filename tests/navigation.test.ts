import { describe, expect, it } from 'vitest';
import { screenFocusTarget } from '../src/game/screen-focus';

describe('screen keyboard focus targets', () => {
  it('focuses the primary action on home and gameplay controls in play', () => {
    expect(screenFocusTarget('home')).toBe('#btn-play');
    expect(screenFocusTarget('play')).toBe('#btn-pause');
  });

  it('focuses the heading when entering informational screens', () => {
    expect(screenFocusTarget('howto')).toBe('#howto-title');
    expect(screenFocusTarget('skins')).toBe('#skins-title');
    expect(screenFocusTarget('settings')).toBe('#settings-title');
  });
});
