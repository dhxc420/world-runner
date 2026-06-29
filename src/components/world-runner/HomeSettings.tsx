'use client';

import { isMusicEnabled, setMusicEnabled } from '@/lib/settings';
import { gameMusic } from '@/game/music';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HomeSettings() {
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    setMusicOn(isMusicEnabled());
  }, []);

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    if (next) {
      gameMusic.unlock();
      gameMusic.startHomeTron();
    }
  };

  return (
    <div className="home-settings">
      <button
        type="button"
        className="home-settings__row"
        onClick={toggleMusic}
        aria-pressed={musicOn}
      >
        <span className="text-lg" aria-hidden="true">
          {musicOn ? '🔊' : '🔇'}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-white">Música</p>
          <p className="text-xs text-white/50">
            {musicOn ? 'Ambient Grid · sin voces' : 'Silenciada'}
          </p>
        </div>
        <span
          className={`home-settings__toggle ${musicOn ? 'home-settings__toggle--on' : ''}`}
          aria-hidden="true"
        />
      </button>
      <Link href="/terms" className="home-settings__link">
        Términos y condiciones
      </Link>
    </div>
  );
}
