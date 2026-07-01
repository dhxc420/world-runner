import type { LevelMechanicId } from './levelMechanics';
import { estimateMechanicAvgSpeed } from './levelMechanics';
import { getChunk } from './chunks';

export type LevelDifficulty = 'easy' | 'normal' | 'hard';

export interface GameLevel {
  id: string;
  number: string;
  name: string;
  world: number;
  difficulty: LevelDifficulty;
  themeId: 'grove' | 'grid' | 'hangar';
  mechanic: LevelMechanicId;
  chunks: string[];
  speedMultiplier: number;
  mapPosition: { x: number; y: number };
  unlockAfter: string | null;
  /** @deprecated unlock uses completion; kept for star hints */
  minScoreToUnlock: number;
  starScore: number;
  starOrbs: number;
  blurb: string;
  accentOverride?: string;
}

export const WORLD_LEVELS: GameLevel[] = [
  {
    id: '1-1',
    number: '1-1',
    name: 'Flor Wonder',
    world: 1,
    difficulty: 'easy',
    themeId: 'grove',
    mechanic: 'ori_first_light',
    chunks: ['lvl_1_1_intro', 'lvl_1_1_dawn', 'lvl_1_1_path', 'lvl_1_1_payoff', 'lvl_1_1_finish'],
    speedMultiplier: 1.18,
    mapPosition: { x: 10, y: 72 },
    unlockAfter: null,
    minScoreToUnlock: 0,
    starScore: 400,
    starOrbs: 14,
    blurb: 'Wonder Mario: cadena de monedas, salto alto y tu primer bot en el clímax. ¡Pulsa A!',
    accentOverride: '#ff4d6d',
  },
  {
    id: '1-2',
    number: '1-2',
    name: 'Escombros Azules',
    world: 1,
    difficulty: 'easy',
    themeId: 'grove',
    mechanic: 'ori_spirit_dive',
    chunks: ['lvl_1_2_intro', 'lvl_1_2_whisper', 'lvl_1_2_tunnel', 'lvl_1_2_payoff', 'lvl_1_2_finish'],
    speedMultiplier: 1.08,
    mapPosition: { x: 26, y: 58 },
    unlockAfter: '1-1',
    minScoreToUnlock: 300,
    starScore: 500,
    starOrbs: 6,
    blurb: 'Túneles bajo los edificios caídos. Agáchate entre vigas rotas.',
    accentOverride: '#5eb3ff',
  },
  {
    id: '1-3',
    number: '1-3',
    name: 'Ceniza RGB',
    world: 1,
    difficulty: 'easy',
    themeId: 'grove',
    mechanic: 'wonder_rainbow',
    chunks: ['lvl_1_3_intro', 'lvl_1_3_flower', 'lvl_1_3_gate', 'lvl_1_3_payoff', 'lvl_1_3_finish'],
    speedMultiplier: 1.12,
    mapPosition: { x: 44, y: 46 },
    unlockAfter: '1-2',
    minScoreToUnlock: 500,
    starScore: 700,
    starOrbs: 7,
    blurb: 'Una flor resiste en la ceniza. La estrella Rainbow despierta el vuelo.',
    accentOverride: '#ff66cc',
  },
  {
    id: '2-1',
    number: '2-1',
    name: 'Grid Entre Ruinas',
    world: 2,
    difficulty: 'normal',
    themeId: 'grid',
    mechanic: 'grid_pulse',
    chunks: ['lvl_2_1_intro', 'lvl_2_1_pulse_a', 'lvl_2_1_pulse_b', 'lvl_2_1_payoff', 'lvl_2_1_finish'],
    speedMultiplier: 1.06,
    mapPosition: { x: 58, y: 66 },
    unlockAfter: '1-3',
    minScoreToUnlock: 800,
    starScore: 900,
    starOrbs: 12,
    blurb: 'El Matrix invade las calles. Pulso neón entre torres derruidas.',
    accentOverride: '#00f0ff',
  },
  {
    id: '2-2',
    number: '2-2',
    name: 'Convoy de Hierro',
    world: 2,
    difficulty: 'normal',
    themeId: 'grid',
    mechanic: 'convoy_alley',
    chunks: ['lvl_2_2_intro', 'lvl_2_2_convoy_a', 'lvl_2_2_convoy_b', 'lvl_2_2_payoff', 'lvl_2_2_finish'],
    speedMultiplier: 1.12,
    mapPosition: { x: 72, y: 52 },
    unlockAfter: '2-1',
    minScoreToUnlock: 1200,
    starScore: 1100,
    starOrbs: 5,
    blurb: 'Máquinas de guerra patrullan el corredor. Salta el convoy blindado.',
    accentOverride: '#ff4455',
  },
  {
    id: '2-3',
    number: '2-3',
    name: 'Puente de Luz',
    world: 2,
    difficulty: 'normal',
    themeId: 'grid',
    mechanic: 'star_bridge',
    chunks: ['lvl_2_3_intro', 'lvl_2_3_bridge_a', 'lvl_2_3_bridge_b', 'lvl_2_3_payoff', 'lvl_2_3_finish'],
    speedMultiplier: 1.18,
    mapPosition: { x: 86, y: 36 },
    unlockAfter: '2-2',
    minScoreToUnlock: 1500,
    starScore: 1300,
    starOrbs: 7,
    blurb: 'Solo la luz sostiene el puente sobre el abismo digital.',
    accentOverride: '#a78bfa',
  },
  {
    id: '3-1',
    number: '3-1',
    name: 'Hangar M-7',
    world: 3,
    difficulty: 'hard',
    themeId: 'hangar',
    mechanic: 'hangar_dawn',
    chunks: ['lvl_3_1_intro', 'lvl_3_1_strike_a', 'lvl_3_1_strike_b', 'lvl_3_1_payoff', 'lvl_3_1_finish'],
    speedMultiplier: 1.22,
    mapPosition: { x: 18, y: 28 },
    unlockAfter: '2-3',
    minScoreToUnlock: 2000,
    starScore: 1500,
    starOrbs: 7,
    blurb: 'Base industrial de la guerra. Bombarderos surcan el humo.',
    accentOverride: '#ff7722',
  },
  {
    id: '3-2',
    number: '3-2',
    name: 'Corredor Láser',
    world: 3,
    difficulty: 'hard',
    themeId: 'hangar',
    mechanic: 'laser_waltz',
    chunks: ['lvl_3_2_intro', 'lvl_3_2_laser_a', 'lvl_3_2_laser_b', 'lvl_3_2_payoff', 'lvl_3_2_finish'],
    speedMultiplier: 1.28,
    mapPosition: { x: 42, y: 18 },
    unlockAfter: '3-1',
    minScoreToUnlock: 2800,
    starScore: 1800,
    starOrbs: 6,
    blurb: 'Defensas automáticas en el hangar. Láseres en ritmo mortal.',
    accentOverride: '#ff2266',
  },
  {
    id: '3-3',
    number: '3-3',
    name: 'Omega Salvación',
    world: 3,
    difficulty: 'hard',
    themeId: 'hangar',
    mechanic: 'omega_siege',
    chunks: ['lvl_3_3_intro', 'lvl_3_3_wave1', 'lvl_3_3_wave2', 'lvl_3_3_boss', 'lvl_3_3_finish'],
    speedMultiplier: 1.35,
    mapPosition: { x: 68, y: 12 },
    unlockAfter: '3-2',
    minScoreToUnlock: 3500,
    starScore: 2200,
    starOrbs: 2,
    blurb: 'El núcleo del Grid. La mariposa contra el asedio final.',
    accentOverride: '#ffd54a',
  },
];

export function getLevel(id: string): GameLevel | undefined {
  return WORLD_LEVELS.find((l) => l.id === id);
}

export function getLevelPlaylistId(levelId: string): string {
  return `level_${levelId.replace('-', '_')}`;
}

/** Rough run length estimate for briefing UI */
export function estimateLevelDurationSec(level: GameLevel): number {
  const totalPx = level.chunks.reduce((sum, id) => sum + getChunk(id).width, 0);
  const avgSpeed = estimateMechanicAvgSpeed(level.mechanic, level.speedMultiplier) * 0.92;
  return Math.round(totalPx / avgSpeed);
}
