'use client';

import Link from 'next/link';
import type { GameLevel } from '@/game/maps/levels';
import { LevelWorldMap } from './LevelWorldMap';

interface PlayHubProps {
  onStartLevel: (level: GameLevel) => void;
  mapRefreshKey?: number;
}

export function PlayHub({ onStartLevel, mapRefreshKey }: PlayHubProps) {
  return (
    <div
      className="play-hub relative flex h-dvh flex-col overflow-hidden bg-[#030812] text-white"
      style={{ ['--play-hub-footer-height' as string]: '3.75rem' }}
    >
      <div className="play-hub__tron-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <LevelWorldMap onSelectLevel={onStartLevel} refreshKey={mapRefreshKey} />
      </div>
      <footer className="play-hub-footer relative z-20 shrink-0 border-t border-white/10 bg-[#030812]/92 px-4 pt-3 backdrop-blur-xl">
        <Link
          href="/home"
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-cyan-300/85 transition hover:text-cyan-200"
        >
          ← Menú principal
        </Link>
      </footer>
    </div>
  );
}
