import type { SpawnLane } from './maps/types';

const LANE_HEIGHTS = {
  ground: { bot: 54, yOffset: 0 },
  air_low: { bot: 30, yOffset: 68 },
  air_mid: { bot: 0, yOffset: 110 },
  air_high: { bot: 0, yOffset: 155 },
} as const;

export function laneToObstacleY(groundY: number, lane: SpawnLane, h: number): number {
  if (lane === 'ground') return groundY - h;
  const offset = LANE_HEIGHTS[lane].yOffset;
  return groundY - offset - h;
}

export function laneToOrbY(groundY: number, lane: SpawnLane): number {
  const offsets: Record<SpawnLane, number> = {
    ground: 48,
    air_low: 72,
    air_mid: 115,
    air_high: 160,
  };
  return groundY - offsets[lane];
}

export function laneToPowerupY(groundY: number, lane: SpawnLane): number {
  return laneToOrbY(groundY, lane) - 8;
}
