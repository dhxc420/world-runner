import type { GameLevel } from './levels';
import type { MapTheme } from './types';

export const MAP_THEMES: Record<string, MapTheme> = {
  grove: {
    id: 'grove',
    name: 'Ciudad Caída',
    void: '#0a0c10',
    auroraA: '#1a1410',
    auroraB: '#201810',
    auroraC: '#141820',
    grid: '#ff6b35',
    gridDim: 'rgba(255, 107, 53, 0.08)',
    ground: '#1a1c22',
    groundLine: '#ff8c42',
    accent: '#ff6b35',
    wispHue: [20, 40],
    parallax: 'ruins',
  },
  grid: {
    id: 'grid',
    name: 'Corredor Grid',
    void: '#060810',
    auroraA: '#0c1020',
    auroraB: '#101028',
    auroraC: '#081018',
    grid: '#00e5ff',
    gridDim: 'rgba(0, 229, 255, 0.1)',
    ground: '#10141c',
    groundLine: '#00e5ff',
    accent: '#00d4ff',
    wispHue: [180, 210],
    parallax: 'ruins_grid',
  },
  hangar: {
    id: 'hangar',
    name: 'Zona de Guerra',
    void: '#080608',
    auroraA: '#181210',
    auroraB: '#201418',
    auroraC: '#101018',
    grid: '#cc5533',
    gridDim: 'rgba(204, 85, 51, 0.1)',
    ground: '#141018',
    groundLine: '#aa4422',
    accent: '#ff6633',
    wispHue: [10, 30],
    parallax: 'warzone',
  },
};

export function getTheme(id: string): MapTheme {
  return MAP_THEMES[id] ?? MAP_THEMES.grove;
}

/** Per-level tint so each map feels distinct even within the same world */
export function getLevelTheme(level: GameLevel, chunkIndex = 0, zoneAccent?: string): MapTheme {
  const base = getTheme(level.themeId);
  const accent = zoneAccent ?? level.accentOverride ?? base.accent;
  const chunkShift = chunkIndex * 6;
  return {
    ...base,
    accent,
    groundLine: accent,
    grid: accent,
    wispHue: [
      base.wispHue[0] + chunkShift,
      base.wispHue[1] + chunkShift,
    ] as [number, number],
  };
}

export function levelVisualSeed(levelId: string): number {
  let h = 0;
  for (let i = 0; i < levelId.length; i += 1) {
    h = (h * 31 + levelId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
