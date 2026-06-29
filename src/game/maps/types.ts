import type { ObstacleKind, PowerupKind } from '../types';

export type SpawnLane = 'ground' | 'air_low' | 'air_mid' | 'air_high';

export type SpawnType =
  | ObstacleKind
  | 'orb_real'
  | 'orb_fake'
  | 'wonder_flower'
  | 'spirit_shrine'
  | 'rainbow_star'
  | `powerup_${PowerupKind}`;

export interface SpawnPoint {
  offsetX: number;
  type: SpawnType;
  lane: SpawnLane;
}

export interface MapChunk {
  id: string;
  name: string;
  width: number;
  spawns: SpawnPoint[];
  /** Optional per-zone accent tint within a level */
  zoneAccent?: string;
  /** Act role — intro teaches, finish holds the gate */
  role?: ChunkRole;
}

export type ChunkRole = 'intro' | 'core' | 'climax' | 'payoff' | 'finish';

export interface MapTheme {
  id: string;
  name: string;
  void: string;
  auroraA: string;
  auroraB: string;
  auroraC: string;
  grid: string;
  gridDim: string;
  ground: string;
  groundLine: string;
  accent: string;
  wispHue: [number, number];
  parallax: 'ruins' | 'ruins_grid' | 'warzone';
}

export interface MapPlaylist {
  id: string;
  name: string;
  themeId: string;
  chunks: string[];
}
