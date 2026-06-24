import { getChunk, MAP_PLAYLISTS } from './chunks';
import { getTheme } from './themes';
import type { MapChunk, MapTheme, SpawnLane, SpawnPoint } from './types';

export interface MapSpawnCallbacks {
  spawnBot: (lane: SpawnLane) => void;
  spawnDeepfake: (lane: SpawnLane) => void;
  spawnFirewall: (lane: SpawnLane) => void;
  spawnOrb: (real: boolean, lane: SpawnLane) => void;
  spawnPowerup: (kind: 'shield' | 'flux' | 'nova', lane: SpawnLane) => void;
  spawnWonderFlower: (lane: SpawnLane) => void;
  spawnSpiritShrine: (lane: SpawnLane) => void;
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

  constructor() {
    this.chunk = getChunk(MAP_PLAYLISTS[0].chunks[0]);
    this.theme = getTheme(MAP_PLAYLISTS[0].themeId);
    this.mapName = MAP_PLAYLISTS[0].name;
    this.lastAnnouncedChunk = this.chunk.name;
  }

  reset(playlistId?: string) {
    if (playlistId) {
      const idx = MAP_PLAYLISTS.findIndex((p) => p.id === playlistId);
      this.lockedPlaylistIndex = idx >= 0 ? idx : 0;
    } else {
      this.lockedPlaylistIndex = null;
    }
    this.playlistIndex = this.lockedPlaylistIndex ?? 0;
    this.chunkIndexInPlaylist = 0;
    this.chunkScrollStart = 0;
    this.spawnedKeys.clear();
    this.worldScroll = 0;
    this.applyPlaylist(this.playlistIndex);
    const playlist = MAP_PLAYLISTS[this.playlistIndex];
    this.chunk = getChunk(playlist.chunks[0]);
    this.mapName = playlist.name;
    this.pendingZoneAnnounce = { mapName: this.mapName, chunkName: this.chunk.name };
    this.lastAnnouncedChunk = '';
  }

  setPlaylist(playlistId: string) {
    this.reset(playlistId);
  }

  getPlaylistId(): string {
    return MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length].id;
  }

  consumeZoneAnnounce(): { mapName: string; chunkName: string } | null {
    const announce = this.pendingZoneAnnounce;
    this.pendingZoneAnnounce = null;
    return announce;
  }

  private applyPlaylist(index: number) {
    const playlist = MAP_PLAYLISTS[index % MAP_PLAYLISTS.length];
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

    const playlist = MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length];

    if (this.chunkIndexInPlaylist >= playlist.chunks.length) {
      this.chunkIndexInPlaylist = 0;
      if (this.lockedPlaylistIndex === null) {
        this.playlistIndex += 1;
        this.applyPlaylist(this.playlistIndex);
      } else {
        this.playlistIndex = this.lockedPlaylistIndex;
      }
    }

    const active = MAP_PLAYLISTS[this.playlistIndex % MAP_PLAYLISTS.length];
    this.chunk = getChunk(active.chunks[this.chunkIndexInPlaylist]);
    this.mapName = active.name;

    if (this.chunk.name !== this.lastAnnouncedChunk) {
      this.lastAnnouncedChunk = this.chunk.name;
      this.pendingZoneAnnounce = { mapName: this.mapName, chunkName: this.chunk.name };
    }
  }
}
