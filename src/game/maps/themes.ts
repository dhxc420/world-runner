import type { MapTheme } from './types';

export const MAP_THEMES: Record<string, MapTheme> = {
  grove: {
    id: 'grove',
    name: 'Bioluminescent Grove',
    void: '#020810',
    auroraA: '#0a2838',
    auroraB: '#1a0838',
    auroraC: '#0d2040',
    grid: '#3dffcc',
    gridDim: 'rgba(61, 255, 204, 0.06)',
    ground: '#0a1a28',
    groundLine: '#3dffcc',
    accent: '#7cffb2',
    wispHue: [150, 190],
    parallax: 'forest',
  },
  grid: {
    id: 'grid',
    name: 'Neon Grid Corridor',
    void: '#020208',
    auroraA: '#0a0a28',
    auroraB: '#120838',
    auroraC: '#081828',
    grid: '#00e5ff',
    gridDim: 'rgba(0, 229, 255, 0.1)',
    ground: '#060818',
    groundLine: '#00e5ff',
    accent: '#00d4ff',
    wispHue: [180, 210],
    parallax: 'grid',
  },
  hangar: {
    id: 'hangar',
    name: 'Marathon Hangar Deck',
    void: '#080a10',
    auroraA: '#101820',
    auroraB: '#181028',
    auroraC: '#0c1420',
    grid: '#44aa66',
    gridDim: 'rgba(68, 170, 102, 0.08)',
    ground: '#0c1018',
    groundLine: '#44aa66',
    accent: '#66cc88',
    wispHue: [100, 140],
    parallax: 'hangar',
  },
};

export function getTheme(id: string): MapTheme {
  return MAP_THEMES[id] ?? MAP_THEMES.grove;
}
