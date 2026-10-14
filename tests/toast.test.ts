import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToastPresenter } from '../src/game/toast';

describe('toast presenter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the latest message visible for its full duration', () => {
    vi.useFakeTimers();
    const element = { textContent: '', hidden: true };
    const presentToast = createToastPresenter(element, 1800);

    presentToast('First message');
    vi.advanceTimersByTime(1200);
    presentToast('Latest message');
    vi.advanceTimersByTime(600);

    expect(element.textContent).toBe('Latest message');
    expect(element.hidden).toBe(false);

    vi.advanceTimersByTime(1200);
    expect(element.hidden).toBe(true);
  });
});
