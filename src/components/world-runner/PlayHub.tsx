'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MAP_PLAYLISTS } from '@/game/maps/chunks';
import { getTheme } from '@/game/maps/themes';
import { MapHubPreview } from './MapHubPreview';

const MISSION_BLURBS: Record<string, string> = {
  grove_run: 'Sector bosque bioluminiscente. Tutorial de salto y primeros drones.',
  grid_run: 'Corredor neón orbital. Deepfakes y firewalls en cadena.',
  hangar_run: 'Cubierta hangar M-7. Patrullas dobles y zona de recompensa.',
};

function playlistIndex(id?: string) {
  if (!id) return 0;
  const i = MAP_PLAYLISTS.findIndex((p) => p.id === id);
  return i >= 0 ? i : 0;
}

interface PlayHubProps {
  onStartMission: (playlistId: string) => void;
  initialPlaylistId?: string;
}

export function PlayHub({ onStartMission, initialPlaylistId }: PlayHubProps) {
  const [index, setIndex] = useState(() => playlistIndex(initialPlaylistId));

  useEffect(() => {
    if (initialPlaylistId) setIndex(playlistIndex(initialPlaylistId));
  }, [initialPlaylistId]);
  const mission = MAP_PLAYLISTS[index];
  const theme = useMemo(() => getTheme(mission.themeId), [mission.themeId]);

  const prev = () => setIndex((i) => (i - 1 + MAP_PLAYLISTS.length) % MAP_PLAYLISTS.length);
  const next = () => setIndex((i) => (i + 1) % MAP_PLAYLISTS.length);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#0b1026] text-white">
      <MapHubPreview themeId={mission.themeId} />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1026]/75 via-[#0b1026]/20 to-[#0b1026]/90" />

      <div className="relative z-10 flex flex-1 flex-col px-5 pb-8 pt-6">
        <header className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-amber-300/90">
            ◆ Operación Grid ◆
          </p>
          <h1 className="mt-2 font-mono text-2xl font-bold uppercase tracking-wider text-white drop-shadow-[0_0_12px_rgba(0,255,213,0.35)]">
            Selección de misión
          </h1>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center">
          <div
            className="w-full max-w-sm rounded-lg border-2 p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            style={{
              borderColor: theme.accent + '99',
              background: `linear-gradient(135deg, ${theme.auroraA}ee, ${theme.void}f0)`,
              boxShadow: `0 0 30px ${theme.accent}33, inset 0 0 60px rgba(0,0,0,0.4)`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/20 bg-black/30 font-mono text-lg text-amber-200 hover:bg-white/10"
                aria-label="Misión anterior"
              >
                ◀
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: theme.accent }}
                >
                  Misión {index + 1}/{MAP_PLAYLISTS.length}
                </p>
                <h2 className="mt-1 truncate font-mono text-xl font-bold uppercase tracking-wide text-white">
                  {mission.name}
                </h2>
                <p className="mt-1 text-xs text-violet-100/70">{theme.name}</p>
              </div>

              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/20 bg-black/30 font-mono text-lg text-amber-200 hover:bg-white/10"
                aria-label="Siguiente misión"
              >
                ▶
              </button>
            </div>

            <p className="mt-4 text-center text-sm leading-relaxed text-violet-100/80">
              {MISSION_BLURBS[mission.id] ?? 'Ruta endless con chunks diseñados a mano.'}
            </p>

            <div className="mt-4 flex justify-center gap-1.5">
              {MAP_PLAYLISTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="h-2 w-2 rounded-full transition-all"
                  style={{
                    background: i === index ? theme.accent : 'rgba(255,255,255,0.25)',
                    transform: i === index ? 'scale(1.3)' : undefined,
                  }}
                  aria-label={`Seleccionar ${p.name}`}
                />
              ))}
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            className="mt-8 min-w-[240px] font-mono uppercase tracking-wider shadow-[0_0_28px_rgba(255,230,102,0.35)]"
            onClick={() => onStartMission(mission.id)}
          >
            ▶ Iniciar misión
          </Button>

          <p className="mt-3 animate-pulse font-mono text-[10px] uppercase tracking-[0.35em] text-amber-200/60">
            Insert coin · Ready
          </p>
        </div>

        <Link
          href="/home"
          className="mt-auto text-center text-sm text-cyan-400/70 underline-offset-2 hover:text-cyan-300 hover:underline"
        >
          ← Menú principal
        </Link>
      </div>
    </div>
  );
}
