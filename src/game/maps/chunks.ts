import type { MapChunk, MapPlaylist } from './types';

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
};

export const MAP_PLAYLISTS: MapPlaylist[] = [
  {
    id: 'grove_run',
    name: 'Grove Run',
    themeId: 'grove',
    chunks: ['runway', 'jump_lesson', 'spirit_grove', 'duck_tunnel', 'orb_stair', 'wonder_burst', 'reward_line', 'gauntlet', 'runway'],
  },
  {
    id: 'grid_run',
    name: 'Grid Run',
    themeId: 'grid',
    chunks: ['jump_lesson', 'patrol', 'wonder_burst', 'firewall_zone', 'orb_stair', 'trick_fake', 'gauntlet', 'sprint'],
  },
  {
    id: 'hangar_run',
    name: 'Hangar Run',
    themeId: 'hangar',
    chunks: ['runway', 'patrol', 'spirit_grove', 'double_duck', 'patrol', 'firewall_zone', 'flux_gift', 'wonder_burst', 'reward_line', 'gauntlet'],
  },
];

export function getChunk(id: string): MapChunk {
  return MAP_CHUNKS[id] ?? MAP_CHUNKS.runway;
}
