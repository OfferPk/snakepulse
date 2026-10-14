import './style.css';
import { createToastPresenter } from './game/toast';
import {
  continueRun,
  createGame,
  pauseGame,
  relativeTurn,
  resumeGame,
  setPlayerDir,
  tick,
} from './game/engine';
import { pauseGameWhenHidden } from './game/lifecycle';
import { dialogTabTargetIndex, pauseShortcutAction } from './game/controls';
import { screenFocusTarget, type Screen } from './game/screen-focus';
import {
  buySkin,
  isHowtoSeen,
  loadPersist,
  markHowtoSeen,
  recordRun,
  savePersist,
  unlockSkin,
} from './game/persist';
import { buildDeathShareText, shouldCopyAfterShareError } from './game/share';
import { SKINS, canUnlock, skinById, skinCardDisplay, skinScoreProgress } from './game/skins';
import type { Dir, GameState } from './game/types';
import {
  purchaseRemoveAds,
  setInterstitialPresenter,
  showInterstitial,
  showRewarded,
} from './ads/stubs';
import { drawFrame, resizeCanvas } from './render/canvas';
import { playGameSound, unlockGameAudio } from './game/sound';
import type { SoundCue } from './game/sound';

const TICK_MS = 55;
const ARENA_PRESSURE_SUMMARY: Record<number, string> = {
  3: 'Relaxed · 3 bots',
  4: 'Classic · 4 bots',
  5: 'Busy · 5 bots',
  6: 'Packed · 6 bots',
};

let persist = loadPersist();
let state: GameState | null = null;
let raf = 0;
let lastTick = 0;
let running = false;
let lastAnnouncedScore: number | null = null;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const presentToast = createToastPresenter($('#toast'));

function showScreen(
  name: Screen,
  shouldFocus = true,
  focusTarget = screenFocusTarget(name),
): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
  if (name === 'home') refreshHome();
  if (name === 'skins') renderSkins();
  if (name === 'settings') refreshSettings();
  if (shouldFocus) $(focusTarget).focus();
}

function toast(msg: string): void {
  presentToast(msg);
}

function legacyCopy(text: string): boolean {
  let copied = false;
  let ta: HTMLTextAreaElement | null = null;
  try {
    ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    ta?.remove();
  }
  return copied;
}

function copyShare(text: string): void {
  const fallbackCopy = () => {
    toast(legacyCopy(text) ? 'Copied share text' : 'Could not copy share text');
  };
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text).then(() => toast('Copied share text')).catch(fallbackCopy);
    return;
  }
  fallbackCopy();
}

function shareDeath(): void {
  if (!state) return;
  const skin = skinById(persist.selectedSkin);
  const best = Math.max(persist.bestScore, state.score);
  const text = buildDeathShareText(state.score, best, skin.name);
  if (navigator.share) {
    void navigator.share({ title: 'SnakePulse', text }).catch((error: unknown) => {
      if (shouldCopyAfterShareError(error)) copyShare(text);
    });
    return;
  }
  copyShare(text);
}

function refreshHome(): void {
  persist = loadPersist();
  $('#home-best').textContent = String(persist.bestScore);
  $('#home-coins').textContent = String(persist.coins);
}

function refreshSettings(): void {
  persist = loadPersist();
  $('#btn-mute').textContent = persist.mute ? '🔇 Sound off' : '🔊 Sound on';
  $('#btn-mute').setAttribute('aria-pressed', String(!persist.mute));
  ($('#bot-count') as HTMLSelectElement).value = String(persist.botCount);
  $('#bot-count-summary').textContent = ARENA_PRESSURE_SUMMARY[persist.botCount] ?? ARENA_PRESSURE_SUMMARY[4]!;
  document.querySelectorAll<HTMLElement>('#bot-pressure-meter span').forEach((segment, index) => {
    segment.classList.toggle('active', index < persist.botCount - 2);
  });
  $('#ads-status').textContent = persist.adsRemoved
    ? 'Ads: removed (stub)'
    : 'Ads: enabled (placeholder)';
}

function refreshHud(): void {
  if (!state) return;
  const score = String(state.score);
  const scoreElement = $('#hud-score');
  if (scoreElement.textContent !== score) scoreElement.textContent = score;
  if (lastAnnouncedScore !== state.score) {
    $('#game-announcer').textContent =
      lastAnnouncedScore === null
        ? `Game started. Score ${state.score}.`
        : `Score ${state.score}.`;
    lastAnnouncedScore = state.score;
  }
  $('#hud-best').textContent = String(Math.max(persist.bestScore, state.score));
  $('#hud-len').textContent = String(state.length);
  $('#btn-mute-play').textContent = persist.mute ? '🔇' : '🔊';
  $('#btn-mute-play').setAttribute('aria-pressed', String(!persist.mute));
}

function renderSkins(): void {
  persist = loadPersist();
  $('#skins-coins').textContent = String(persist.coins);
  $('#skins-best').textContent = String(persist.bestScore);
  const grid = $('#skin-grid');
  grid.innerHTML = '';
  for (const skin of SKINS) {
    const unlocked = persist.unlockedSkins.includes(skin.id);
    const eligible = canUnlock(skin, persist.bestScore, persist.coins, persist.unlockedSkins);
    const display = skinCardDisplay(
      skin,
      persist.bestScore,
      persist.coins,
      persist.unlockedSkins,
      persist.selectedSkin,
    );
    const scoreProgress = skinScoreProgress(skin, persist.bestScore);
    const progressMarkup = display.progressLine && scoreProgress !== null
      ? `<div class="skin-progress" role="progressbar" aria-label="${skin.name} score unlock progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${scoreProgress}"><span class="skin-progress-fill" style="width:${scoreProgress}%"></span></div>`
      : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    const classes = ['skin-card'];
    if (persist.selectedSkin === skin.id) classes.push('selected');
    if (!unlocked) classes.push('locked');
    if (display.kind === 'claim') classes.push('claimable');
    if (display.buyAffordable) classes.push('can-buy');
    btn.className = classes.join(' ');
    btn.setAttribute('aria-pressed', String(persist.selectedSkin === skin.id));

    const metaParts: string[] = [];
    if (display.progressLine) {
      metaParts.push(`<div class="skin-meta-line">${display.progressLine}</div>`);
    }
    if (display.buyLine) {
      metaParts.push(
        `<div class="skin-meta-line skin-buy${display.buyAffordable ? ' buy-affordable' : ''}">${display.buyLine}</div>`,
      );
    }
    btn.innerHTML = `
      <div class="skin-card-heading">
        <div class="skin-swatch" aria-hidden="true" style="background:linear-gradient(90deg,${skin.head},${skin.body})"></div>
        <span class="skin-status skin-status-${display.kind}">${display.statusLabel || 'Locked'}</span>
      </div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-meta">${metaParts.join('')}${progressMarkup}</div>`;
    btn.addEventListener('click', () => {
      persist = loadPersist();
      if (persist.unlockedSkins.includes(skin.id)) {
        persist = savePersist({ selectedSkin: skin.id });
        toast(`Equipped ${skin.name}`);
        renderSkins();
        return;
      }
      if (persist.bestScore >= skin.scoreUnlock && skin.scoreUnlock > 0) {
        persist = unlockSkin(skin.id);
        persist = savePersist({ selectedSkin: skin.id });
        toast(`Claimed ${skin.name}`);
        renderSkins();
        return;
      }
      if (eligible && skin.coinCost > 0) {
        const next = buySkin(skin.id, skin.coinCost);
        if (!next) {
          toast('Not enough coins');
          return;
        }
        persist = next;
        toast(`Bought ${skin.name}`);
        renderSkins();
        return;
      }
      toast(`Need score ${skin.scoreUnlock} or ${skin.coinCost} coins`);
    });
    grid.appendChild(btn);
  }
}

function layoutCanvas(): void {
  const canvas = $('#arena') as HTMLCanvasElement;
  const wrap = canvas.parentElement!;
  const size = Math.min(wrap.clientWidth, wrap.clientHeight || wrap.clientWidth, 420);
  resizeCanvas(canvas, Math.max(240, size));
}

function paint(): void {
  if (!state) return;
  const canvas = $('#arena') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawFrame(ctx, state, persist.selectedSkin);
}

function stopLoop(): void {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function trapOverlayTab(event: KeyboardEvent): void {
  const overlay = document.querySelector<HTMLElement>('.overlay:not([hidden])');
  if (!overlay) return;
  const focusable = Array.from(
    overlay.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
  if (focusable.length === 0) {
    event.preventDefault();
    overlay.focus();
    return;
  }
  const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const targetIndex = dialogTabTargetIndex(activeIndex, focusable.length, event.shiftKey);
  if (targetIndex === null) return;
  event.preventDefault();
  focusable[targetIndex].focus();
}

function startLoop(): void {
  stopLoop();
  running = true;
  lastTick = performance.now();
  const loop = (now: number) => {
    if (!running || !state) return;
    let phase = state.phase;
    if (phase === 'playing') {
      let soundCue: SoundCue | null = null;
      while (now - lastTick >= TICK_MS) {
        const previousScore = state.score;
        tick(state);
        if (state.phase === 'dead') soundCue = 'death';
        else if (state.score > previousScore) {
          soundCue = state.score - previousScore >= 5 ? 'pulse' : 'eat';
        }
        lastTick += TICK_MS;
        phase = state.phase;
        if (phase !== 'playing') break;
      }
      refreshHud();
      paint();
      if (phase === 'dead') {
        if (soundCue) playGameSound(soundCue, persist.mute);
        void onDeath();
        return;
      }
      if (soundCue) playGameSound(soundCue, persist.mute);
    } else {
      paint();
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

async function onDeath(): Promise<void> {
  stopLoop();
  if (!state) return;
  persist = loadPersist();
  const previousBest = persist.bestScore;
  persist = recordRun(state.score, state.coinsEarned);
  // Auto-unlock score skins
  for (const skin of SKINS) {
    if (persist.bestScore >= skin.scoreUnlock && !persist.unlockedSkins.includes(skin.id)) {
      persist = unlockSkin(skin.id);
    }
  }
  await showInterstitial('death');
  $('#dead-record').hidden = state.score <= previousBest;
  $('#dead-score').textContent = String(state.score);
  $('#dead-best').textContent = String(persist.bestScore);
  $('#dead-length').textContent = String(state.length);
  $('#dead-coins').textContent = `+${state.coinsEarned}`;
  const contBtn = $('#btn-continue') as HTMLButtonElement;
  contBtn.disabled = state.continued;
  contBtn.textContent = state.continued
    ? 'Continue used'
    : 'Watch to continue (stub)';
  $('#overlay-dead').hidden = false;
  $('#btn-retry').focus();
  paint();
}

function startGame(): void {
  persist = loadPersist();
  if (!persist.mute) unlockGameAudio();
  const skin = skinById(persist.selectedSkin);
  state = createGame({ botCount: persist.botCount }, skin.head);
  $('#overlay-dead').hidden = true;
  $('#overlay-interstitial').hidden = true;
  $('#overlay-pause').hidden = true;
  $('#game-announcer').textContent = '';
  lastAnnouncedScore = null;
  showScreen('play');
  $('#btn-pause').focus();
  layoutCanvas();
  refreshHud();
  paint();
  startLoop();
}

function bindInput(): void {
  const canvas = $('#arena') as HTMLCanvasElement;
  let sx = 0;
  let sy = 0;
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      sx = e.clientX;
      sy = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    },
    { passive: true },
  );
  canvas.addEventListener('pointerup', (e) => {
    if (!state || state.phase !== 'playing') return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    let dir: Dir;
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'R' : 'L';
    else dir = dy > 0 ? 'D' : 'U';
    setPlayerDir(state, dir);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      trapOverlayTab(e);
      return;
    }
    if (!state) return;
    const pauseAction = pauseShortcutAction(e.key, state.phase, e.repeat);
    if (pauseAction === 'pause') {
      e.preventDefault();
      pauseGame(state);
      stopLoop();
      $('#overlay-pause').hidden = false;
      $('#btn-resume').focus();
      return;
    }
    if (pauseAction === 'resume') {
      e.preventDefault();
      resumeGame(state);
      $('#overlay-pause').hidden = true;
      lastTick = performance.now();
      $('#btn-pause').focus();
      startLoop();
      return;
    }
    if (state.phase !== 'playing') return;
    const map: Record<string, Dir> = {
      ArrowUp: 'U',
      ArrowDown: 'D',
      ArrowLeft: 'L',
      ArrowRight: 'R',
      w: 'U',
      s: 'D',
      a: 'L',
      d: 'R',
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      setPlayerDir(state, dir);
    }
  });

  $('#btn-turn-left').addEventListener('click', () => {
    if (state) relativeTurn(state, 'left');
  });
  $('#btn-turn-right').addEventListener('click', () => {
    if (state) relativeTurn(state, 'right');
  });
}

function wireUi(): void {
  setInterstitialPresenter(async (reason) => {
    const reasonEl = $('#interstitial-reason');
    reasonEl.textContent =
      reason === 'death'
        ? 'Ad placeholder (stub) — after death.'
        : 'Ad placeholder (stub) — no real network ad.';
    const overlay = $('#overlay-interstitial');
    overlay.hidden = false;
    await new Promise<void>((resolve) => {
      const cont = $('#btn-interstitial-continue');
      cont.focus();
      const done = () => {
        cont.removeEventListener('click', done);
        overlay.hidden = true;
        resolve();
      };
      cont.addEventListener('click', done);
    });
  });

  $('#btn-play').addEventListener('click', () => startGame());
  $('#btn-howto').addEventListener('click', () => showScreen('howto'));
  $('#btn-howto-ok').addEventListener('click', () => {
    markHowtoSeen();
    showScreen('home', true, '#btn-howto');
  });
  $('#btn-skins').addEventListener('click', () => showScreen('skins'));
  $('#btn-skins-back').addEventListener('click', () => showScreen('home', true, '#btn-skins'));
  $('#btn-settings').addEventListener('click', () => showScreen('settings'));
  $('#btn-settings-back').addEventListener('click', () => showScreen('home', true, '#btn-settings'));

  $('#btn-mute').addEventListener('click', () => {
    persist = savePersist({ mute: !loadPersist().mute });
    if (!persist.mute) unlockGameAudio();
    refreshSettings();
  });
  $('#btn-mute-play').addEventListener('click', () => {
    persist = savePersist({ mute: !loadPersist().mute });
    if (!persist.mute) unlockGameAudio();
    refreshHud();
  });
  $('#bot-count').addEventListener('change', (event) => {
    const botCount = Number((event.currentTarget as HTMLSelectElement).value);
    persist = savePersist({ botCount });
    refreshSettings();
    toast(`Arena set to ${persist.botCount} bots`);
  });
  $('#btn-remove-ads').addEventListener('click', async () => {
    await purchaseRemoveAds();
    persist = loadPersist();
    refreshSettings();
    toast('Remove-ads stub applied');
  });

  $('#btn-menu').addEventListener('click', () => {
    stopLoop();
    state = null;
    showScreen('home');
  });
  $('#btn-pause').addEventListener('click', () => {
    if (!state || state.phase !== 'playing') return;
    pauseGame(state);
    stopLoop();
    $('#overlay-pause').hidden = false;
    $('#btn-resume').focus();
  });
  $('#btn-resume').addEventListener('click', () => {
    if (!state) return;
    resumeGame(state);
    $('#overlay-pause').hidden = true;
    lastTick = performance.now();
    $('#btn-pause').focus();
    startLoop();
  });
  $('#btn-pause-home').addEventListener('click', () => {
    stopLoop();
    state = null;
    $('#overlay-pause').hidden = true;
    showScreen('home');
    $('#btn-play').focus();
  });

  $('#btn-retry').addEventListener('click', () => startGame());
  $('#btn-share').addEventListener('click', () => shareDeath());
  $('#btn-dead-home').addEventListener('click', () => {
    state = null;
    $('#overlay-dead').hidden = true;
    showScreen('home');
    $('#btn-play').focus();
  });
  $('#btn-continue').addEventListener('click', async () => {
    if (!state || state.continued) return;
    const ok = await showRewarded('continue');
    if (!ok) return;
    if (continueRun(state)) {
      $('#overlay-dead').hidden = true;
      lastTick = performance.now();
      $('#btn-pause').focus();
      startLoop();
      toast('Continued (stub reward)');
    }
  });

  const a2hs = $('#a2hs');
  const dismissed = sessionStorage.getItem('snakepulse_a2hs') === '1';
  if (!dismissed && !window.matchMedia('(display-mode: standalone)').matches) {
    a2hs.hidden = false;
  }
  $('#a2hs-ok').addEventListener('click', () => {
    a2hs.hidden = true;
    sessionStorage.setItem('snakepulse_a2hs', '1');
  });

  window.addEventListener('resize', () => {
    if (state) {
      layoutCanvas();
      paint();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!pauseGameWhenHidden(state, document.hidden)) return;
    stopLoop();
    $('#overlay-pause').hidden = false;
    $('#btn-resume').focus();
  });
}

bindInput();
wireUi();
if (!isHowtoSeen()) {
  showScreen('howto');
} else {
  showScreen('home', false);
}

if ('serviceWorker' in navigator) {
  // vite-plugin-pwa injects registration in production build
}
