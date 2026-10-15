import { afterEach, describe, expect, it, vi } from 'vitest';
import { playGameSound, unlockGameAudio } from '../src/game/sound';

const frequencies: number[] = [];

class FakeParam {
  setValueAtTime(value: number): void {
    frequencies.push(value);
  }
  exponentialRampToValueAtTime(): void {}
}

class FakeAudioContext {
  static instances = 0;
  currentTime = 0;
  destination = {};
  state = 'running';
  constructor() {
    FakeAudioContext.instances += 1;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: new FakeParam(),
      connect() {},
      start() {},
      stop() {},
    };
  }
  createGain() {
    return { gain: new FakeParam(), connect() {} };
  }
  resume(): Promise<void> {
    return Promise.resolve();
  }
}

describe('local sound effects', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    frequencies.length = 0;
    FakeAudioContext.instances = 0;
  });

  it('does not create audio while muted, and maps each cue to its own pitch', () => {
    vi.stubGlobal('window', { AudioContext: FakeAudioContext });

    playGameSound('eat', true);
    expect(FakeAudioContext.instances).toBe(0);

    unlockGameAudio();
    playGameSound('eat', false);
    playGameSound('pulse', false);
    playGameSound('death', false);

    expect(FakeAudioContext.instances).toBe(1);
    expect(frequencies).toContain(620);
    expect(frequencies).toContain(420);
    expect(frequencies).toContain(300);
  });

  it('silently skips audio when the browser has no AudioContext', () => {
    vi.stubGlobal('window', {});
    expect(() => unlockGameAudio()).not.toThrow();
    expect(() => playGameSound('death', false)).not.toThrow();
  });
});
