'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { MAP_PLAYLISTS } from '@/game/maps/chunks';
import { getTheme } from '@/game/maps/themes';
import type { GameModifiers } from '@/game/types';
import { useGame } from '@/hooks/useGame';
import { PlayHub } from './PlayHub';

type PlayView = 'hub' | 'briefing';

export function GameCanvas() {
  const { verifiedHuman, premiumSkin, wonderTrail, spiritAura, continues, speedBoosts, magnetBoosts, consumePreRunBoost, refresh } =
    usePlayerProgress();
  const [view, setView] = useState<PlayView>('hub');
  const [selectedMapId, setSelectedMapId] = useState(MAP_PLAYLISTS[0].id);
  const [useSpeedBoost, setUseSpeedBoost] = useState(false);
  const [useMagnetBoost, setUseMagnetBoost] = useState(false);
  const [started, setStarted] = useState(false);
  const [continuesLeft, setContinuesLeft] = useState(continues);
  const [continuedThisRun, setContinuedThisRun] = useState(false);

  const selectedMission = useMemo(
    () => MAP_PLAYLISTS.find((p) => p.id === selectedMapId) ?? MAP_PLAYLISTS[0],
    [selectedMapId],
  );
  const selectedTheme = useMemo(() => getTheme(selectedMission.themeId), [selectedMission.themeId]);

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

  const { canvasRef, containerRef, snapshot, start, restart, input, tryContinue, setPlaylist, returnToHub, pause, resume } =
    useGame({
      modifiers,
      initialPlaylistId: selectedMapId,
      onAfterContinue: refresh,
    });

  useEffect(() => {
    if (snapshot.phase === 'gameover') refresh();
  }, [snapshot.phase, refresh]);

  const handleStartMission = useCallback(
    (playlistId: string) => {
      setSelectedMapId(playlistId);
      setPlaylist(playlistId);
      setView('briefing');
    },
    [setPlaylist],
  );

  const goToHub = useCallback(() => {
    setStarted(false);
    setContinuedThisRun(false);
    setUseSpeedBoost(false);
    setUseMagnetBoost(false);
    returnToHub();
    setView('hub');
  }, [returnToHub]);

  const beginRun = useCallback(() => {
    const speedBoost = useSpeedBoost ? consumePreRunBoost('speed') : false;
    const magnetBoost = useMagnetBoost ? consumePreRunBoost('magnet') : false;
    if (speedBoost || magnetBoost) refresh();
    setContinuedThisRun(false);
    setStarted(true);
    start({ speedBoost, magnetBoost, playlistId: selectedMapId });
  }, [consumePreRunBoost, refresh, selectedMapId, start, useMagnetBoost, useSpeedBoost]);

  useEffect(() => {
    if (!started) return;
    const onVis = () => {
      if (document.hidden) pause();
      else resume();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [pause, resume, started]);

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
  const showContinue = continuesLeft > 0 && !continuedThisRun;

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

        {view === 'hub' && (
          <div className="absolute inset-0 z-20">
            <PlayHub initialPlaylistId={selectedMapId} onStartMission={handleStartMission} />
          </div>
        )}

        {view === 'briefing' && !started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#030812]/92 via-[#0a1628]/88 to-[#1a0a3e]/92 p-6 backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-20 left-1/4 h-64 w-64 rounded-full blur-3xl"
                style={{ background: `${selectedTheme.accent}18` }}
              />
              <div className="absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300/80">
              Briefing de misión
            </p>
            <h2
              className="bg-clip-text text-3xl font-bold uppercase tracking-wide text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${selectedTheme.accent}, #f0fbff, ${selectedTheme.grid})`,
              }}
            >
              {selectedMission.name}
            </h2>
            <p className="max-w-xs text-center text-sm leading-relaxed text-violet-100/70">
              {selectedTheme.name} — recolecta flores Wonder y santuarios Spirit en la pista.
            </p>
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
              ▶ Entrar al Grid
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

        {isGameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#030812]/85 p-6 backdrop-blur-lg">
            <p className="text-xs uppercase tracking-[0.5em] text-red-400">Desconectado</p>
            <p className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-5xl font-bold text-transparent">
              {snapshot.score}
            </p>
            <p className="text-sm text-cyan-200/70">
              {snapshot.distance}m · {snapshot.orbsCollected} orbes
              {snapshot.maxCombo > 1 && ` · combo max x${snapshot.maxCombo}`}
            </p>
            {snapshot.isNewHighScore && (
              <p className="animate-pulse font-semibold text-amber-300">✦ Nuevo récord en el Grid</p>
            )}
            <p className="text-xs text-white/40">High score: {snapshot.highScore}</p>
            {snapshot.runRewardMessage && (
              <p className="max-w-xs rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-200">
                🎁 {snapshot.runRewardMessage}
              </p>
            )}
            <div className="mt-3 grid w-full max-w-xs gap-2">
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
                className="flex w-full items-center justify-center rounded-lg border border-violet-400/30 bg-white/5 px-4 py-3 text-base font-medium !text-violet-200 transition hover:bg-white/10"
              >
                Tienda
              </Link>
            </div>
          </div>
        )}

        {started && isPaused && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#030812]/40 backdrop-blur-sm">
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-cyan-300/90">Pausado</p>
          </div>
        )}
      </div>

      {started && isPlaying && (
        <div className="grid h-28 grid-cols-2 border-t border-cyan-500/20 bg-[#030812]/80">
          <button
            type="button"
            aria-label="Saltar"
            className="group flex flex-col items-center justify-center text-cyan-100 active:bg-cyan-500/20"
            onTouchStart={(e) => {
              e.preventDefault();
              input('jump');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              input('jump_release');
            }}
            onMouseDown={() => input('jump')}
            onMouseUp={() => input('jump_release')}
          >
            <span className="text-2xl transition-transform group-active:-translate-y-1">↑</span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400/70">Saltar</span>
          </button>
          <button
            type="button"
            aria-label="Agacharse"
            className="group flex flex-col items-center justify-center text-violet-100 active:bg-violet-500/20"
            onTouchStart={(e) => {
              e.preventDefault();
              input('duck');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              input('release');
            }}
            onMouseDown={() => input('duck')}
            onMouseUp={() => input('release')}
          >
            <span className="text-2xl transition-transform group-active:translate-y-1">↓</span>
            <span className="text-[10px] uppercase tracking-widest text-violet-400/70">Agacharse</span>
          </button>
        </div>
      )}
    </div>
  );
}
