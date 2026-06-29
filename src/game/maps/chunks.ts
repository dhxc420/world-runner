import type { MapChunk, MapPlaylist } from './types';
import { LEVEL_CHUNKS } from './levelChunks';

/** Hand-crafted chunks — each is tested for jump/duck timing at base speed */
export const MAP_CHUNKS: Record<string, MapChunk> = {
  runway: {
    id: 'runway',
    name: 'Runway',
    width: 520,
    spawns: [
      { offsetX: 200, type: 'orb_real', lane: 'air_low' },
      { offsetX: 400, type: 'orb_real', lane: 'air_mid' },
    ],
  },
  jump_lesson: {
    id: 'jump_lesson',
    name: 'Jump Lesson',
    width: 780,
    spawns: [
      { offsetX: 280, type: 'bot', lane: 'ground' },
      { offsetX: 480, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 640, type: 'orb_real', lane: 'air_high' },
    ],
  },
  duck_tunnel: {
    id: 'duck_tunnel',
    name: 'Duck Tunnel',
    width: 720,
    spawns: [
      { offsetX: 100, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 280, type: 'deepfake', lane: 'air_low' },
      { offsetX: 480, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 620, type: 'orb_real', lane: 'air_low' },
    ],
  },
  orb_stair: {
    id: 'orb_stair',
    name: 'Orb Staircase',
    width: 560,
    spawns: [
      { offsetX: 140, type: 'orb_real', lane: 'air_low' },
      { offsetX: 280, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 420, type: 'orb_real', lane: 'air_high' },
    ],
  },
  patrol: {
    id: 'patrol',
    name: 'Marathon Patrol',
    width: 780,
    spawns: [
      { offsetX: 160, type: 'bot', lane: 'ground' },
      { offsetX: 380, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 580, type: 'bot', lane: 'ground' },
    ],
  },
  gauntlet: {
    id: 'gauntlet',
    name: 'Gauntlet',
    width: 920,
    spawns: [
      { offsetX: 100, type: 'bot', lane: 'ground' },
      { offsetX: 320, type: 'deepfake', lane: 'air_low' },
      { offsetX: 520, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 700, type: 'firewall', lane: 'air_low' },
    ],
  },
  reward_line: {
    id: 'reward_line',
    name: 'Reward Line',
    width: 500,
    spawns: [
      { offsetX: 120, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 220, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 320, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 420, type: 'powerup_shield', lane: 'air_high' },
    ],
  },
  firewall_zone: {
    id: 'firewall_zone',
    name: 'Firewall Zone',
    width: 640,
    spawns: [
      { offsetX: 180, type: 'firewall', lane: 'air_low' },
      { offsetX: 400, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 540, type: 'bot', lane: 'ground' },
    ],
  },
  trick_fake: {
    id: 'trick_fake',
    name: 'Trick Orb',
    width: 480,
    spawns: [
      { offsetX: 160, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 340, type: 'orb_fake', lane: 'air_mid' },
    ],
  },
  flux_gift: {
    id: 'flux_gift',
    name: 'Flux Gift',
    width: 520,
    spawns: [
      { offsetX: 200, type: 'bot', lane: 'ground' },
      { offsetX: 400, type: 'powerup_flux', lane: 'air_high' },
    ],
  },
  double_duck: {
    id: 'double_duck',
    name: 'Double Duck',
    width: 800,
    spawns: [
      { offsetX: 150, type: 'deepfake', lane: 'air_low' },
      { offsetX: 400, type: 'orb_real', lane: 'air_low' },
      { offsetX: 600, type: 'deepfake', lane: 'air_low' },
    ],
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint',
    width: 600,
    spawns: [
      { offsetX: 200, type: 'orb_real', lane: 'air_high' },
      { offsetX: 350, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 500, type: 'powerup_nova', lane: 'air_high' },
    ],
  },
  wonder_burst: {
    id: 'wonder_burst',
    name: 'Wonder Burst',
    width: 520,
    spawns: [
      { offsetX: 160, type: 'wonder_flower', lane: 'air_mid' },
      { offsetX: 300, type: 'orb_real', lane: 'air_low' },
      { offsetX: 420, type: 'orb_real', lane: 'air_high' },
    ],
  },
  spirit_grove: {
    id: 'spirit_grove',
    name: 'Spirit Grove',
    width: 560,
    spawns: [
      { offsetX: 180, type: 'spirit_shrine', lane: 'air_mid' },
      { offsetX: 340, type: 'orb_real', lane: 'air_low' },
      { offsetX: 460, type: 'orb_real', lane: 'air_mid' },
    ],
  },
  rainbow_gate: {
    id: 'rainbow_gate',
    name: 'Rainbow Gate',
    width: 820,
    spawns: [
      { offsetX: 120, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 280, type: 'rainbow_star', lane: 'air_high' },
      { offsetX: 420, type: 'bot', lane: 'ground' },
      { offsetX: 560, type: 'orb_real', lane: 'air_low' },
      { offsetX: 700, type: 'deepfake', lane: 'air_low' },
    ],
  },
  star_alley: {
    id: 'star_alley',
    name: 'Star Alley',
    width: 960,
    spawns: [
      { offsetX: 100, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 220, type: 'orb_real', lane: 'air_high' },
      { offsetX: 380, type: 'firewall', lane: 'air_low' },
      { offsetX: 520, type: 'rainbow_star', lane: 'air_mid' },
      { offsetX: 680, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 820, type: 'bot', lane: 'ground' },
    ],
  },
  neon_cascade: {
    id: 'neon_cascade',
    name: 'Neon Cascade',
    width: 880,
    spawns: [
      { offsetX: 140, type: 'orb_real', lane: 'air_low' },
      { offsetX: 260, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 400, type: 'orb_real', lane: 'air_high' },
      { offsetX: 540, type: 'powerup_nova', lane: 'air_high' },
      { offsetX: 680, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 780, type: 'spirit_shrine', lane: 'air_mid' },
    ],
  },
  sky_bridge: {
    id: 'sky_bridge',
    name: 'Sky Bridge',
    width: 920,
    spawns: [
      { offsetX: 160, type: 'deepfake', lane: 'air_low' },
      { offsetX: 300, type: 'orb_real', lane: 'air_high' },
      { offsetX: 440, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 580, type: 'rainbow_star', lane: 'air_high' },
      { offsetX: 720, type: 'firewall', lane: 'air_low' },
      { offsetX: 860, type: 'orb_real', lane: 'air_mid' },
    ],
  },
  convoy_easy: {
    id: 'convoy_easy',
    name: 'Convoy Easy',
    width: 880,
    spawns: [
      { offsetX: 140, type: 'patrol_car', lane: 'ground' },
      { offsetX: 360, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 520, type: 'bot', lane: 'ground' },
      { offsetX: 700, type: 'patrol_car', lane: 'ground' },
    ],
  },
  convoy_hard: {
    id: 'convoy_hard',
    name: 'Convoy Hard',
    width: 960,
    spawns: [
      { offsetX: 100, type: 'patrol_car', lane: 'ground' },
      { offsetX: 240, type: 'turret', lane: 'air_mid' },
      { offsetX: 400, type: 'patrol_car', lane: 'ground' },
      { offsetX: 560, type: 'laser_gate', lane: 'air_low' },
      { offsetX: 720, type: 'bomber', lane: 'air_high' },
      { offsetX: 860, type: 'bot', lane: 'ground' },
    ],
  },
  air_strike: {
    id: 'air_strike',
    name: 'Air Strike',
    width: 900,
    spawns: [
      { offsetX: 120, type: 'bomber', lane: 'air_high' },
      { offsetX: 300, type: 'orb_real', lane: 'air_mid' },
      { offsetX: 480, type: 'bomber', lane: 'air_mid' },
      { offsetX: 640, type: 'turret', lane: 'air_low' },
      { offsetX: 800, type: 'laser_gate', lane: 'air_low' },
    ],
  },
  laser_corridor: {
    id: 'laser_corridor',
    name: 'Laser Corridor',
    width: 840,
    spawns: [
      { offsetX: 160, type: 'laser_gate', lane: 'air_low' },
      { offsetX: 320, type: 'orb_real', lane: 'air_high' },
      { offsetX: 480, type: 'turret', lane: 'air_mid' },
      { offsetX: 620, type: 'laser_gate', lane: 'air_low' },
      { offsetX: 760, type: 'firewall', lane: 'air_mid' },
    ],
  },
  metal_slug_zone: {
    id: 'metal_slug_zone',
    name: 'Metal Slug Zone',
    width: 1000,
    spawns: [
      { offsetX: 80, type: 'patrol_car', lane: 'ground' },
      { offsetX: 200, type: 'bomber', lane: 'air_high' },
      { offsetX: 340, type: 'turret', lane: 'air_mid' },
      { offsetX: 480, type: 'laser_gate', lane: 'air_low' },
      { offsetX: 620, type: 'patrol_car', lane: 'ground' },
      { offsetX: 760, type: 'bot', lane: 'ground' },
      { offsetX: 900, type: 'bomber', lane: 'air_mid' },
    ],
  },

  ...LEVEL_CHUNKS,
};

export const MAP_PLAYLISTS: MapPlaylist[] = [
  {
    id: 'grove_run',
    name: 'Ciudad Caída',
    themeId: 'grove',
    chunks: ['runway', 'jump_lesson', 'spirit_grove', 'rainbow_gate', 'duck_tunnel', 'orb_stair', 'wonder_burst', 'star_alley', 'reward_line', 'gauntlet', 'runway'],
  },
  {
    id: 'grid_run',
    name: 'Corredor Grid',
    themeId: 'grid',
    chunks: ['jump_lesson', 'patrol', 'neon_cascade', 'wonder_burst', 'firewall_zone', 'star_alley', 'orb_stair', 'trick_fake', 'gauntlet', 'sprint'],
  },
  {
    id: 'hangar_run',
    name: 'Zona de Guerra',
    themeId: 'hangar',
    chunks: ['runway', 'patrol', 'spirit_grove', 'sky_bridge', 'double_duck', 'rainbow_gate', 'firewall_zone', 'flux_gift', 'wonder_burst', 'reward_line', 'gauntlet'],
  },
];

export function getChunk(id: string): MapChunk {
  return MAP_CHUNKS[id] ?? MAP_CHUNKS.runway;
}
