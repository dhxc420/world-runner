import { PALETTE } from './constants';
import type { Particle } from './types';
import { spawnBurst } from './effects';
import type { FloatText } from './floatText';
import { spawnFloatText } from './floatText';

export const RAINBOW_STAR_DURATION = 8;

export interface RainbowStarState {
  timer: number;
  hueShift: number;
}

export function createRainbowStar(): RainbowStarState {
  return { timer: 0, hueShift: 0 };
}

export function activateRainbowStar(
  state: RainbowStarState,
  particles: Particle[],
  floatTexts: FloatText[],
  cx: number,
  cy: number,
) {
  state.timer = RAINBOW_STAR_DURATION;
  state.hueShift = Math.random() * 360;

  const colors = ['#ff0044', '#ff8800', '#ffe566', '#00ff88', '#00d4ff', '#cc00ff'];
  for (const color of colors) {
    spawnBurst(particles, cx, cy, color, 18, { speed: 200, glow: true, size: 5 });
  }
  spawnFloatText(floatTexts, cx, cy - 36, '★ RAINBOW ★', PALETTE.gold, { scale: 1.5, vy: -85 });
}

export function updateRainbowStar(state: RainbowStarState, dt: number) {
  if (state.timer <= 0) return;
  state.timer -= dt;
  state.hueShift += dt * 320;
}

export function isRainbowStarActive(state: RainbowStarState): boolean {
  return state.timer > 0;
}

export function rainbowHue(state: RainbowStarState, offset = 0): number {
  return (state.hueShift + offset) % 360;
}
