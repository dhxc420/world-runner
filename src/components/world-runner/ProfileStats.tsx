'use client';

import { gameStorage } from '@/lib/gameStorage';

export function ProfileStats() {
  const stats = gameStorage.getStats();
  const daily = gameStorage.getDailyChallenge();

  return (
    <>
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="font-semibold text-white">Estadísticas</p>
        <p className="mt-1 text-sm text-violet-100/80">
          {stats.totalRuns} carreras · {stats.totalOrbs} orbes · mejor {stats.bestDistance}m
        </p>
      </div>

      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
        <p className="font-semibold text-amber-200">Daily Challenge</p>
        <p className="mt-1 text-sm text-amber-100/80">
          Verifica con World ID para desbloquear el reto diario: recolecta {daily.targetOrbs} orbes
          en una sola carrera.
        </p>
        <p className="mt-2 text-xs text-amber-200/70">
          Progreso hoy: {daily.bestOrbs}/{daily.targetOrbs} {daily.completed ? '✅' : '⏳'}
        </p>
      </div>
    </>
  );
}
