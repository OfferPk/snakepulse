import type { GameState } from '../game/types';
import { skinById } from '../game/skins';

export function resizeCanvas(canvas: HTMLCanvasElement, cssSize: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  canvas.width = Math.floor(cssSize * dpr);
  canvas.height = Math.floor(cssSize * dpr);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  selectedSkinId: string,
): void {
  const { cols, rows } = state.config;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cell = Math.min(w / cols, h / rows);
  const ox = (w - cell * cols) / 2;
  const oy = (h - cell * rows) / 2;

  ctx.fillStyle = '#070b16';
  ctx.fillRect(0, 0, w, h);

  // Neon grid
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
  ctx.lineWidth = Math.max(1, cell * 0.04);
  ctx.beginPath();
  for (let x = 0; x <= cols; x++) {
    const px = ox + x * cell;
    ctx.moveTo(px, oy);
    ctx.lineTo(px, oy + rows * cell);
  }
  for (let y = 0; y <= rows; y++) {
    const py = oy + y * cell;
    ctx.moveTo(ox, py);
    ctx.lineTo(ox + cols * cell, py);
  }
  ctx.stroke();

  // Arena border pulse
  ctx.strokeStyle = 'rgba(232, 121, 249, 0.55)';
  ctx.lineWidth = Math.max(2, cell * 0.12);
  ctx.strokeRect(ox + 1, oy + 1, cols * cell - 2, rows * cell - 2);

  // Pellets
  for (const p of state.pellets) {
    const cx = ox + (p.x + 0.5) * cell;
    const cy = oy + (p.y + 0.5) * cell;
    const r = cell * (p.kind === 'pulse' ? 0.32 : 0.22);
    ctx.beginPath();
    ctx.fillStyle = p.kind === 'pulse' ? '#fbbf24' : '#22d3ee';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = cell * 0.6;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  const skin = skinById(selectedSkinId);

  for (const snake of state.snakes) {
    if (!snake.alive) continue;
    const headColor = snake.isPlayer ? skin.head : snake.color;
    const bodyColor = snake.isPlayer ? skin.body : dim(snake.color, 0.75);

    for (let i = snake.body.length - 1; i >= 0; i--) {
      const seg = snake.body[i]!;
      const x = ox + seg.x * cell;
      const y = oy + seg.y * cell;
      const pad = cell * 0.08;
      const isHead = i === 0;
      ctx.fillStyle = isHead ? headColor : bodyColor;
      ctx.shadowColor = headColor;
      ctx.shadowBlur = isHead ? cell * 0.5 : cell * 0.2;
      roundRect(ctx, x + pad, y + pad, cell - pad * 2, cell - pad * 2, cell * 0.28);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Head glow ring
    const head = snake.body[0]!;
    const hx = ox + (head.x + 0.5) * cell;
    const hy = oy + (head.y + 0.5) * cell;
    ctx.beginPath();
    ctx.strokeStyle = headColor;
    ctx.lineWidth = Math.max(1, cell * 0.08);
    ctx.globalAlpha = 0.7;
    ctx.arc(hx, hy, cell * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function dim(hex: string, factor: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = Math.round(parseInt(m[1]!, 16) * factor);
  const g = Math.round(parseInt(m[2]!, 16) * factor);
  const b = Math.round(parseInt(m[3]!, 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (w < 1 || h < 1) {
    ctx.beginPath();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
