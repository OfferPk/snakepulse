/**
 * Ad / IAP placeholder hooks — no real SDK keys in MVP.
 */
import { loadPersist, savePersist } from '../game/persist';

const log: string[] = [];

/** Optional UI chrome for interstitial (parity with ArrowPath). */
export type InterstitialPresenter = (reason: string) => Promise<void>;

let interstitialPresenter: InterstitialPresenter | null = null;

export function setInterstitialPresenter(
  fn: InterstitialPresenter | null,
): void {
  interstitialPresenter = fn;
}

export function getAdLog(): readonly string[] {
  return log;
}

export function clearAdLog(): void {
  log.length = 0;
}

export function isAdsRemoved(): boolean {
  return loadPersist().adsRemoved === true;
}

export async function showInterstitial(reason: string = 'death'): Promise<boolean> {
  if (isAdsRemoved()) {
    log.push(`interstitial:skipped:${reason}`);
    return false;
  }
  log.push(`interstitial:show:${reason}`);
  if (interstitialPresenter) {
    await interstitialPresenter(reason);
  } else {
    await Promise.resolve();
  }
  log.push(`interstitial:dismissed:${reason}`);
  return true;
}

export async function showRewarded(reason: string = 'continue'): Promise<boolean> {
  if (isAdsRemoved()) {
    log.push(`rewarded:auto-grant:${reason}`);
    return true;
  }
  log.push(`rewarded:show:${reason}`);
  await Promise.resolve();
  log.push(`rewarded:earned:${reason}`);
  return true;
}

export async function purchaseRemoveAds(): Promise<boolean> {
  log.push('iap:remove-ads:stub');
  savePersist({ adsRemoved: true });
  await Promise.resolve();
  return true;
}
