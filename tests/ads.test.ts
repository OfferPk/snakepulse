import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAdLog,
  getAdLog,
  isAdsRemoved,
  purchaseRemoveAds,
  setInterstitialPresenter,
  showInterstitial,
  showRewarded,
} from '../src/ads/stubs';

describe('ads stubs', () => {
  beforeEach(() => {
    clearAdLog();
    setInterstitialPresenter(null);
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
  });

  afterEach(() => {
    setInterstitialPresenter(null);
  });

  it('showInterstitial logs show + dismissed when ads enabled (no presenter)', async () => {
    expect(isAdsRemoved()).toBe(false);
    await showInterstitial('death');
    expect(getAdLog().some((l) => l.includes('interstitial:show:death'))).toBe(true);
    expect(getAdLog().some((l) => l.includes('interstitial:dismissed:death'))).toBe(
      true,
    );
  });

  it('showInterstitial awaits presenter chrome when set', async () => {
    let presented = false;
    setInterstitialPresenter(async (reason) => {
      expect(reason).toBe('death');
      presented = true;
    });
    const ok = await showInterstitial('death');
    expect(ok).toBe(true);
    expect(presented).toBe(true);
    expect(getAdLog().some((l) => l.includes('interstitial:show:death'))).toBe(true);
    expect(getAdLog().some((l) => l.includes('interstitial:dismissed:death'))).toBe(
      true,
    );
  });

  it('purchaseRemoveAds sets flag and skips interstitial UI/presenter', async () => {
    let presented = false;
    setInterstitialPresenter(async () => {
      presented = true;
    });
    await purchaseRemoveAds();
    expect(isAdsRemoved()).toBe(true);
    await showInterstitial('death');
    expect(getAdLog().some((l) => l.includes('interstitial:skipped'))).toBe(true);
    expect(presented).toBe(false);
  });

  it('showRewarded resolves true', async () => {
    const ok = await showRewarded('continue');
    expect(ok).toBe(true);
  });
});
