import type { MapTheme } from './maps/types';
import type { CompanionState } from './companion';
import type { FloatText } from './floatText';
import type { ZoneCardState } from './zoneCard';

export type { CompanionState, FloatText, ZoneCardState };

export type GamePhase = 'idle' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';

export type ObstacleKind =
  | 'bot'
  | 'deepfake'
  | 'firewall'
  | 'patrol_car'
  | 'bomber'
  | 'turret'
  | 'laser_gate';

export type PowerupKind = 'shield' | 'flux' | 'nova';

export type PlayerAction = 'jump' | 'duck' | 'release' | 'jump_release';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ObstacleEntity {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  passed: boolean;
  vx?: number;
  shootTimer?: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  ownerId: number;
  color: string;
}

export interface OrbEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  real: boolean;
  bobPhase: number;
  ringAngle: number;
}

export interface PowerupEntity {
  id: number;
  kind: PowerupKind;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  bobPhase: number;
}

export interface PickupEntity {
  id: number;
  kind: 'wonder_flower' | 'spirit_shrine' | 'rainbow_star';
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  bobPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  glow?: boolean;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface SpiritWisp {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  hue: number;
}


export interface GameModifiers {
  scoreMultiplier: number;
  verifiedSkin: boolean;
  premiumSkin: boolean;
  wonderTrail: boolean;
  spiritAura: boolean;
  magnetActive: boolean;
  speedBoostActive: boolean;
  hasContinue: boolean;
  doubleJump?: boolean;
}

export interface GameSnapshot {
  phase: GamePhase;
  score: number;
  distance: number;
  orbsCollected: number;
  highScore: number;
  speed: number;
  isNewHighScore: boolean;
  combo: number;
  maxCombo: number;
  mapName: string;
  chunkName?: string;
  levelProgress?: number;
  runRewardMessage?: string;
  levelComplete?: boolean;
  wonderName?: string;
}

export interface GameConfig {
  width: number;
  height: number;
  modifiers: GameModifiers;
  onSnapshot: (snapshot: GameSnapshot) => void;
  onGameOver: (snapshot: GameSnapshot) => void;
}

export interface RenderState {
  width: number;
  height: number;
  groundY: number;
  distance: number;
  elapsed: number;
  runFrame: number;
  speed: number;
  phase: GamePhase;
  combo: number;
  score: number;
  magnetTimer: number;
  speedBoostTimer: number;
  fluxTimer: number;
  shieldActive: boolean;
  novaTimer: number;
  shakeX: number;
  shakeY: number;
  modifiers: GameModifiers;
  playerRect: Rect;
  playerVy: number;
  isGrounded: boolean;
  isDucking: boolean;
  trail: TrailPoint[];
  obstacles: ObstacleEntity[];
  projectiles: ProjectileEntity[];
  orbs: OrbEntity[];
  powerups: PowerupEntity[];
  pickups: PickupEntity[];
  particles: Particle[];
  wisps: SpiritWisp[];
  stars: { x: number; y: number; size: number; speed: number; twinkle: number }[];
  mapTheme: MapTheme;
  mapName: string;
  chunkName: string;
  wingPhase: number;
  squashX: number;
  squashY: number;
  floatTexts: FloatText[];
  companion: CompanionState;
  zoneCard: ZoneCardState | null;
  invincibleTimer: number;
  wonderTimer: number;
  wonderVariant: string;
  rainbowStarTimer: number;
  dyingTimer: number;
  visualSeed: number;
  levelProgress: number;
  chunkIndex: number;
  chunkTotal: number;
  showFinishGate: boolean;
}
