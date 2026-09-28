import './style.css';
import {
  continueRun,
  createGame,
  pauseGame,
  relativeTurn,
  resumeGame,
  setPlayerDir,
  tick,
} from './game/engine';
import { buySkin, loadPersist, recordRun, savePersist, unlockSkin } from './game/persist';
import { SKINS, canUnlock, skinById, skinCardDisplay } from './game/skins';
import type { Dir, GameState } from './game/types';
import {
  purchaseRemoveAds,
  setInterstitialPresenter,
  showInterstitial,
  showRewarded,
} from './ads/stubs';
import { drawFrame, resizeCanvas } from './render/canvas';

type Screen = 'home' | 'howto' | 'skins' | 'settings' | 'play';

const TICK_MS = 55;

let persist = loadPersist();
let state: GameState | null = null;
let raf = 0;
let lastTick = 0;
let running = false;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

function showScreen(name: Screen): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
  if (name === 'home') refreshHome();
  if (name === 'skins') renderSkins();
  if (name === 'settings') refreshSettings();
}

function toast(msg: string): void {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  window.setTimeout(() => {
    el.hidden = true;
  }, 1800);
}

function refreshHome(): void {
  persist = loadPersist();
  $('#home-best').textContent = String(persist.bestScore);
  $('#home-coins').textContent = String(persist.coins);
}

function refreshSettings(): void {
  persist = loadPersist();
  $('#btn-mute').textContent = persist.mute ? '🔇 Sound off' : '🔊 Sound on';
  $('#ads-status').textContent = persist.adsRemoved
    ? 'Ads: removed (stub)'
    : 'Ads: enabled (placeholder)';
}

function refreshHud(): void {
  if (!state) return;
  $('#hud-score').textContent = String(state.score);
  $('#hud-best').textContent = String(Math.max(persist.bestScore, state.score));
  $('#hud-len').textContent = String(state.length);
  $('#btn-mute-play').textContent = persist.mute ? '🔇' : '🔊';
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
    const btn = document.createElement('button');
    btn.type = 'button';
    const classes = ['skin-card'];
    if (persist.selectedSkin === skin.id) classes.push('selected');
    if (!unlocked) classes.push('locked');
    if (display.kind === 'claim') classes.push('claimable');
    if (display.buyAffordable) classes.push('can-buy');
    btn.className = classes.join(' ');

    const metaParts: string[] = [];
    if (display.progressLine) {
      metaParts.push(`<div class="skin-meta-line">${display.progressLine}</div>`);
    }
    if (display.buyLine) {
      metaParts.push(
        `<div class="skin-meta-line skin-buy${display.buyAffordable ? ' buy-affordable' : ''}">${display.buyLine}</div>`,
      );
    }
    if (display.statusLabel) {
      metaParts.push(`<div class="skin-meta-line skin-cta">${display.statusLabel}</div>`);
    }

    btn.innerHTML = `
      <div class="skin-swatch" style="background:linear-gradient(90deg,${skin.head},${skin.body})"></div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-meta">${metaParts.join('')}</div>`;
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

function startLoop(): void {
  stopLoop();
  running = true;
  lastTick = performance.now();
  const loop = (now: number) => {
    if (!running || !state) return;
    let phase = state.phase;
    if (phase === 'playing') {
      while (now - lastTick >= TICK_MS) {
        tick(state);
        lastTick += TICK_MS;
        phase = state.phase;
        if (phase !== 'playing') break;
      }
      refreshHud();
      paint();
      if (phase === 'dead') {
        void onDeath();
        return;
      }
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
  persist = recordRun(state.score, state.coinsEarned);
  // Auto-unlock score skins
  for (const skin of SKINS) {
    if (persist.bestScore >= skin.scoreUnlock && !persist.unlockedSkins.includes(skin.id)) {
      persist = unlockSkin(skin.id);
    }
  }
  await showInterstitial('death');
  $('#dead-meta').textContent = `Score ${state.score} · Length ${state.length} · +${state.coinsEarned} coins`;
  const contBtn = $('#btn-continue') as HTMLButtonElement;
  contBtn.disabled = state.continued;
  contBtn.textContent = state.continued
    ? 'Continue used'
    : 'Watch to continue (stub)';
  $('#overlay-dead').hidden = false;
  paint();
}

function startGame(): void {
  persist = loadPersist();
  const skin = skinById(persist.selectedSkin);
  state = createGame({ botCount: 4 }, skin.head);
  $('#overlay-dead').hidden = true;
  $('#overlay-interstitial').hidden = true;
  $('#overlay-pause').hidden = true;
  showScreen('play');
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
    if (!state || state.phase !== 'playing') return;
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
  $('#btn-howto-ok').addEventListener('click', () => showScreen('home'));
  $('#btn-skins').addEventListener('click', () => showScreen('skins'));
  $('#btn-skins-back').addEventListener('click', () => showScreen('home'));
  $('#btn-settings').addEventListener('click', () => showScreen('settings'));
  $('#btn-settings-back').addEventListener('click', () => showScreen('home'));

  $('#btn-mute').addEventListener('click', () => {
    persist = savePersist({ mute: !loadPersist().mute });
    refreshSettings();
  });
  $('#btn-mute-play').addEventListener('click', () => {
    persist = savePersist({ mute: !loadPersist().mute });
    refreshHud();
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
    $('#overlay-pause').hidden = false;
  });
  $('#btn-resume').addEventListener('click', () => {
    if (!state) return;
    resumeGame(state);
    $('#overlay-pause').hidden = true;
    lastTick = performance.now();
    startLoop();
  });
  $('#btn-pause-home').addEventListener('click', () => {
    stopLoop();
    state = null;
    $('#overlay-pause').hidden = true;
    showScreen('home');
  });

  $('#btn-retry').addEventListener('click', () => startGame());
  $('#btn-dead-home').addEventListener('click', () => {
    state = null;
    $('#overlay-dead').hidden = true;
    showScreen('home');
  });
  $('#btn-continue').addEventListener('click', async () => {
    if (!state || state.continued) return;
    const ok = await showRewarded('continue');
    if (!ok) return;
    if (continueRun(state)) {
      $('#overlay-dead').hidden = true;
      lastTick = performance.now();
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
}

bindInput();
wireUi();
showScreen('home');

if ('serviceWorker' in navigator) {
  // vite-plugin-pwa injects registration in production build
}
