'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { SNAPSHOT_INTERVAL_MS } from '@/game/constants';
import type { GameLevel } from '@/game/maps/levels';
import { WORLD_LEVELS } from '@/game/maps/levels';
import type { GameModifiers, GameSnapshot, PlayerAction } from '@/game/types';
import { gameStorage } from '@/lib/gameStorage';

interface UseGameOptions {
  modifiers: GameModifiers;
  onGameOver?: (snapshot: GameSnapshot) => void;
  onAfterContinue?: () => void;
}

export function useGame({ modifiers, onGameOver, onAfterContinue }: UseGameOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modifiersRef = useRef(modifiers);
  const activeLevelRef = useRef<GameLevel | null>(null);
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

function clearRunSnapshot(prev: GameSnapshot): GameSnapshot {
  return {
    ...prev,
    phase: 'idle',
    score: 0,
    distance: 0,
    orbsCollected: 0,
    combo: 0,
    maxCombo: 0,
    speed: 0,
    isNewHighScore: false,
    levelComplete: false,
    wonderName: undefined,
    runRewardMessage: undefined,
  };
}

  const lastSnapshotMs = useRef(0);

  const submitLeaderboard = useCallback(async (final: GameSnapshot) => {
    if (!gameStorage.isVerifiedHuman()) return;
    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: final.score,
          distance: final.distance,
          levelName: final.mapName,
        }),
      });
    } catch {
      /* optional */
    }
  }, []);

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

      const level = activeLevelRef.current;
      if (level) {
        const idx = WORLD_LEVELS.findIndex((l) => l.id === level.id);
        const nextLevel = idx >= 0 && idx < WORLD_LEVELS.length - 1 ? WORLD_LEVELS[idx + 1].id : null;
        gameStorage.recordLevelRun(
          level.id,
          score,
          final.orbsCollected,
          !!final.levelComplete,
          nextLevel,
        );
      }

      let dailyJustCompleted = false;
      if (gameStorage.isVerifiedHuman()) {
        dailyJustCompleted = gameStorage.updateDailyChallenge(final.orbsCollected);
      }
      const rewards = gameStorage.awardRunRewards(final.orbsCollected, dailyJustCompleted);

      const enriched: GameSnapshot = {
        ...final,
        highScore: Math.max(highScore, score),
        isNewHighScore,
        runRewardMessage: final.levelComplete
          ? `✦ Nivel completado${final.wonderName ? ` — ${final.wonderName}` : ''}`
          : rewards.message,
      };
      setSnapshot(enriched);
      void submitLeaderboard(enriched);
      onGameOver?.(enriched);
    },
    [onGameOver, submitLeaderboard],
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

    resize();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize);
      observer.observe(container);
    }

    return () => {
      observer?.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleGameOver, handleSnapshot]);

  useEffect(() => {
    engineRef.current?.updateConfig({ modifiers: modifiersRef.current });
  }, [modifiers]);

  const start = useCallback(
    (options?: {
      speedBoost?: boolean;
      magnetBoost?: boolean;
      level?: GameLevel;
      speedMultiplier?: number;
    }) => {
      lastSnapshotMs.current = 0;
      activeLevelRef.current = options?.level ?? null;
      engineRef.current?.start(options);
    },
    [],
  );

  const restart = useCallback(() => {
    lastSnapshotMs.current = 0;
    engineRef.current?.restart();
  }, []);

  const setLevel = useCallback((level: GameLevel) => {
    activeLevelRef.current = level;
    engineRef.current?.setLevel(level);
  }, []);

  const returnToHub = useCallback(() => {
    engineRef.current?.returnToHub();
    setSnapshot((prev) => clearRunSnapshot(prev));
  }, []);

  const resetSnapshot = useCallback(() => {
    setSnapshot((prev) => clearRunSnapshot(prev));
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
    setLevel,
    returnToHub,
    pause,
    resume,
    resetSnapshot,
  };
}
