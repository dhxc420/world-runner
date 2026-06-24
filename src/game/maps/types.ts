import type { ObstacleKind, PowerupKind } from '../types';

export type SpawnLane = 'ground' | 'air_low' | 'air_mid' | 'air_high';

export type SpawnType =
  | ObstacleKind
  | 'orb_real'
  | 'orb_fake'
  | 'wonder_flower'
  | 'spirit_shrine'
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
}

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
  parallax: 'forest' | 'grid' | 'hangar';
}

export interface MapPlaylist {
  id: string;
  name: string;
  themeId: string;
  chunks: string[];
}
