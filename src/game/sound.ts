export type SoundCue = 'eat' | 'pulse' | 'death';

let audioContext: AudioContext | null = null;

const CUES: Record<SoundCue, { start: number; end: number; duration: number; volume: number; type: OscillatorType }> = {
  eat: { start: 620, end: 880, duration: 0.09, volume: 0.075, type: 'sine' },
  pulse: { start: 420, end: 1120, duration: 0.2, volume: 0.09, type: 'triangle' },
  death: { start: 300, end: 90, duration: 0.28, volume: 0.1, type: 'sawtooth' },
};

/** Call from a user gesture (Play or enabling sound) to satisfy browser autoplay rules. */
export function unlockGameAudio(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    audioContext ??= new window.AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume().catch(() => undefined);
  } catch {
    // Audio is a progressive enhancement; gameplay stays fully usable without it.
  }
}

/** Play a tiny synthesized cue without loading or requesting any network asset. */
export function playGameSound(cue: SoundCue, muted: boolean): void {
  if (muted || typeof window === 'undefined' || !window.AudioContext) return;

  try {
    unlockGameAudio();
    if (!audioContext) return;
    const context = audioContext;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);

    const { start, end, duration, volume, type } = CUES[cue];
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  } catch {
    // Audio is a progressive enhancement; gameplay stays fully usable without it.
  }
}
