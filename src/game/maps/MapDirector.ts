import { getChunk, MAP_PLAYLISTS } from './chunks';
import type { GameLevel } from './levels';
import { getLevelTheme, getTheme } from './themes';
import type { MapChunk, MapTheme, SpawnLane, SpawnPoint } from './types';

export interface MapSpawnCallbacks {
  spawnBot: (lane: SpawnLane) => void;
  spawnDeepfake: (lane: SpawnLane) => void;
  spawnFirewall: (lane: SpawnLane) => void;
  spawnPatrolCar: (lane: SpawnLane) => void;
  spawnBomber: (lane: SpawnLane) => void;
  spawnTurret: (lane: SpawnLane) => void;
  spawnLaserGate: (lane: SpawnLane) => void;
  spawnOrb: (real: boolean, lane: SpawnLane) => void;
  spawnPowerup: (kind: 'shield' | 'flux' | 'nova', lane: SpawnLane) => void;
  spawnWonderFlower: (lane: SpawnLane) => void;
  spawnSpiritShrine: (lane: SpawnLane) => void;
  spawnRainbowStar: (lane: SpawnLane) => void;
}

export class MapDirector {
  private playlistIndex = 0;
  private chunkIndexInPlaylist = 0;
  private chunkScrollStart = 0;
  private spawnedKeys = new Set<string>();
  private worldScroll = 0;

  private chunk: MapChunk;
  private theme: MapTheme;
  private mapName: string;
  private pendingZoneAnnounce: { mapName: string; chunkName: string } | null = null;
  private lastAnnouncedChunk = '';
  private lockedPlaylistIndex: number | null = null;
  private customChunks: string[] | null = null;
  private customThemeId: string | null = null;
  private customName: string | null = null;
  private activeLevel: GameLevel | null = null;
  private finiteLevel = false;

  constructor() {
    this.chunk = getChunk(MAP_PLAYLISTS[0].chunks[0]);
    this.theme = getTheme('grove');
    this.mapName = MAP_PLAYLISTS[0].name;
    this.lastAnnouncedChunk = this.chunk.name;
  }

  reset(playlistId?: string) {
    if (playlistId) {
      const idx = MAP_PLAYLISTS.findIndex((p) => p.id === playlistId);
      this.lockedPlaylistIndex = idx >= 0 ? idx : 0;
      this.customChunks = null;
      this.customThemeId = null;
      this.customName = null;
      this.activeLevel = null;
      this.finiteLevel = false;
    } else if (!this.customChunks) {
      this.lockedPlaylistIndex = null;
      this.activeLevel = null;
      this.finiteLevel = false;
    }

    this.playlistIndex = this.lockedPlaylistIndex ?? 0;
    this.chunkIndexInPlaylist = 0;
    this.chunkScrollStart = 0;
    this.spawnedKeys.clear();
    this.worldScroll = 0;
    this.applyThemeForCurrentChunk();

    const chunks = this.getActiveChunkIds();
    this.chunk = getChunk(chunks[0]);
    this.mapName = this.customName ?? MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length].name;
    this.pendingZoneAnnounce = { mapName: this.mapName, chunkName: this.chunk.name };
    this.lastAnnouncedChunk = '';
  }

  setPlaylist(playlistId: string) {
    this.customChunks = null;
    this.customThemeId = null;
    this.customName = null;
    this.activeLevel = null;
    this.finiteLevel = false;
    this.reset(playlistId);
  }

  setLevel(level: GameLevel) {
    this.activeLevel = level;
    this.customChunks = level.chunks;
    this.customThemeId = level.themeId;
    this.customName = `${level.number} · ${level.name}`;
    this.finiteLevel = true;
    this.lockedPlaylistIndex = null;
    this.reset();
  }

  isFiniteLevel(): boolean {
    return this.finiteLevel;
  }

  getChunkIndex(): number {
    return this.chunkIndexInPlaylist;
  }

  getTotalChunks(): number {
    return this.getActiveChunkIds().length;
  }

  getLevelProgress(): number {
    if (!this.finiteLevel || !this.customChunks?.length) return 0;
    const chunks = this.getActiveChunkIds();
    const totalWidth = chunks.reduce((sum, id) => sum + getChunk(id).width, 0);
    if (totalWidth <= 0) return 0;
    return Math.min(1, this.worldScroll / totalWidth);
  }

  isOnFinalChunk(): boolean {
    const chunks = this.getActiveChunkIds();
    return this.chunkIndexInPlaylist >= chunks.length - 1;
  }

  getTotalLevelWidth(): number {
    if (!this.finiteLevel) return 0;
    return this.getActiveChunkIds().reduce((sum, id) => sum + getChunk(id).width, 0);
  }

  getChunkRole() {
    return this.chunk.role ?? 'core';
  }

  /** True when scroll crosses the finish gate at end of level */
  isLevelFinished(): boolean {
    if (!this.finiteLevel || !this.customChunks?.length) return false;
    const total = this.getTotalLevelWidth();
    if (total <= 0) return false;
    return this.worldScroll >= total - 140;
  }

  getPlaylistId(): string {
    if (this.customChunks) return 'custom_level';
    return MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length].id;
  }

  consumeZoneAnnounce(): { mapName: string; chunkName: string } | null {
    const announce = this.pendingZoneAnnounce;
    this.pendingZoneAnnounce = null;
    return announce;
  }

  private getActiveChunkIds(): string[] {
    if (this.customChunks?.length) return this.customChunks;
    return MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length].chunks;
  }

  private applyThemeForCurrentChunk() {
    if (this.activeLevel) {
      const zoneAccent = this.chunk?.zoneAccent;
      this.theme = getLevelTheme(this.activeLevel, this.chunkIndexInPlaylist, zoneAccent);
      return;
    }
    if (this.customThemeId) {
      this.theme = getTheme(this.customThemeId);
      return;
    }
    const playlist = MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length];
    this.theme = getTheme(playlist.themeId);
    this.mapName = playlist.name;
  }

  getTheme(): MapTheme {
    return this.theme;
  }

  getMapName(): string {
    return this.mapName;
  }

  getChunkName(): string {
    return this.chunk.name;
  }

  getActiveLevel(): GameLevel | null {
    return this.activeLevel;
  }

  advanceScroll(pixels: number) {
    this.worldScroll += pixels;
    this.tryAdvanceChunk();
  }

  update(callbacks: MapSpawnCallbacks) {
    const localScroll = this.worldScroll - this.chunkScrollStart;

    for (const spawn of this.chunk.spawns) {
      const key = `${this.playlistIndex}-${this.chunkIndexInPlaylist}-${spawn.offsetX}-${spawn.type}-${spawn.lane}`;
      if (this.spawnedKeys.has(key)) continue;
      if (localScroll < spawn.offsetX) continue;

      this.spawnedKeys.add(key);
      this.executeSpawn(spawn, callbacks);
    }
  }

  private executeSpawn(spawn: SpawnPoint, callbacks: MapSpawnCallbacks) {
    switch (spawn.type) {
      case 'bot':
        callbacks.spawnBot(spawn.lane);
        break;
      case 'deepfake':
        callbacks.spawnDeepfake(spawn.lane);
        break;
      case 'firewall':
        callbacks.spawnFirewall(spawn.lane);
        break;
      case 'patrol_car':
        callbacks.spawnPatrolCar(spawn.lane);
        break;
      case 'bomber':
        callbacks.spawnBomber(spawn.lane);
        break;
      case 'turret':
        callbacks.spawnTurret(spawn.lane);
        break;
      case 'laser_gate':
        callbacks.spawnLaserGate(spawn.lane);
        break;
      case 'orb_real':
        callbacks.spawnOrb(true, spawn.lane);
        break;
      case 'orb_fake':
        callbacks.spawnOrb(false, spawn.lane);
        break;
      case 'powerup_shield':
        callbacks.spawnPowerup('shield', spawn.lane);
        break;
      case 'powerup_flux':
        callbacks.spawnPowerup('flux', spawn.lane);
        break;
      case 'powerup_nova':
        callbacks.spawnPowerup('nova', spawn.lane);
        break;
      case 'wonder_flower':
        callbacks.spawnWonderFlower(spawn.lane);
        break;
      case 'spirit_shrine':
        callbacks.spawnSpiritShrine(spawn.lane);
        break;
      case 'rainbow_star':
        callbacks.spawnRainbowStar(spawn.lane);
        break;
      default:
        break;
    }
  }

  private tryAdvanceChunk() {
    const localScroll = this.worldScroll - this.chunkScrollStart;
    if (localScroll < this.chunk.width) return;

    this.chunkIndexInPlaylist += 1;
    this.chunkScrollStart = this.worldScroll;
    this.spawnedKeys.clear();

    const chunks = this.getActiveChunkIds();

    if (this.chunkIndexInPlaylist >= chunks.length) {
      if (this.finiteLevel && this.customChunks) {
        this.chunkIndexInPlaylist = chunks.length - 1;
        this.chunk = getChunk(chunks[chunks.length - 1]);
        return;
      }
      this.chunkIndexInPlaylist = 0;
      if (!this.customChunks && this.lockedPlaylistIndex === null) {
        this.playlistIndex += 1;
      } else if (this.lockedPlaylistIndex !== null) {
        this.playlistIndex = this.lockedPlaylistIndex;
      }
    }

    const activeChunks = this.getActiveChunkIds();
    this.chunk = getChunk(activeChunks[this.chunkIndexInPlaylist]);
    this.mapName = this.customName ?? MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length].name;
    this.applyThemeForCurrentChunk();

    if (this.chunk.name !== this.lastAnnouncedChunk) {
      this.lastAnnouncedChunk = this.chunk.name;
      this.pendingZoneAnnounce = { mapName: this.mapName, chunkName: this.chunk.name };
    }
  }
}
