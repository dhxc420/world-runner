'use client';

import { useCallback, useEffect, useState } from 'react';
import { WORLD_LEVELS, type GameLevel } from '@/game/maps/levels';
import { getTheme } from '@/game/maps/themes';
import { gameStorage } from '@/lib/gameStorage';

interface LevelWorldMapProps {
  onSelectLevel: (level: GameLevel) => void;
  refreshKey?: number;
}

const DIFFICULTY_COLORS: Record<GameLevel['difficulty'], string> = {
  easy: '#4ade80',
  normal: '#38bdf8',
  hard: '#f87171',
};

const DIFFICULTY_LABELS: Record<GameLevel['difficulty'], string> = {
  easy: 'Fácil',
  normal: 'Normal',
  hard: 'Difícil',
};

const WORLD_ZONES = [
  {
    id: 1,
    label: 'Acto I',
    title: 'Ciudad Caída',
    subtitle: 'Ruinas del mundo antiguo',
    style: { left: '6%', top: '58%', width: '38%', height: '32%' },
  },
  {
    id: 2,
    label: 'Acto II',
    title: 'Corredor Grid',
    subtitle: 'Neón entre escombros',
    style: { left: '48%', top: '42%', width: '46%', height: '34%' },
  },
  {
    id: 3,
    label: 'Acto III',
    title: 'Zona de Guerra',
    subtitle: 'Hangar industrial',
    style: { left: '10%', top: '6%', width: '72%', height: '30%' },
  },
] as const;

export function LevelWorldMap({ onSelectLevel, refreshKey = 0 }: LevelWorldMapProps) {
  const [progressTick, setProgressTick] = useState(0);
  const [progress, setProgress] = useState<{ unlocked: string[]; completed: string[] }>({
    unlocked: ['1-1'],
    completed: [],
  });

  const refreshProgress = useCallback(() => {
    setProgressTick((t) => t + 1);
  }, []);

  useEffect(() => {
    gameStorage.migrateLevelProgressIfNeeded();
    setProgress({
      unlocked: gameStorage.getUnlockedLevels(),
      completed: gameStorage.getCompletedLevels(),
    });
    const onFocus = () => refreshProgress();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [progressTick, refreshKey, refreshProgress]);

  const { unlocked, completed } = progress;

  const isUnlocked = (level: GameLevel) => {
    if (!level.unlockAfter) return true;
    return unlocked.includes(level.id);
  };

  return (
    <div className="level-world relative h-full w-full overflow-hidden" key={progressTick}>
      <div className="level-world__sky" aria-hidden="true" />
      <div className="level-world__horizon" aria-hidden="true" />
      <div className="level-world__grid-floor" aria-hidden="true" />
      <div className="level-world__scanlines" aria-hidden="true" />
      <svg className="level-world__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="path-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 10 78 Q 26 62 44 48 T 86 38 T 68 14"
          fill="none"
          stroke="rgba(0, 229, 255, 0.55)"
          strokeWidth="1.8"
          filter="url(#path-glow)"
        />
        <path
          d="M 10 78 Q 26 62 44 48 T 86 38 T 68 14"
          fill="none"
          stroke="rgba(0, 255, 213, 0.25)"
          strokeWidth="4"
          strokeDasharray="3 4"
          opacity="0.6"
        />
      </svg>

      {WORLD_ZONES.map((zone) => (
        <div
          key={zone.id}
          className="level-world__zone"
          style={zone.style}
          aria-hidden="true"
        >
          <span className="level-world__zone-label">{zone.label}</span>
          <span className="level-world__zone-title">{zone.title}</span>
          <span className="level-world__zone-sub">{zone.subtitle}</span>
        </div>
      ))}

      <div className="level-world__content relative z-10 flex h-full flex-col px-4 pt-4">
        <header className="shrink-0 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-pink-300/90">
            Operación Salvación
          </p>
          <h1 className="arcade-glow-text mt-1 text-xl font-bold text-white">Ruta de la Mariposa</h1>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-white/50">
            Tras la guerra, el Grid devoró la ciudad. Sigue el camino de luz entre ruinas.
          </p>
          <div className="level-world__legend mt-2 flex flex-wrap justify-center gap-3">
            {(['easy', 'normal', 'hard'] as const).map((d) => (
              <span key={d} className="level-world__legend-item">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: DIFFICULTY_COLORS[d] }}
                />
                {DIFFICULTY_LABELS[d]}
              </span>
            ))}
          </div>
        </header>

        <div className="level-world__nodes relative mt-2 min-h-0 flex-1">
          {WORLD_LEVELS.map((level) => {
            const open = isUnlocked(level);
            const theme = getTheme(level.themeId);
            const done = completed.includes(level.id);
            const stars = gameStorage.getLevelStarCount(level.id, level.starScore, level.starOrbs);
            const prevLevel = level.unlockAfter
              ? WORLD_LEVELS.find((l) => l.id === level.unlockAfter)
              : null;
            return (
              <div
                key={level.id}
                className="level-node-wrap"
                style={{
                  left: `${level.mapPosition.x}%`,
                  top: `${level.mapPosition.y}%`,
                }}
              >
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => open && onSelectLevel(level)}
                  className={`level-node level-node--${level.difficulty} ${open ? '' : 'level-node--locked'}`}
                  style={{
                    ['--level-accent' as string]: theme.accent,
                    ['--level-diff' as string]: DIFFICULTY_COLORS[level.difficulty],
                  }}
                  aria-label={`${level.number} ${level.name}`}
                >
                  <span className="level-node__num">{level.number}</span>
                  {!open && <span className="level-node__lock">🔒</span>}
                  {open && stars > 0 && (
                    <span className="level-node__stars">
                      {'★'.repeat(stars)}
                      {'☆'.repeat(3 - stars)}
                    </span>
                  )}
                </button>
                <p className="level-node__label">{level.name}</p>
                {open && !done && (
                  <p className="level-node__hint level-node__hint--new">Nuevo</p>
                )}
                {open && done && (
                  <p className="level-node__hint level-node__hint--done">Completado</p>
                )}
                {!open && prevLevel && (
                  <p className="level-node__hint">Completa {prevLevel.number}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
