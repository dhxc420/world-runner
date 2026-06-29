'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import type { GameLevel } from '@/game/maps/levels';
import { getChunk } from '@/game/maps/chunks';
import { getMechanic, getLevelPaceLabel } from '@/game/maps/levelMechanics';
import { WORLD_LEVELS, estimateLevelDurationSec } from '@/game/maps/levels';
import { getTheme } from '@/game/maps/themes';
import type { GameModifiers } from '@/game/types';
import { useGame } from '@/hooks/useGame';
import { gameStorage } from '@/lib/gameStorage';
import { PlayHub } from './PlayHub';
import { TouchGameControls } from './TouchGameControls';

const GAME_BACK_STATE = { worldRunnerGame: true } as const;

type PlayView = 'hub' | 'briefing';

export function GameCanvas() {
  const { verifiedHuman, premiumSkin, wonderTrail, spiritAura, continues, speedBoosts, magnetBoosts, consumePreRunBoost, refresh } =
    usePlayerProgress();
  const [view, setView] = useState<PlayView>('hub');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel>(WORLD_LEVELS[0]);
  const [useSpeedBoost, setUseSpeedBoost] = useState(false);
  const [useMagnetBoost, setUseMagnetBoost] = useState(false);
  const [started, setStarted] = useState(false);
  const [continuesLeft, setContinuesLeft] = useState(continues);
  const [continuedThisRun, setContinuedThisRun] = useState(false);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  const selectedTheme = useMemo(() => getTheme(selectedLevel.themeId), [selectedLevel.themeId]);

  const selectedMechanic = useMemo(() => getMechanic(selectedLevel.mechanic), [selectedLevel.mechanic]);
  const paceLabel = useMemo(() => getLevelPaceLabel(selectedLevel), [selectedLevel]);

  useEffect(() => {
    setContinuesLeft(continues);
  }, [continues]);

  const modifiers = useMemo<GameModifiers>(
    () => ({
      scoreMultiplier: verifiedHuman ? 1.5 : 1,
      verifiedSkin: verifiedHuman,
      premiumSkin,
      wonderTrail,
      spiritAura,
      magnetActive: false,
      speedBoostActive: false,
      hasContinue: continuesLeft > 0,
      doubleJump: verifiedHuman,
    }),
    [verifiedHuman, premiumSkin, wonderTrail, spiritAura, continuesLeft],
  );

  const { canvasRef, containerRef, snapshot, start, restart, input, tryContinue, setLevel, returnToHub, pause, resume, resetSnapshot } =
    useGame({
      modifiers,
      onAfterContinue: refresh,
    });

  const [briefingProgress, setBriefingProgress] = useState<{
    completed: boolean;
    stars: 0 | 1 | 2 | 3;
  }>({ completed: false, stars: 0 });
  const estDuration = useMemo(() => estimateLevelDurationSec(selectedLevel), [selectedLevel]);

  useEffect(() => {
    gameStorage.migrateLevelProgressIfNeeded();
    setBriefingProgress({
      completed: gameStorage.isLevelCompleted(selectedLevel.id),
      stars: gameStorage.getLevelStarCount(
        selectedLevel.id,
        selectedLevel.starScore,
        selectedLevel.starOrbs,
      ),
    });
  }, [selectedLevel, snapshot.phase]);

  useEffect(() => {
    if (snapshot.phase === 'gameover' || snapshot.phase === 'levelcomplete') refresh();
  }, [snapshot.phase, refresh]);

  const phaseRef = useRef(snapshot.phase);
  phaseRef.current = snapshot.phase;
  const autoPausedRef = useRef(false);

  useEffect(() => {
    if (!started) return;
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === 'playing') {
        autoPausedRef.current = true;
        pause();
      } else if (!document.hidden && autoPausedRef.current) {
        autoPausedRef.current = false;
        resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [started, pause, resume]);

  const handleStartLevel = useCallback(
    (level: GameLevel) => {
      setStarted(false);
      setContinuedThisRun(false);
      resetSnapshot();
      setSelectedLevel(level);
      setLevel(level);
      setView('briefing');
    },
    [resetSnapshot, setLevel],
  );

  const goToHub = useCallback(() => {
    setStarted(false);
    setContinuedThisRun(false);
    setUseSpeedBoost(false);
    setUseMagnetBoost(false);
    returnToHub();
    setMapRefreshKey((k) => k + 1);
    setView('hub');
  }, [returnToHub]);

  const handleNextLevel = useCallback(() => {
    const idx = WORLD_LEVELS.findIndex((l) => l.id === selectedLevel.id);
    const candidate = idx >= 0 && idx < WORLD_LEVELS.length - 1 ? WORLD_LEVELS[idx + 1] : null;
    const unlocked = gameStorage.getUnlockedLevels();

    setStarted(false);
    setContinuedThisRun(false);
    setUseSpeedBoost(false);
    setUseMagnetBoost(false);
    returnToHub();

    if (candidate && unlocked.includes(candidate.id)) {
      setSelectedLevel(candidate);
      setLevel(candidate);
      setView('briefing');
    } else {
      setMapRefreshKey((k) => k + 1);
      setView('hub');
    }
  }, [returnToHub, selectedLevel.id, setLevel]);

  const beginRun = useCallback(() => {
    const speedBoost = useSpeedBoost ? consumePreRunBoost('speed') : false;
    const magnetBoost = useMagnetBoost ? consumePreRunBoost('magnet') : false;
    if (speedBoost || magnetBoost) refresh();
    setContinuedThisRun(false);
    setStarted(true);
    start({
      speedBoost,
      magnetBoost,
      level: selectedLevel,
      speedMultiplier: selectedLevel.speedMultiplier,
    });
  }, [consumePreRunBoost, refresh, selectedLevel, start, useMagnetBoost, useSpeedBoost]);

  useEffect(() => {
    const inRun =
      started && (snapshot.phase === 'playing' || snapshot.phase === 'paused');
    if (!inRun) return;

    const trapBack = () => {
      pause();
      window.history.pushState(GAME_BACK_STATE, '');
    };

    window.history.pushState(GAME_BACK_STATE, '');
    window.addEventListener('popstate', trapBack);
    return () => window.removeEventListener('popstate', trapBack);
  }, [pause, snapshot.phase, started]);

  useEffect(() => {
    if (!started) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        input('jump');
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        input('duck');
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        input('jump_release');
      }
      if (e.code === 'ArrowDown') input('release');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [input, started]);

  const isPlaying = snapshot.phase === 'playing';
  const isPaused = snapshot.phase === 'paused';
  const isGameOver = snapshot.phase === 'gameover';
  const isLevelComplete = snapshot.phase === 'levelcomplete' || snapshot.levelComplete;
  const showContinue = continuesLeft > 0 && !continuedThisRun && !isLevelComplete;

  const handleContinue = () => {
    if (tryContinue()) {
      setContinuesLeft((n) => Math.max(0, n - 1));
      setContinuedThisRun(true);
    }
  };

  const handleRestart = () => {
    setContinuedThisRun(false);
    restart();
  };

  return (
    <div className="relative flex h-dvh w-full flex-col bg-[#030812]">
      <div ref={containerRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className={`h-full w-full touch-none transition-opacity duration-300 ${
            view === 'hub' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        />

        {started && (isPlaying || isPaused) && (
          <>
            <button
              type="button"
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#030812]/65 text-lg text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
              onClick={() => (isPaused ? resume() : pause())}
              aria-label={isPaused ? 'Reanudar juego' : 'Pausar juego'}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
            <div className="pointer-events-none absolute bottom-[8.75rem] left-3 right-3 z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="max-w-[55%] truncate rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-sm">
                  {snapshot.chunkName || snapshot.mapName}
                </span>
                <span className="shrink-0 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-cyan-300/90 backdrop-blur-sm">
                  {Math.round(snapshot.speed)}
                </span>
              </div>
              {snapshot.levelProgress !== undefined && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-[width] duration-200"
                    style={{ width: `${Math.min(100, (snapshot.levelProgress ?? 0) * 100)}%` }}
                  />
                </div>
              )}
            </div>
            <TouchGameControls onInput={input} disabled={!isPlaying} />
          </>
        )}

        {view === 'hub' && (
          <div className="absolute inset-0 z-20">
            <PlayHub onStartLevel={handleStartLevel} mapRefreshKey={mapRefreshKey} />
          </div>
        )}

        {view === 'briefing' && !started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#030812]/75 p-6 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-20 left-1/4 h-64 w-64 rounded-full blur-3xl"
                style={{ background: `${selectedTheme.accent}18` }}
              />
              <div className="absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
            </div>

            <div className="glass-panel-strong max-w-sm p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/90">
                Briefing
              </p>
              <h2
                className="arcade-glow-text mt-2 text-2xl font-semibold tracking-tight"
                style={{ color: selectedTheme.accent }}
              >
                {selectedLevel.number} · {selectedLevel.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {selectedLevel.blurb}
              </p>
              <p className="mt-2 text-xs text-white/45">
                {selectedMechanic.wonderName}
              </p>
              <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-left text-xs leading-relaxed text-amber-100/90">
                {selectedMechanic.mobileTip}
              </p>
              <p className="mt-2 text-xs font-semibold text-cyan-300/85">
                Ritmo: {paceLabel}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/40">
                Zonas:{' '}
                {selectedLevel.chunks.map((id) => getChunk(id).name).join(' → ')}
              </p>
              <p className="mt-2 text-xs text-white/45">
                ~{Math.floor(estDuration / 60)}:{String(estDuration % 60).padStart(2, '0')} min ·{' '}
                {briefingProgress.stars > 0
                  ? '★'.repeat(briefingProgress.stars) + '☆'.repeat(3 - briefingProgress.stars)
                  : 'Sin completar'}
              </p>
            </div>
            {(speedBoosts > 0 || magnetBoosts > 0) && (
              <p className="text-xs text-cyan-300/80">
                Boosts ganados: {speedBoosts > 0 ? `⚡ Rush ×${speedBoosts}` : ''}
                {speedBoosts > 0 && magnetBoosts > 0 ? ' · ' : ''}
                {magnetBoosts > 0 ? `🧲 Magnet ×${magnetBoosts}` : ''}
              </p>
            )}
            {verifiedHuman && (
              <p className="text-xs text-amber-300/80">✦ Doble salto desbloqueado (verificado)</p>
            )}

            <div className="flex gap-4 text-xs text-white/60">
              <label
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                  speedBoosts > 0
                    ? 'border-cyan-500/20 bg-cyan-500/5'
                    : 'border-white/10 opacity-50'
                }`}
                title="Solo se ganan jugando — no se venden"
              >
                <input
                  type="checkbox"
                  checked={useSpeedBoost}
                  disabled={speedBoosts <= 0}
                  onChange={(e) => setUseSpeedBoost(e.target.checked)}
                  className="accent-cyan-400"
                />
                ⚡ Rush (ganado) {speedBoosts > 0 ? `(${speedBoosts})` : ''}
              </label>
              <label
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                  magnetBoosts > 0
                    ? 'border-violet-500/20 bg-violet-500/5'
                    : 'border-white/10 opacity-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={useMagnetBoost}
                  disabled={magnetBoosts <= 0}
                  onChange={(e) => setUseMagnetBoost(e.target.checked)}
                  className="accent-violet-400"
                />
                🧲 Magnet (ganado) {magnetBoosts > 0 ? `(${magnetBoosts})` : ''}
              </label>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={beginRun}
              className="min-w-[200px] font-mono uppercase tracking-wider shadow-[0_0_30px_rgba(0,255,213,0.3)]"
            >
              {briefingProgress.completed ? '▶ Rejugar nivel' : '▶ Entrar al nivel'}
            </Button>
            <button
              type="button"
              onClick={goToHub}
              className="text-sm text-cyan-400/70 underline-offset-2 hover:text-cyan-300 hover:underline"
            >
              ← Volver a mapas
            </button>
          </div>
        )}

        {(started && (isGameOver || isLevelComplete)) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#030812]/80 p-6 backdrop-blur-xl">
            <div className="glass-panel-strong w-full max-w-sm p-6 text-center">
            {isLevelComplete ? (
              <>
                <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Nivel completado</p>
                {snapshot.wonderName && (
                  <p className="mt-2 text-sm text-amber-200/80">{snapshot.wonderName}</p>
                )}
                <p className="mt-3 bg-gradient-to-r from-amber-200 to-cyan-200 bg-clip-text text-5xl font-bold text-transparent">
                  {snapshot.score}
                </p>
              </>
            ) : (
              <>
            <p className="text-xs uppercase tracking-[0.5em] text-red-400">Desconectado</p>
            <p className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-5xl font-bold text-transparent">
              {snapshot.score}
            </p>
              </>
            )}
            <p className="text-sm text-cyan-200/70">
              {snapshot.distance}m · {snapshot.orbsCollected} orbes
              {snapshot.maxCombo > 1 && ` · combo max x${snapshot.maxCombo}`}
            </p>
            {snapshot.isNewHighScore && (
              <p className="animate-pulse font-semibold text-amber-300">✦ Nuevo récord en el Grid</p>
            )}
            <p className="text-xs text-white/40">Mejor puntuación: {snapshot.highScore}</p>
            {snapshot.runRewardMessage && (
              <p className="max-w-xs rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-200">
                🎁 {snapshot.runRewardMessage}
              </p>
            )}
            <div className="mt-3 grid w-full max-w-xs gap-2">
              {isLevelComplete ? (
                <>
                  <Button size="lg" variant="primary" className="w-full" onClick={handleNextLevel}>
                    Siguiente nivel
                  </Button>
                  <Button size="lg" variant="tertiary" className="w-full" onClick={handleRestart}>
                    Rejugar nivel
                  </Button>
                </>
              ) : (
                <>
              <Button size="lg" variant="primary" className="w-full" onClick={handleRestart}>
                Reconectar
              </Button>
              {showContinue && (
                <Button
                  size="lg"
                  variant="tertiary"
                  className="w-full border border-cyan-400/40 bg-cyan-500/10 !text-white hover:bg-cyan-500/20"
                  onClick={handleContinue}
                >
                  Continuar ({continuesLeft})
                </Button>
              )}
              <Button
                size="lg"
                variant="tertiary"
                className="w-full border border-amber-400/40 bg-amber-500/10 !text-white hover:bg-amber-500/15"
                onClick={goToHub}
              >
                Mapas
              </Button>
              <Link
                href="/shop"
                className="flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base font-medium text-violet-100 transition hover:bg-white/10"
              >
                Tienda
              </Link>
                </>
              )}
            </div>
            </div>
          </div>
        )}

        {started && isPaused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#030812]/55 p-6 backdrop-blur-md">
            <div className="glass-panel-strong w-full max-w-xs p-6 text-center text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
                Pausado
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-white">{snapshot.score}</p>
              <p className="mt-1 text-sm text-white/55">{snapshot.distance}m recorridos</p>
              <div className="mt-5 grid gap-2">
                <Button size="lg" variant="primary" className="w-full" onClick={() => resume()}>
                  ▶ Continuar
                </Button>
                <Button
                  size="lg"
                  variant="tertiary"
                  className="w-full border border-white/15 bg-white/5 !text-white hover:bg-white/10"
                  onClick={goToHub}
                >
                  Salir a mapas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
