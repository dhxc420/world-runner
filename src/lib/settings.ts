import { gameAudio } from '@/game/audio';
import { gameMusic } from '@/game/music';

const MUSIC_KEY = 'world-runner-music-enabled';

export function isMusicEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MUSIC_KEY) !== 'false';
}

export function setMusicEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MUSIC_KEY, enabled ? 'true' : 'false');
  gameMusic.setMuted(!enabled);
  gameAudio.setMuted(!enabled);
  if (!enabled) gameMusic.stop();
}

export function applyMusicPreference() {
  const enabled = isMusicEnabled();
  gameMusic.setMuted(!enabled);
  gameAudio.setMuted(!enabled);
  if (!enabled) gameMusic.stop();
}
