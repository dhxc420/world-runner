'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { SNAPSHOT_INTERVAL_MS } from '@/game/constants';
import type { GameModifiers, GameSnapshot, PlayerAction } from '@/game/types';
import { gameStorage } from '@/lib/gameStorage';

interface UseGameOptions {
  modifiers: GameModifiers;
  initialPlaylistId?: string;
  onGameOver?: (snapshot: GameSnapshot) => void;
  onAfterContinue?: () => void;
}

export function useGame({ modifiers, initialPlaylistId, onGameOver, onAfterContinue }: UseGameOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modifiersRef = useRef(modifiers);
  modifiersRef.current = modifiers;

  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    phase: 'idle',
    score: 0,
    distance: 0,
    orbsCollected: 0,
    highScore: gameStorage.getHighScore(),
    speed: 0,
    isNewHighScore: false,
    combo: 0,
    maxCombo: 0,
    mapName: '',
  });

  const lastSnapshotMs = useRef(0);

  const handleSnapshot = useCallback((next: GameSnapshot) => {
    if (next.phase === 'playing') {
      const now = performance.now();
      if (now - lastSnapshotMs.current < SNAPSHOT_INTERVAL_MS) return;
      lastSnapshotMs.current = now;
    }

    setSnapshot((prev) => ({
      ...next,
      highScore: Math.max(prev.highScore, gameStorage.getHighScore(), next.score),
    }));
  }, []);

  const handleGameOver = useCallback(
    (final: GameSnapshot) => {
      const highScore = gameStorage.getHighScore();
      const score = final.score;
      const isNewHighScore = score > highScore;
      if (isNewHighScore) gameStorage.setHighScore(score);
      gameStorage.recordRun(final.distance, final.orbsCollected);
      let dailyJustCompleted = false;
      if (gameStorage.isVerifiedHuman()) {
        dailyJustCompleted = gameStorage.updateDailyChallenge(final.orbsCollected);
      }
      const rewards = gameStorage.awardRunRewards(final.orbsCollected, dailyJustCompleted);

      const enriched: GameSnapshot = {
        ...final,
        highScore: Math.max(highScore, score),
        isNewHighScore,
        runRewardMessage: rewards.message,
      };
      setSnapshot(enriched);
      onGameOver?.(enriched);
    },
    [onGameOver],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      engineRef.current?.updateConfig({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        modifiers: modifiersRef.current,
        onSnapshot: handleSnapshot,
        onGameOver: handleGameOver,
      });
    };

    const engine = new GameEngine(canvas, {
      width: container.clientWidth,
      height: container.clientHeight,
      modifiers: modifiersRef.current,
      onSnapshot: handleSnapshot,
      onGameOver: handleGameOver,
    });
    engineRef.current = engine;

    if (initialPlaylistId) engine.setPlaylist(initialPlaylistId);

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
    // initialPlaylistId handled by dedicated effect below — avoid remounting engine on map change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleGameOver, handleSnapshot]);

  useEffect(() => {
    if (initialPlaylistId) engineRef.current?.setPlaylist(initialPlaylistId);
  }, [initialPlaylistId]);

  useEffect(() => {
    engineRef.current?.updateConfig({ modifiers: modifiersRef.current });
  }, [modifiers]);

  const start = useCallback((options?: { speedBoost?: boolean; magnetBoost?: boolean; playlistId?: string }) => {
    lastSnapshotMs.current = 0;
    engineRef.current?.start(options);
  }, []);

  const restart = useCallback(() => {
    lastSnapshotMs.current = 0;
    engineRef.current?.restart();
  }, []);

  const setPlaylist = useCallback((playlistId: string) => {
    engineRef.current?.setPlaylist(playlistId);
  }, []);

  const returnToHub = useCallback(() => {
    engineRef.current?.returnToHub();
    lastSnapshotMs.current = 0;
    setSnapshot((prev) => ({
      ...prev,
      phase: 'idle',
      score: 0,
      distance: 0,
      orbsCollected: 0,
      combo: 0,
      maxCombo: 0,
      speed: 0,
      isNewHighScore: false,
    }));
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setSnapshot((prev) =>
      prev.phase === 'playing' ? { ...prev, phase: 'paused' } : prev,
    );
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    setSnapshot((prev) =>
      prev.phase === 'paused' ? { ...prev, phase: 'playing' } : prev,
    );
  }, []);

  const input = useCallback((action: PlayerAction) => {
    engineRef.current?.input(action);
  }, []);

  const tryContinue = useCallback(() => {
    if (gameStorage.getContinues() <= 0) return false;
    const ok = engineRef.current?.tryContinue() ?? false;
    if (!ok) return false;
    gameStorage.consumeContinue();
    onAfterContinue?.();
    lastSnapshotMs.current = 0;
    setSnapshot((prev) => ({
      ...prev,
      phase: 'playing',
      highScore: Math.max(prev.highScore, gameStorage.getHighScore()),
    }));
    return true;
  }, [onAfterContinue]);

  return {
    canvasRef,
    containerRef,
    snapshot,
    start,
    restart,
    input,
    tryContinue,
    setPlaylist,
    returnToHub,
    pause,
    resume,
  };
}
