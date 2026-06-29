'use client';

import { Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/leaderboardStore';

interface LeaderboardPanelProps {
  variant?: 'compact' | 'full';
  showHeader?: boolean;
}

export function LeaderboardPanel({ variant = 'compact', showHeader = true }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isFull = variant === 'full';

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const displayEntries = isFull ? entries : entries.slice(0, 5);

  return (
    <div className={`home-leaderboard ${isFull ? 'home-leaderboard--full' : ''}`}>
      {showHeader && (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-300/90">
              Ranking Global
            </p>
            <p className="mt-0.5 text-xs text-white/50">Solo humanos verificados con World ID</p>
          </div>
          <span className="rounded-full border border-pink-400/30 bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-200">
            LIVE
          </span>
        </div>
      )}

      <div className={`${showHeader ? 'mt-3' : ''} space-y-2 ${isFull ? 'max-h-[60dvh] overflow-y-auto pr-1' : ''}`}>
        {loading && (
          <p className="py-4 text-center text-sm text-white/40">Cargando ranking…</p>
        )}
        {!loading && displayEntries.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-3xl" aria-hidden="true">
              ✦
            </p>
            <p className="mt-3 text-sm font-medium text-white/70">Aún no hay corredores verificados</p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Verifica con World ID, completa una carrera y sube tu puntuación para aparecer aquí.
            </p>
          </div>
        )}
        {displayEntries.map((entry, i) => (
          <div
            key={`${entry.walletAddress}-${i}`}
            className={`home-leaderboard__row ${i < 3 && isFull ? `home-leaderboard__row--top${i + 1}` : ''}`}
          >
            <span className="home-leaderboard__rank">{i + 1}</span>
            {entry.profilePictureUrl ? (
              <Marble src={entry.profilePictureUrl} className="h-8 w-8 shrink-0" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-sm">
                🦋
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{entry.username}</p>
              <p className="truncate text-[11px] text-white/45">{entry.levelName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-cyan-200">{entry.score.toLocaleString()}</p>
              <p className="text-[10px] text-white/40">{entry.distance}m</p>
            </div>
            <span className="text-[10px] text-amber-300/80" title="Verificado World ID">
              ✦
            </span>
          </div>
        ))}
        {!loading && !isFull && entries.length > 5 && (
          <p className="pt-1 text-center text-[11px] text-white/35">
            +{entries.length - 5} más en Ranking
          </p>
        )}
      </div>
    </div>
  );
}
