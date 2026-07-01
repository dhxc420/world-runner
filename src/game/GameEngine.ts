import {
  BASE_SPEED,
  COMBO_BONUS,
  COMBO_WINDOW,
  COYOTE_TIME,
  DOUBLE_JUMP_VELOCITY,
  FLUX_DURATION,
  GRAVITY,
  GROUND_RATIO,
  INVINCIBLE_AFTER_CONTINUE,
  JUMP_BUFFER,
  JUMP_CUT_MULT,
  JUMP_VELOCITY,
  MAGNET_PULL,
  MAGNET_RADIUS,
  MAX_SPEED,
  NOVA_DURATION,
  PALETTE,
  PLAYER_X_RATIO,
  RAINBOW_FLY_CRUISE,
  RAINBOW_FLY_HEIGHT,
  RAINBOW_FLAP_VY,
  RAINBOW_STAR_SPEED_MULT,
  SPEED_RAMP,
} from './constants';
import { gameAudio } from './audio';
import { gameMusic } from './music';
import { createCompanion, pulseCompanion, updateCompanion } from './companion';
import {
  pushTrail,
  spawnBurst,
  spawnCollectRing,
  spawnDeathExplosion,
  spawnTrailSpark,
  updateParticles,
} from './effects';
import { spawnFloatText, updateFloatTexts } from './floatText';
import { laneToObstacleY, laneToOrbY, laneToPowerupY } from './lanes';
import { MapDirector } from './maps/MapDirector';
import type { GameLevel } from './maps/levels';
import type { LevelMechanicId, MechanicGimmick } from './maps/levelMechanics';
import { getMechanic } from './maps/levelMechanics';
import { levelVisualSeed } from './maps/themes';
import type { SpawnLane, ChunkRole } from './maps/types';
import { GameRenderer } from './renderer';
import { createZoneCard, updateZoneCard } from './zoneCard';
import type { ZoneCardState } from './zoneCard';
import { isMusicEnabled } from '@/lib/settings';
import { gameStorage } from '@/lib/gameStorage';
import type {
  CompanionState,
  FloatText,
  GameConfig,
  GamePhase,
  GameSnapshot,
  ObstacleEntity,
  ObstacleKind,
  OrbEntity,
  Particle,
  PickupEntity,
  PlayerAction,
  PowerupEntity,
  PowerupKind,
  ProjectileEntity,
  Rect,
  SpiritWisp,
  TrailPoint,
} from './types';
import {
  activateWonderMode,
  createWonderMode,
  isWonderActive,
  updateWonderMode,
  type WonderModeState,
} from './wonderMode';
import {
  activateRainbowStar,
  createRainbowStar,
  isRainbowStarActive,
  updateRainbowStar,
  type RainbowStarState,
} from './rainbowStarMode';

function rectsOverlap(a: Rect, b: Rect, padding = 0): boolean {
  return (
    a.x + padding < b.x + b.w - padding &&
    a.x + a.w - padding > b.x + padding &&
    a.y + padding < b.y + b.h - padding &&
    a.y + a.h - padding > b.y + padding
  );
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer = new GameRenderer();
  private config: GameConfig;
  private phase: GamePhase = 'idle';
  private lastTime = 0;
  private rafId = 0;

  private groundY = 0;
  private playerX = 0;
  private playerY = 0;
  private playerW = 42;
  private playerH = 54;
  private playerVy = 0;
  private isGrounded = true;
  private isDucking = false;
  private runFrame = 0;
  private jumpsRemaining = 1;
  private maxJumps = 1;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  private speed = BASE_SPEED;
  private distance = 0;
  private score = 0;
  private orbsCollected = 0;
  private combo = 0;
  private maxCombo = 0;
  private comboTimer = 0;
  private elapsed = 0;
  private entityId = 0;

  private obstacles: ObstacleEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private orbs: OrbEntity[] = [];
  private powerups: PowerupEntity[] = [];
  private pickups: PickupEntity[] = [];
  private particles: Particle[] = [];
  private trail: TrailPoint[] = [];
  private stars: { x: number; y: number; size: number; speed: number; twinkle: number }[] = [];
  private wisps: SpiritWisp[] = [];

  private magnetTimer = 0;
  private speedBoostTimer = 0;
  private fluxTimer = 0;
  private novaTimer = 0;
  private shieldHits = 0;
  private invincibleTimer = 0;
  private usedContinue = false;
  private dyingTimer = 0;
  private wonderMode: WonderModeState = createWonderMode();
  private rainbowStar: RainbowStarState = createRainbowStar();

  private shakeX = 0;
  private shakeY = 0;
  private shakeIntensity = 0;
  private flashAlpha = 0;
  private wingPhase = 0;
  private squashX = 1;
  private squashY = 1;
  private floatTexts: FloatText[] = [];
  private companion: CompanionState = createCompanion();
  private zoneCard: ZoneCardState | null = null;
  private lastSnapshotEmit = 0;
  private playlistId: string | undefined;
  private speedMultiplier = 1;
  private activeLevel: GameLevel | null = null;
  private mechanicJumpMult = 1;
  private mechanicGravityMult = 1;
  private mechanicSpeedRampMult = 1;
  private mechanicBaseSpeedMult = 1;
  private mechanicMaxSpeedMult = 1;
  private mechanicGimmick: MechanicGimmick | null = null;
  private levelCompleteTriggered = false;
  private zonePauseTimer = 0;
  private mapDirector = new MapDirector();

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.canvas = canvas;
    this.ctx = ctx;
    this.config = config;
    this.resetLayout();
  }

  updateConfig(config: Partial<GameConfig>) {
    this.config = { ...this.config, ...config };
    const preservePlayer = this.phase === 'playing';
    this.resetLayout(preservePlayer);
  }

  getPhase() {
    return this.phase;
  }

  start(options?: {
    speedBoost?: boolean;
    magnetBoost?: boolean;
    playlistId?: string;
    level?: GameLevel;
    speedMultiplier?: number;
  }) {
    if (options?.level) {
      this.activeLevel = options.level;
      this.playlistId = undefined;
      this.setLevel(options.level);
    } else if (options?.playlistId) {
      this.playlistId = options.playlistId;
      this.activeLevel = null;
    }
    if (options?.speedMultiplier) this.speedMultiplier = options.speedMultiplier;
    gameAudio.unlock();
    gameMusic.unlock();
    this.resetRunState();
    this.phase = 'playing';
    if (isMusicEnabled()) {
      gameMusic.setMuted(false);
      gameMusic.start(this.mapDirector.getTheme().id);
    } else {
      gameMusic.setMuted(true);
    }
    if (options?.speedBoost) this.activateSpeedBoost();
    if (options?.magnetBoost) this.activateMagnet();
    this.lastTime = performance.now();
    if (!this.rafId) this.loop(this.lastTime);
  }

  setLevel(level: GameLevel) {
    this.activeLevel = level;
    this.speedMultiplier = level.speedMultiplier;
    const mech = getMechanic(level.mechanic);
    this.mechanicGravityMult = mech.gravityMult;
    this.mechanicJumpMult = mech.jumpMult;
    this.mechanicSpeedRampMult = mech.speedRampMult;
    this.mechanicBaseSpeedMult = mech.baseSpeedMult;
    this.mechanicMaxSpeedMult = mech.maxSpeedMult;
    this.mechanicGimmick = mech.gimmick;
    this.mapDirector.setLevel(level);
    this.initAmbience(this.mapDirector.getTheme());
    if (this.phase === 'idle') this.startIdleLoop();
  }

  setPlaylist(playlistId: string) {
    this.speedMultiplier = 1;
    this.playlistId = playlistId;
    this.mapDirector.setPlaylist(playlistId);
    this.initAmbience(this.mapDirector.getTheme());
    if (this.phase === 'idle') this.startIdleLoop();
  }

  returnToHub() {
    this.stopLoop();
    gameMusic.stop();
    this.phase = 'idle';
    if (this.playlistId) this.mapDirector.setPlaylist(this.playlistId);
    this.playerY = this.groundY - this.playerH;
    this.initAmbience(this.mapDirector.getTheme());
    this.startIdleLoop();
  }

  restart() {
    this.stopLoop();
    this.start(
      this.activeLevel
        ? { level: this.activeLevel, speedMultiplier: this.speedMultiplier }
        : this.playlistId
          ? { playlistId: this.playlistId }
          : undefined,
    );
  }

  pause() {
    if (this.phase === 'playing') {
      this.phase = 'paused';
      this.stopLoop();
      gameMusic.stop();
      this.render();
      this.emitSnapshot(true);
    }
  }

  resume() {
    if (this.phase === 'paused') {
      this.phase = 'playing';
      if (isMusicEnabled()) {
        gameMusic.setMuted(false);
        gameMusic.start(this.mapDirector.getTheme().id);
      }
      this.lastTime = performance.now();
      this.emitSnapshot(true);
      if (!this.rafId) this.loop(this.lastTime);
    }
  }

  destroy() {
    this.stopLoop();
  }

  input(action: PlayerAction) {
    if (this.phase !== 'playing' || this.dyingTimer > 0) return;
    if (action === 'jump') this.jumpBufferTimer = JUMP_BUFFER;
    if (action === 'jump_release') {
      if (!this.isGrounded && this.playerVy < 0) {
        this.playerVy *= JUMP_CUT_MULT;
      }
    }
    if (action === 'duck') this.isDucking = true;
    if (action === 'release') this.isDucking = false;
  }

  tryContinue(): boolean {
    if (this.phase !== 'gameover') return false;
    if (this.usedContinue) return false;

    this.usedContinue = true;
    const safeX = this.playerX + 80;
    this.obstacles = this.obstacles.filter((o) => o.x > safeX);
    this.projectiles = this.projectiles.filter((p) => p.x > safeX);
    this.orbs = this.orbs.filter((o) => o.collected || o.x > safeX);
    this.powerups = this.powerups.filter((p) => p.collected || p.x > safeX);
    this.pickups = this.pickups.filter((p) => p.collected || p.x > safeX);
    this.invincibleTimer = INVINCIBLE_AFTER_CONTINUE;
    this.shieldHits = 0;
    this.phase = 'playing';
    this.shakeIntensity = 0;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    spawnBurst(this.particles, this.playerX + this.playerW / 2, this.playerY + this.playerH / 2, PALETTE.teal, 20, { glow: true });
    gameAudio.playContinue();
    this.emitSnapshot(true);
    return true;
  }

  activateSpeedBoost() {
    this.speedBoostTimer = 12;
  }

  activateMagnet() {
    this.magnetTimer = 15;
  }

  private resetLayout(preservePlayer = false) {
    const { width, height } = this.config;
    const prevGroundY = this.groundY;
    this.canvas.width = width;
    this.canvas.height = height;
    const newGroundY = height * GROUND_RATIO;
    this.groundY = newGroundY;
    this.playerX = width * PLAYER_X_RATIO;

    if (preservePlayer && prevGroundY > 0) {
      const delta = newGroundY - prevGroundY;
      this.playerY += delta;
      const maxY = newGroundY - this.playerH;
      if (this.playerY > maxY) {
        this.playerY = maxY;
        if (this.playerVy > 0) this.playerVy = 0;
        this.isGrounded = true;
      }
      this.shiftEntitiesForGroundDelta(delta);
    } else {
      this.playerY = newGroundY - this.playerH;
      this.initAmbience(this.mapDirector.getTheme());
    }
  }

  private shiftEntitiesForGroundDelta(delta: number) {
    if (delta === 0) return;
    for (const o of this.obstacles) o.y += delta;
    for (const o of this.orbs) o.y += delta;
    for (const p of this.powerups) p.y += delta;
    for (const p of this.pickups) p.y += delta;
  }

  private initAmbience(theme = this.mapDirector.getTheme()) {
    const { width, height } = this.config;
    const [hueMin, hueMax] = theme.wispHue;
    this.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.68,
      size: Math.random() * 2.2 + 0.4,
      speed: Math.random() * 0.35 + 0.15,
      twinkle: Math.random() * Math.PI * 2,
    }));
    this.wisps = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.55,
      size: 12 + Math.random() * 28,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      hue: hueMin + Math.random() * (hueMax - hueMin),
    }));
  }

  private resetRunState() {
    this.speed = BASE_SPEED * this.mechanicBaseSpeedMult * this.speedMultiplier;
    this.distance = 0;
    this.score = 0;
    this.orbsCollected = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.elapsed = 0;
    this.obstacles = [];
    this.projectiles = [];
    this.orbs = [];
    this.powerups = [];
    this.pickups = [];
    this.particles = [];
    this.trail = [];
    this.playerVy = 0;
    this.isGrounded = true;
    this.isDucking = false;
    this.runFrame = 0;
    this.magnetTimer = 0;
    this.speedBoostTimer = 0;
    this.fluxTimer = 0;
    this.novaTimer = 0;
    this.shieldHits = 0;
    this.invincibleTimer = 0;
    this.usedContinue = false;
    this.coyoteTimer = COYOTE_TIME;
    this.jumpBufferTimer = 0;
    this.shakeIntensity = 0;
    this.flashAlpha = 0;
    this.wingPhase = 0;
    this.squashX = 1;
    this.squashY = 1;
    this.floatTexts = [];
    this.companion = createCompanion();
    this.zoneCard = null;
    this.dyingTimer = 0;
    this.wonderMode = createWonderMode();
    this.rainbowStar = createRainbowStar();
    this.levelCompleteTriggered = false;
    this.zonePauseTimer = 0;
    if (this.activeLevel) {
      const mech = getMechanic(this.activeLevel.mechanic);
      this.mechanicGravityMult = mech.gravityMult;
      this.mechanicJumpMult = mech.jumpMult;
      this.mechanicSpeedRampMult = mech.speedRampMult;
      this.mechanicBaseSpeedMult = mech.baseSpeedMult;
      this.mechanicMaxSpeedMult = mech.maxSpeedMult;
      this.mechanicGimmick = mech.gimmick;
    } else {
      this.mechanicGravityMult = 1;
      this.mechanicJumpMult = 1;
      this.mechanicSpeedRampMult = 1;
      this.mechanicBaseSpeedMult = 1;
      this.mechanicMaxSpeedMult = 1;
      this.mechanicGimmick = null;
    }
    if (this.activeLevel) {
      this.mapDirector.setLevel(this.activeLevel);
    } else if (this.playlistId) {
      this.mapDirector.setPlaylist(this.playlistId);
    } else {
      this.mapDirector.reset();
    }
    this.initAmbience(this.mapDirector.getTheme());
    this.playerY = this.groundY - this.playerH;

    const mods = this.config.modifiers;
    this.maxJumps = mods.doubleJump || mods.verifiedSkin ? 2 : 1;
    this.jumpsRemaining = this.maxJumps;
  }

  private stopLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private startIdleLoop() {
    if (this.rafId) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private updateIdle(dt: number) {
    this.elapsed += dt;
    this.wingPhase += dt * 18;
    const { width } = this.config;
    for (const w of this.wisps) {
      w.x -= w.speed * 24 * dt;
      w.phase += dt * 1.2;
      if (w.x < -40) w.x = width + 40;
    }
    for (const star of this.stars) {
      star.twinkle += dt * 2.5;
    }
    this.zoneCard = updateZoneCard(this.zoneCard, dt);
  }

  private loop = (time: number) => {
    const dt = Math.min((time - this.lastTime) / 1000, 0.033);
    this.lastTime = time;

    if (this.phase === 'playing') {
      this.update(dt);
      this.render();
      this.emitSnapshot();
    } else if (this.phase === 'idle') {
      this.updateIdle(dt);
      this.render();
    } else {
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private getPlayerRect(): Rect {
    const duckH = 32;
    const h = this.isDucking && this.isGrounded ? duckH : this.playerH;
    const y = this.isDucking && this.isGrounded ? this.groundY - duckH : this.playerY;
    return { x: this.playerX, y, w: this.playerW, h };
  }

  private tryJump() {
    if (isRainbowStarActive(this.rainbowStar)) {
      this.playerVy = Math.min(this.playerVy, RAINBOW_FLAP_VY);
      this.isGrounded = false;
      this.jumpBufferTimer = 0;
      const cx = this.playerX + this.playerW / 2;
      spawnBurst(this.particles, cx, this.playerY + this.playerH * 0.4, PALETTE.gold, 6, { speed: 70 });
      gameAudio.playJump();
      return;
    }

    const canJump =
      (this.isGrounded || this.coyoteTimer > 0) && !this.isDucking && this.jumpsRemaining > 0;

    if (!canJump) return;

    const isDoubleJump = !this.isGrounded && this.coyoteTimer <= 0;
    this.playerVy = (isDoubleJump ? DOUBLE_JUMP_VELOCITY : JUMP_VELOCITY) * this.mechanicJumpMult;
    this.squashX = 0.82;
    this.squashY = 1.22;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpsRemaining -= 1;
    this.jumpBufferTimer = 0;

    const cx = this.playerX + this.playerW / 2;
    spawnBurst(this.particles, cx, this.groundY, PALETTE.teal, 10, { speed: 90 });
    if (isDoubleJump) {
      spawnBurst(this.particles, cx, this.playerY + this.playerH / 2, PALETTE.cyan, 8, { speed: 70 });
    }
    gameAudio.playJump();
  }

  private update(dt: number) {
    if (this.dyingTimer > 0) {
      this.dyingTimer -= dt;
      this.shakeIntensity = Math.max(this.shakeIntensity, 4);
      this.particles = updateParticles(this.particles, dt * 0.22, 0);
      this.floatTexts = updateFloatTexts(this.floatTexts, dt * 0.22, 0);
      updateWonderMode(this.wonderMode, dt * 0.22);
      if (this.dyingTimer <= 0) this.gameOver();
      return;
    }

    const timeScale = this.fluxTimer > 0 ? 0.55 : 1;
    const scaledDt = dt * timeScale;

    this.elapsed += dt;
    this.runFrame += dt * 14;
    this.wingPhase += dt * (this.isGrounded ? 22 : 14);
    this.distance += this.speed * scaledDt * 0.1;

    const speedMult = this.fluxTimer > 0 ? 0.7 : 1;
    const speedCap = this.mapDirector.isFiniteLevel()
      ? BASE_SPEED * this.mechanicMaxSpeedMult * this.speedMultiplier
      : MAX_SPEED * this.speedMultiplier;
    this.speed = Math.min(
      speedCap,
      this.speed + SPEED_RAMP * this.mechanicSpeedRampMult * scaledDt * speedMult,
    );

    if (this.zonePauseTimer > 0) this.zonePauseTimer -= dt;

    if (this.magnetTimer > 0) this.magnetTimer -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;
    if (this.fluxTimer > 0) this.fluxTimer -= dt;
    if (this.novaTimer > 0) this.novaTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    updateWonderMode(this.wonderMode, dt);
    updateRainbowStar(this.rainbowStar, dt);
    const rainbowActive = isRainbowStarActive(this.rainbowStar);
    if (rainbowActive) {
      this.invincibleTimer = Math.max(this.invincibleTimer, this.rainbowStar.timer);
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.shakeIntensity > 0) {
      this.shakeIntensity -= dt * 10;
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 5;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 3.5;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
    if (this.flashAlpha > 0) this.flashAlpha -= dt * 3;

    this.squashX += (1 - this.squashX) * Math.min(1, dt * 14);
    this.squashY += (1 - this.squashY) * Math.min(1, dt * 14);
    this.zoneCard = updateZoneCard(this.zoneCard, dt);

    const mods = this.config.modifiers;
    const magnetActive = this.magnetTimer > 0 || mods.magnetActive;
    const speedBoostActive = this.speedBoostTimer > 0 || mods.speedBoostActive;

    // Jump buffer + coyote
    if (this.jumpBufferTimer > 0) this.tryJump();

    // Player physics
    const wasGrounded = this.isGrounded;
    if (!this.isGrounded) {
      if (rainbowActive) {
        const flyCeiling = this.groundY - RAINBOW_FLY_HEIGHT;
        const cruiseY = this.groundY - RAINBOW_FLY_CRUISE;

        this.playerVy += GRAVITY * 0.14 * this.mechanicGravityMult * scaledDt;
        this.playerVy += (cruiseY - this.playerY) * 3.2 * scaledDt;
        if (this.isDucking) this.playerVy += 720 * scaledDt;

        this.playerVy = Math.max(this.playerVy, -420);
        this.playerVy = Math.min(this.playerVy, 460);
        this.playerY += this.playerVy * scaledDt;

        if (this.playerY < flyCeiling) {
          this.playerY = flyCeiling;
          this.playerVy = Math.max(this.playerVy, 0);
        }
      } else {
        this.playerVy += GRAVITY * this.mechanicGravityMult * scaledDt;
        if (isWonderActive(this.wonderMode) && this.wonderMode.variant === 'float') {
          this.playerVy += 420 * scaledDt;
        }
        this.playerY += this.playerVy * scaledDt;
      }
      this.coyoteTimer -= dt;
      if (this.playerY >= this.groundY - this.playerH) {
        this.playerY = this.groundY - this.playerH;
        this.playerVy = 0;
        this.isGrounded = true;
      }
    } else {
      this.coyoteTimer = COYOTE_TIME;
      this.jumpsRemaining = this.maxJumps;
    }

    if (this.isGrounded && !wasGrounded) {
      spawnBurst(this.particles, this.playerX + this.playerW / 2, this.groundY, PALETTE.cyan, 6, { speed: 60 });
      this.squashX = 1.18;
      this.squashY = 0.72;
      gameAudio.playLand();
    }

    const zoneScrollMult = this.zonePauseTimer > 0 ? 0.58 : 1;
    const roleScrollMult = this.getRoleScrollMult(this.mapDirector.getChunkRole());
    const gimmickScrollMult = this.getGimmickScrollMult();
    const scroll =
      this.speed *
      scaledDt *
      (rainbowActive ? RAINBOW_STAR_SPEED_MULT : 1) *
      zoneScrollMult *
      roleScrollMult *
      gimmickScrollMult;

    this.mapDirector.advanceScroll(scroll);
    this.mapDirector.update({
      spawnBot: (lane) => {
        if (this.canSpawnEnemy('bot')) this.spawnObstacle('bot', lane);
      },
      spawnDeepfake: (lane) => {
        if (this.canSpawnEnemy('deepfake')) this.spawnObstacle('deepfake', lane);
      },
      spawnFirewall: (lane) => {
        if (this.canSpawnEnemy('firewall')) this.spawnObstacle('firewall', lane);
      },
      spawnPatrolCar: (lane) => {
        if (this.canSpawnEnemy('patrol_car')) this.spawnObstacle('patrol_car', lane);
      },
      spawnBomber: (lane) => {
        if (this.canSpawnEnemy('bomber')) this.spawnObstacle('bomber', lane);
      },
      spawnTurret: (lane) => {
        if (this.canSpawnEnemy('turret')) this.spawnObstacle('turret', lane);
      },
      spawnLaserGate: (lane) => {
        if (this.canSpawnEnemy('laser_gate')) this.spawnObstacle('laser_gate', lane);
      },
      spawnOrb: (real, lane) => this.spawnOrb(real, lane),
      spawnPowerup: (kind, lane) => this.spawnPowerup(kind, lane),
      spawnWonderFlower: (lane) => this.spawnPickup('wonder_flower', lane),
      spawnSpiritShrine: (lane) => this.spawnPickup('spirit_shrine', lane),
      spawnRainbowStar: (lane) => this.spawnPickup('rainbow_star', lane),
    });

    const zoneAnnounce = this.mapDirector.consumeZoneAnnounce();
    if (zoneAnnounce) {
      const theme = this.mapDirector.getTheme();
      gameMusic.updateTheme(theme.id);
      this.zoneCard = createZoneCard(zoneAnnounce.mapName, zoneAnnounce.chunkName, theme.accent);
      if (this.mapDirector.isFiniteLevel()) {
        this.zonePauseTimer = 0.4;
      }
      if (
        this.activeLevel &&
        this.mapDirector.getChunkRole() === 'climax' &&
        getMechanic(this.activeLevel.mechanic).climaxWonder &&
        this.wonderMode.timer <= 0
      ) {
        const mech = getMechanic(this.activeLevel.mechanic);
        activateWonderMode(
          this.wonderMode,
          this.particles,
          this.floatTexts,
          this.playerX + this.playerW / 2,
          this.playerY + this.playerH / 2,
          mech.wonderVariant,
        );
        this.wonderMode.timer = 4.5;
      }
      pulseCompanion(this.companion, 1);
      const cx = this.playerX + this.playerW / 2;
      spawnBurst(this.particles, cx, this.playerY + this.playerH / 2, theme.accent, 20, {
        speed: 100,
        glow: true,
      });
    }

    // Scroll entities
    this.obstacles.forEach((o) => {
      o.x -= scroll;
      if (o.vx) o.x += o.vx * scaledDt;
      o.phase += dt * 3;
      if (o.kind === 'bomber') {
        o.y += Math.sin(this.elapsed * 2 + o.phase) * 28 * scaledDt;
      }
      if (o.kind === 'turret') {
        const laserWaltz = this.mechanicGimmick === 'laser_rhythm';
        o.shootTimer = (o.shootTimer ?? (laserWaltz ? 0.7 : 1.2)) - dt;
        if (o.shootTimer <= 0 && o.x < this.config.width - 40 && o.x > this.playerX - 20) {
          o.shootTimer = (laserWaltz ? 0.75 : 1.4) + Math.random() * (laserWaltz ? 0.35 : 0.8);
          this.spawnProjectile(o);
        }
      }
    });
    this.projectiles.forEach((p) => {
      p.x += p.vx * scaledDt;
      p.y += p.vy * scaledDt;
    });
    this.projectiles = this.projectiles.filter((p) => p.x > -60 && p.x < this.config.width + 80);
    this.orbs.forEach((o) => {
      o.x -= scroll;
      o.ringAngle += dt * 2.5;
      if (magnetActive && o.real && !o.collected) {
        this.applyMagnet(o.x, o.y, dt, (nx, ny) => {
          o.x = nx;
          o.y = ny;
        });
      }
    });
    this.powerups.forEach((p) => {
      p.x -= scroll;
    });
    this.pickups.forEach((p) => {
      p.x -= scroll;
    });

    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -30);
    this.orbs = this.orbs.filter((o) => o.x > -40 && !o.collected);
    this.powerups = this.powerups.filter((p) => p.x > -40 && !p.collected);
    this.pickups = this.pickups.filter((p) => p.x > -40 && !p.collected);

    const playerRect = this.getPlayerRect();
    const pcx = playerRect.x + playerRect.w / 2;
    const pcy = playerRect.y + playerRect.h / 2;

    updateCompanion(this.companion, pcx, pcy, dt);

    // Trail + sparks
    if (this.isGrounded && !this.isDucking) {
      pushTrail(this.trail, pcx, pcy + playerRect.h * 0.2);
      if (Math.random() > 0.5) {
        const color = mods.premiumSkin
          ? PALETTE.playerPremium
          : mods.verifiedSkin
            ? PALETTE.playerVerified
            : PALETTE.player;
        spawnTrailSpark(this.particles, pcx, pcy, color);
      }
    }

    // Collect orbs
    for (const orb of this.orbs) {
      if (orb.collected) continue;
      const bob = Math.sin(this.elapsed * 4 + orb.bobPhase) * 4;
      const dx = orb.x - pcx;
      const dy = orb.y + bob - pcy;
      const hit = Math.hypot(dx, dy) < orb.radius + playerRect.w * 0.35;
      if (!hit) continue;

      orb.collected = true;
      if (orb.real) {
        this.orbsCollected += 1;
        this.combo += 1;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboTimer = COMBO_WINDOW;
        const mult = this.getScoreMultiplier(speedBoostActive);
        const comboMult = 1 + (this.combo - 1) * COMBO_BONUS;
        const pts = Math.floor(30 * mult * comboMult);
        this.score += pts;
        spawnCollectRing(this.particles, orb.x, orb.y + bob, PALETTE.gold);
        spawnFloatText(this.floatTexts, orb.x, orb.y + bob - 12, `+${pts} ✦`, PALETTE.gold);
        if (this.combo > 1) {
          spawnFloatText(
            this.floatTexts,
            orb.x,
            orb.y + bob - 28,
            `COMBO x${this.combo}`,
            PALETTE.magentaSoft,
            { scale: 0.85 },
          );
        }
        this.flashAlpha = 0.15;
        gameAudio.playOrb(pts);
      } else {
        if (this.invincibleTimer > 0) {
          orb.collected = true;
          spawnBurst(this.particles, orb.x, orb.y + bob, PALETTE.fakeOrb, 6, { speed: 40 });
          continue;
        }
        this.triggerDeath();
        return;
      }
    }

    // Collect wonder flowers & spirit shrines (Ori / Wonder)
    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      const bob = Math.sin(this.elapsed * 4 + pickup.bobPhase) * 5;
      const dx = pickup.x - pcx;
      const dy = pickup.y + bob - pcy;
      if (Math.hypot(dx, dy) >= pickup.radius + playerRect.w * 0.35) continue;

      pickup.collected = true;
      if (pickup.kind === 'wonder_flower') {
        const variant = this.activeLevel
          ? getMechanic(this.activeLevel.mechanic).wonderVariant
          : undefined;
        activateWonderMode(
          this.wonderMode,
          this.particles,
          this.floatTexts,
          pickup.x,
          pickup.y + bob,
          variant,
        );
        gameStorage.recordWonderFlower();
        this.squashX = 0.7;
        this.squashY = 1.35;
        gameAudio.playPowerup();
      } else if (pickup.kind === 'rainbow_star') {
        activateRainbowStar(this.rainbowStar, this.particles, this.floatTexts, pickup.x, pickup.y + bob);
        this.invincibleTimer = Math.max(this.invincibleTimer, this.rainbowStar.timer);
        this.speed = Math.min(MAX_SPEED, this.speed + 40);
        this.squashX = 0.65;
        this.squashY = 1.4;
        gameAudio.playPowerup();
      } else {
        this.comboTimer = COMBO_WINDOW * 1.6;
        this.combo = Math.max(this.combo, 2);
        pulseCompanion(this.companion, 1);
        this.invincibleTimer = Math.max(this.invincibleTimer, 0.65);
        const accent = this.mapDirector.getTheme().accent;
        spawnBurst(this.particles, pickup.x, pickup.y + bob, accent, 24, { speed: 90, glow: true });
        spawnFloatText(this.floatTexts, pickup.x, pickup.y + bob - 20, 'SPIRIT', accent, { scale: 1.2 });
        gameStorage.recordSpiritShrine();
        gameAudio.playOrb(0);
      }
    }

    // Collect powerups
    for (const p of this.powerups) {
      if (p.collected) continue;
      const bob = Math.sin(this.elapsed * 5 + p.bobPhase) * 5;
      const dx = p.x - pcx;
      const dy = p.y + bob - pcy;
      if (Math.hypot(dx, dy) >= p.radius + playerRect.w * 0.35) continue;

      p.collected = true;
      this.applyPowerup(p.kind);
      spawnCollectRing(this.particles, p.x, p.y + bob, PALETTE.cyan);
      gameAudio.playPowerup();
    }

    // Near-miss scoring
    if (this.invincibleTimer <= 0) {
      for (const obstacle of this.obstacles) {
        if (!obstacle.passed && obstacle.x + obstacle.w < playerRect.x) {
          obstacle.passed = true;
          const nearY = Math.abs(obstacle.y + obstacle.h / 2 - pcy) < 50;
          if (nearY) {
            const pts = Math.floor(15 * this.getScoreMultiplier(speedBoostActive));
            this.score += pts;
            spawnBurst(this.particles, playerRect.x, pcy, PALETTE.magentaSoft, 4, { speed: 50, size: 2 });
            spawnFloatText(this.floatTexts, playerRect.x + 20, pcy - 20, `+${pts}`, PALETTE.magentaSoft);
            gameAudio.playNearMiss();
          }
        }
      }
    } else {
      for (const obstacle of this.obstacles) {
        if (!obstacle.passed && obstacle.x + obstacle.w < playerRect.x) obstacle.passed = true;
      }
    }

    // Obstacle collisions
    if (rainbowActive) {
      const smash: number[] = [];
      for (const obstacle of this.obstacles) {
        const rect: Rect = { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
        if (rectsOverlap(playerRect, rect, 4)) {
          smash.push(obstacle.id);
          const pts = Math.floor(40 * this.getScoreMultiplier(speedBoostActive));
          this.score += pts;
          spawnBurst(this.particles, obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, `hsl(${(this.elapsed * 280) % 360}, 100%, 65%)`, 14, { speed: 120, glow: true });
          spawnFloatText(this.floatTexts, obstacle.x, obstacle.y - 8, `+${pts}`, PALETTE.gold, { scale: 1.1 });
          gameAudio.playHit();
        }
      }
      if (smash.length) {
        this.obstacles = this.obstacles.filter((o) => !smash.includes(o.id));
      }
    } else if (this.invincibleTimer <= 0) {
      for (const obstacle of this.obstacles) {
        const rect: Rect = { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
        const pad = this.isDucking ? 4 : 2;
        if (rectsOverlap(playerRect, rect, pad)) {
          if (this.shieldHits > 0) {
            this.shieldHits -= 1;
            this.invincibleTimer = 1.2;
            this.shakeIntensity = 4;
            spawnBurst(this.particles, pcx, pcy, PALETTE.shield, 16);
            this.obstacles = this.obstacles.filter((o) => o.id !== obstacle.id);
            gameAudio.playHit();
            continue;
          }
          this.triggerDeath();
          return;
        }
      }
      for (const proj of this.projectiles) {
        const rect: Rect = { x: proj.x, y: proj.y, w: proj.w, h: proj.h };
        if (rectsOverlap(playerRect, rect, 2)) {
          if (this.shieldHits > 0) {
            this.shieldHits -= 1;
            this.invincibleTimer = 1.2;
            this.projectiles = this.projectiles.filter((p) => p.id !== proj.id);
            gameAudio.playHit();
            continue;
          }
          this.triggerDeath();
          return;
        }
      }
    }

    // Passive score
    this.score += Math.floor(scroll * 0.045 * this.getScoreMultiplier(speedBoostActive));

    if (this.mapDirector.isLevelFinished()) {
      this.triggerLevelComplete();
      return;
    }

    this.particles = updateParticles(this.particles, dt, scroll);
    this.floatTexts = updateFloatTexts(this.floatTexts, dt, scroll);

    this.stars.forEach((s) => {
      s.x -= scroll * s.speed * 0.06;
      if (s.x < 0) s.x = this.config.width;
    });
    this.wisps.forEach((w) => {
      w.x -= scroll * w.speed * 0.04;
      w.y += Math.sin(this.elapsed + w.phase) * 0.15;
      if (w.x < -40) w.x = this.config.width + 40;
    });
  }

  private applyMagnet(ox: number, oy: number, dt: number, set: (x: number, y: number) => void) {
    const px = this.playerX + this.playerW / 2;
    const py = this.getPlayerRect().y + this.getPlayerRect().h / 2;
    const dx = px - ox;
    const dy = py - oy;
    const dist = Math.hypot(dx, dy);
    if (dist < MAGNET_RADIUS * 2.8 && dist > 1) {
      set(ox + (dx / dist) * MAGNET_PULL * dt, oy + (dy / dist) * MAGNET_PULL * dt);
    }
  }

  private applyPowerup(kind: PowerupKind) {
    const cx = this.playerX + this.playerW / 2;
    const cy = this.playerY;
    const accent = this.mapDirector.getTheme().accent;
    switch (kind) {
      case 'shield':
        this.shieldHits = 1;
        spawnFloatText(this.floatTexts, cx, cy - 18, 'SHIELD', accent, { scale: 1.15 });
        break;
      case 'flux':
        this.fluxTimer = FLUX_DURATION;
        spawnFloatText(this.floatTexts, cx, cy - 18, 'FLUX', '#a78bfa', { scale: 1.15 });
        break;
      case 'nova':
        this.novaTimer = NOVA_DURATION;
        spawnFloatText(this.floatTexts, cx, cy - 18, 'NOVA', PALETTE.gold, { scale: 1.2 });
        break;
      default:
        break;
    }
  }

  private getScoreMultiplier(speedBoostActive: boolean): number {
    let mult = this.config.modifiers.scoreMultiplier;
    if (speedBoostActive) mult *= 2;
    if (this.novaTimer > 0) mult *= 3;
    if (isWonderActive(this.wonderMode)) mult *= 1.15;
    return mult;
  }

  private getRoleScrollMult(role: ChunkRole): number {
    const mario = this.mechanicGimmick === 'mario_wonder';
    const table: Record<ChunkRole, number> = mario
      ? { intro: 0.9, core: 1.08, climax: 1.22, payoff: 0.92, finish: 0.96 }
      : { intro: 0.88, core: 1.06, climax: 1.2, payoff: 0.9, finish: 0.94 };
    return table[role] ?? 1;
  }

  private getGimmickScrollMult(): number {
    switch (this.mechanicGimmick) {
      case 'neon_pulse':
        return 1 + 0.15 * Math.sin(this.elapsed * 5.4);
      case 'laser_rhythm':
        return 1 + 0.11 * Math.sin(this.elapsed * 6.6);
      case 'convoy_only':
        return 1 + 0.07 * Math.sin(this.elapsed * 2.8);
      case 'aerial_strike':
        return 1 + 0.09 * Math.sin(this.elapsed * 3.6);
      case 'siege_waves':
        return 1 + 0.12 * Math.sin(this.elapsed * 4.2 + this.mapDirector.getChunkIndex());
      case 'rainbow_fly':
        return isRainbowStarActive(this.rainbowStar) ? 1.18 : 1;
      case 'mario_wonder':
        return 1.05 + 0.05 * Math.sin(this.elapsed * 3.4);
      case 'spirit_duck':
        return this.isDucking && this.isGrounded ? 0.88 : 1;
      case 'sky_danger':
        return this.isGrounded && !this.isDucking ? 0.94 : 1.06;
      case 'tutorial_light':
        return 0.92;
      default:
        return 1;
    }
  }

  private canSpawnEnemy(kind: ObstacleKind): boolean {
    const role = this.mapDirector.getChunkRole();
    if (role === 'intro' || role === 'finish') return false;

    const mech = this.activeLevel?.mechanic;

    if (mech === 'omega_siege') {
      const act = this.mapDirector.getChunkIndex();
      if (act <= 0) return false;
      if (act === 1) return kind === 'patrol_car' || kind === 'bot';
      if (act === 2) return kind === 'bomber' || kind === 'turret' || kind === 'deepfake';
      if (act === 3) return kind === 'laser_gate' || kind === 'bomber' || kind === 'turret';
      return false;
    }

    if (role === 'payoff' && (kind === 'bomber' || kind === 'turret' || kind === 'laser_gate')) {
      return false;
    }

    if (!mech) return true;

    if (mech === 'ori_first_light') {
      return role === 'climax' && kind === 'bot';
    }

    const allowed: Record<Exclude<LevelMechanicId, 'omega_siege' | 'ori_first_light'>, ObstacleKind[] | 'all' | 'none'> = {
      ori_spirit_dive: ['deepfake'],
      wonder_rainbow: ['bot', 'deepfake'],
      grid_pulse: ['bot', 'firewall', 'deepfake'],
      convoy_alley: ['patrol_car'],
      star_bridge: ['deepfake', 'firewall', 'bomber', 'turret', 'laser_gate'],
      hangar_dawn: ['bomber', 'turret'],
      laser_waltz: ['laser_gate', 'turret'],
    };

    const rule = allowed[mech as Exclude<LevelMechanicId, 'omega_siege' | 'ori_first_light'>];
    if (rule === 'all') return true;
    if (rule === 'none') return false;
    return rule.includes(kind);
  }

  private spawnObstacle(kind: ObstacleKind, lane: SpawnLane) {
    const id = ++this.entityId;
    const x = this.config.width + 55;

    if (kind === 'patrol_car') {
      const h = 38;
      const w = 62;
      this.obstacles.push({
        id,
        kind,
        x,
        y: this.groundY - h - 4,
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
        vx: -40,
      });
      return;
    }

    if (kind === 'bomber') {
      const h = 34;
      const w = 72;
      this.obstacles.push({
        id,
        kind,
        x,
        y: laneToObstacleY(this.groundY, lane, h),
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
      });
      return;
    }

    if (kind === 'turret') {
      const h = 44;
      const w = 36;
      this.obstacles.push({
        id,
        kind,
        x,
        y: laneToObstacleY(this.groundY, lane, h),
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
        shootTimer: 0.8 + Math.random() * 0.6,
      });
      return;
    }

    if (kind === 'laser_gate') {
      const h = 22;
      const w = 90;
      this.obstacles.push({
        id,
        kind,
        x,
        y: laneToObstacleY(this.groundY, lane, h),
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
      });
      return;
    }

    if (kind === 'bot') {
      const h = 46;
      const w = 40;
      const groundY = this.groundY;
      const y = lane === 'ground' ? groundY - h - 6 : laneToObstacleY(groundY, lane, h);
      this.obstacles.push({
        id,
        kind,
        x,
        y,
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
      });
      return;
    }

    if (kind === 'deepfake') {
      const h = 28;
      const w = 56;
      this.obstacles.push({
        id,
        kind,
        x,
        y: laneToObstacleY(this.groundY, lane, h),
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        passed: false,
      });
      return;
    }

    const h = 28;
    const w = 38;
    this.obstacles.push({
      id,
      kind: 'firewall',
      x,
      y: laneToObstacleY(this.groundY, lane, h),
      w,
      h,
      phase: Math.random() * Math.PI * 2,
      passed: false,
    });
  }

  private spawnProjectile(turret: ObstacleEntity) {
    const cx = turret.x;
    const cy = turret.y + turret.h / 2;
    const tx = this.playerX + this.playerW / 2;
    const ty = this.playerY + this.playerH / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 420;
    this.projectiles.push({
      id: ++this.entityId,
      x: cx,
      y: cy,
      w: 10,
      h: 4,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      ownerId: turret.id,
      color: '#ff3355',
    });
  }

  private spawnOrb(real: boolean, lane: SpawnLane) {
    this.orbs.push({
      id: ++this.entityId,
      x: this.config.width + 55,
      y: laneToOrbY(this.groundY, lane),
      radius: 13,
      collected: false,
      real,
      bobPhase: Math.random() * Math.PI * 2,
      ringAngle: Math.random() * Math.PI * 2,
    });
  }

  private spawnPowerup(kind: PowerupKind, lane: SpawnLane) {
    this.powerups.push({
      id: ++this.entityId,
      kind,
      x: this.config.width + 55,
      y: laneToPowerupY(this.groundY, lane),
      radius: 16,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  private spawnPickup(kind: PickupEntity['kind'], lane: SpawnLane) {
    this.pickups.push({
      id: ++this.entityId,
      kind,
      x: this.config.width + 55,
      y: laneToOrbY(this.groundY, lane),
      radius: kind === 'wonder_flower' ? 20 : kind === 'rainbow_star' ? 22 : 18,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  private triggerDeath() {
    if (this.dyingTimer > 0) return;
    const rect = this.getPlayerRect();
    spawnDeathExplosion(
      this.particles,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
    );
    this.shakeIntensity = 9;
    gameAudio.playDeath();
    this.dyingTimer = 0.55;
  }

  private triggerLevelComplete() {
    if (this.levelCompleteTriggered) return;
    this.levelCompleteTriggered = true;
    this.phase = 'levelcomplete';
    gameMusic.stop();
    this.stopLoop();
    const cx = this.playerX + this.playerW / 2;
    const cy = this.playerY + this.playerH / 2;
    const mech = this.activeLevel ? getMechanic(this.activeLevel.mechanic) : null;
    spawnBurst(this.particles, cx, cy, PALETTE.gold, 28, { speed: 120, glow: true });
    spawnFloatText(
      this.floatTexts,
      cx,
      cy - 40,
      '✦ NIVEL COMPLETO ✦',
      PALETTE.gold,
      { scale: 1.4, vy: -50 },
    );
    gameAudio.playPowerup();
    this.config.onGameOver({
      ...this.buildSnapshot(),
      levelComplete: true,
      wonderName: mech?.wonderName,
    });
    this.render();
    this.emitSnapshot(true);
  }

  private gameOver() {
    this.phase = 'gameover';
    gameMusic.stop();
    this.stopLoop();
    this.config.onGameOver(this.buildSnapshot());
    this.render();
  }

  private buildSnapshot(): GameSnapshot {
    const mech = this.activeLevel ? getMechanic(this.activeLevel.mechanic) : null;
    return {
      phase: this.phase,
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      orbsCollected: this.orbsCollected,
      highScore: 0,
      speed: this.speed,
      isNewHighScore: false,
      combo: this.combo,
      maxCombo: this.maxCombo,
      mapName: this.mapDirector.getMapName(),
      chunkName: this.mapDirector.getChunkName(),
      levelProgress: this.mapDirector.isFiniteLevel() ? this.mapDirector.getLevelProgress() : undefined,
      levelComplete: this.phase === 'levelcomplete',
      wonderName: mech?.wonderName,
    };
  }

  private emitSnapshot(force = false) {
    if (!force) {
      const now = performance.now();
      if (now - this.lastSnapshotEmit < 100) return;
      this.lastSnapshotEmit = now;
    }
    this.config.onSnapshot(this.buildSnapshot());
  }

  private render() {
    const mods = this.config.modifiers;
    this.renderer.draw(this.ctx, {
      width: this.config.width,
      height: this.config.height,
      groundY: this.groundY,
      distance: this.distance,
      elapsed: this.elapsed,
      runFrame: this.runFrame,
      speed: this.speed,
      phase: this.phase,
      combo: this.combo,
      score: this.score,
      magnetTimer: this.magnetTimer,
      speedBoostTimer: this.speedBoostTimer,
      fluxTimer: this.fluxTimer,
      shieldActive: this.shieldHits > 0,
      novaTimer: this.novaTimer,
      shakeX: this.shakeX,
      shakeY: this.shakeY,
      modifiers: mods,
      playerRect: this.getPlayerRect(),
      playerVy: this.playerVy,
      isGrounded: this.isGrounded,
      isDucking: this.isDucking,
      trail: this.trail,
      obstacles: this.obstacles,
      projectiles: this.projectiles,
      orbs: this.orbs,
      powerups: this.powerups,
      pickups: this.pickups,
      particles: this.particles,
      wisps: this.wisps,
      stars: this.stars,
      mapTheme: this.mapDirector.getTheme(),
      mapName: this.mapDirector.getMapName(),
      chunkName: this.mapDirector.getChunkName(),
      wingPhase: this.wingPhase,
      squashX: this.squashX,
      squashY: this.squashY,
      floatTexts: this.floatTexts,
      companion: this.companion,
      zoneCard: this.zoneCard,
      invincibleTimer: this.invincibleTimer,
      wonderTimer: this.wonderMode.timer,
      wonderVariant: this.wonderMode.variant,
      rainbowStarTimer: this.rainbowStar.timer,
      dyingTimer: this.dyingTimer,
      visualSeed: this.activeLevel ? levelVisualSeed(this.activeLevel.id) : 0,
      levelProgress: this.mapDirector.getLevelProgress(),
      chunkIndex: this.mapDirector.getChunkIndex(),
      chunkTotal: this.mapDirector.getTotalChunks(),
      showFinishGate:
        this.mapDirector.isFiniteLevel() &&
        this.mapDirector.isOnFinalChunk() &&
        this.phase === 'playing',
    });

    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 230, 102, ${this.flashAlpha})`;
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }
  }
}
