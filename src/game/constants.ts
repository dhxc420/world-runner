export const GRAVITY = 2600;
export const JUMP_VELOCITY = -820;
export const DOUBLE_JUMP_VELOCITY = -680;
export const GROUND_RATIO = 0.76;
export const PLAYER_X_RATIO = 0.2;

export const BASE_SPEED = 340;
export const MAX_SPEED = 720;
export const SPEED_RAMP = 9;

export const SPAWN_MIN_MS = 850;
export const SPAWN_MAX_MS = 1700;

export const MAGNET_RADIUS = 160;
export const MAGNET_PULL = 580;

export const COYOTE_TIME = 0.11;
export const JUMP_BUFFER = 0.14;
export const JUMP_CUT_MULT = 0.42;
export const SNAPSHOT_INTERVAL_MS = 100;

export const COMBO_WINDOW = 2.8;
export const COMBO_BONUS = 0.35;

export const FLUX_DURATION = 3.5;
export const NOVA_DURATION = 5;
export const SHIELD_HITS = 1;
export const INVINCIBLE_AFTER_CONTINUE = 2;

/** Ori bioluminescence + Tron neon palette */
export const PALETTE = {
  void: '#030812',
  aurora1: '#0a2a3a',
  aurora2: '#1a0a3e',
  aurora3: '#0d2847',
  teal: '#00ffd5',
  tealSoft: '#4fffe0',
  cyan: '#00d4ff',
  magenta: '#ff00aa',
  magentaSoft: '#ff66cc',
  gold: '#ffe566',
  goldGlow: '#fff8b0',
  violet: '#8b5cf6',
  violetDeep: '#4c1d95',
  red: '#ff2d55',
  redNeon: '#ff0044',
  white: '#f0fbff',
  grid: '#00e5ff',
  gridDim: 'rgba(0, 229, 255, 0.08)',
  player: '#00ffd5',
  playerVerified: '#ffe566',
  playerPremium: '#ff66cc',
  bot: '#ff0044',
  deepfake: '#cc00ff',
  firewall: '#ff6600',
  fakeOrb: '#ff3355',
  realOrb: '#ffe566',
  shield: '#00d4ff',
  flux: '#bf00ff',
  nova: '#ffaa00',
} as const;

export const COLORS = PALETTE;
