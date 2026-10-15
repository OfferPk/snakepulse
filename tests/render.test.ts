import { describe, expect, it } from 'vitest';
import { canvasCssSize, headEyeCenters } from '../src/render/canvas';

describe('responsive canvas sizing', () => {
  it('fits a narrow portrait layout to its available content width', () => {
    expect(canvasCssSize(296, 420)).toBe(296);
  });

  it('shrinks below the old minimum on a short landscape layout', () => {
    expect(canvasCssSize(456, 178)).toBe(178);
  });

  it('caps large displays and uses width when height is not measured', () => {
    expect(canvasCssSize(600, 600)).toBe(420);
    expect(canvasCssSize(296, 0)).toBe(296);
  });
});

describe('snake head eye placement', () => {
  it('keeps both eyes symmetric and places them ahead of the head center', () => {
    const cases = [
      { dir: 'R' as const, forward: { x: 1, y: 0 } },
      { dir: 'L' as const, forward: { x: -1, y: 0 } },
      { dir: 'U' as const, forward: { x: 0, y: -1 } },
      { dir: 'D' as const, forward: { x: 0, y: 1 } },
    ];

    for (const { dir, forward } of cases) {
      const eyes = headEyeCenters(100, 80, 20, dir);
      expect(eyes).toHaveLength(2);
      const average = {
        x: (eyes[0].x + eyes[1].x) / 2,
        y: (eyes[0].y + eyes[1].y) / 2,
      };
      expect(average.x).toBeCloseTo(100 + forward.x * 3.6);
      expect(average.y).toBeCloseTo(80 + forward.y * 3.6);

      const side = { x: -forward.y, y: forward.x };
      expect(Math.abs((eyes[0].x - eyes[1].x) * side.x + (eyes[0].y - eyes[1].y) * side.y))
        .toBeCloseTo(8);
    }
  });
});
