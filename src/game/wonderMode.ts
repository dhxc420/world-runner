import { PALETTE } from './constants';
import type { Particle } from './types';
import { spawnBurst } from './effects';
import type { FloatText } from './floatText';
import { spawnFloatText } from './floatText';

export type WonderVariant = 'rainbow' | 'float' | 'glow';

export interface WonderModeState {
  timer: number;
  variant: WonderVariant;
  hueShift: number;
}

export const WONDER_DURATION = 7;

const VARIANTS: WonderVariant[] = ['rainbow', 'float', 'glow'];

export function createWonderMode(): WonderModeState {
  return { timer: 0, variant: 'rainbow', hueShift: 0 };
}

export function activateWonderMode(
  state: WonderModeState,
  particles: Particle[],
  floatTexts: FloatText[],
  cx: number,
  cy: number,
  variant?: WonderVariant,
): WonderVariant {
  state.timer = WONDER_DURATION;
  state.variant = variant ?? VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  state.hueShift = Math.random() * 360;

  const colors = [PALETTE.magenta, PALETTE.gold, PALETTE.cyan, PALETTE.violet, '#ff6bcb'];
  for (const color of colors) {
    spawnBurst(particles, cx, cy, color, 14, { speed: 140, glow: true, size: 4 });
  }
  spawnFloatText(floatTexts, cx, cy - 30, '✦ WONDER ✦', PALETTE.gold, { scale: 1.35, vy: -70 });
  return state.variant;
}

export function updateWonderMode(state: WonderModeState, dt: number) {
  if (state.timer <= 0) return;
  state.timer -= dt;
  state.hueShift += dt * 90;
}

export function isWonderActive(state: WonderModeState): boolean {
  return state.timer > 0;
}

export function wonderHue(state: WonderModeState, baseHue: number): number {
  return (baseHue + state.hueShift) % 360;
}
