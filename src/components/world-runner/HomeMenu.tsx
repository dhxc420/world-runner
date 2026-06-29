'use client';

import Link from 'next/link';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { gameStorage } from '@/lib/gameStorage';
import { HomeSettings } from './HomeSettings';
import { StoryCard } from './StoryCard';

export function HomeMenu() {
  const { highScore, verifiedHuman, continues, speedBoosts, magnetBoosts } =
    usePlayerProgress();
  const daily = gameStorage.getDailyChallenge();
  const stats = gameStorage.getStats();

  return (
    <div className="home-hero flex w-full max-w-md flex-col gap-4 px-3 pb-24">
      <div className="home-hero__card relative overflow-hidden p-5 text-white">
        <div className="home-hero__glow" aria-hidden="true" />
        <div className="relative z-[1]">
          <div className="flex items-center gap-2">
            <span className="home-hero__badge">Arcade</span>
            {verifiedHuman && (
              <span className="rounded-full border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                ✦ Verificado
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
            World Runner
          </p>
          <h1 className="arcade-glow-text mt-1 text-[1.75rem] font-bold leading-tight tracking-tight">
            Corre. Esquiva. Verifica.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            La mariposa atraviesa el Grid post-guerra. Recolecta la{' '}
            <span className="font-semibold text-amber-200">★ Rainbow Star</span> para volar invencible.
          </p>
        </div>
      </div>

      <StoryCard />

      <Link href="/play" className="w-full">
        <button type="button" className="home-play-cta w-full">
          <span className="home-play-cta__icon" aria-hidden="true">
            ▶
          </span>
          <span className="home-play-cta__text">Jugar ahora</span>
          <span className="home-play-cta__shine" aria-hidden="true" />
        </button>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🏆" label="Mejor puntuación" value={String(highScore)} accent="cyan" />
        <StatCard icon="📏" label="Mejor distancia" value={`${stats.bestDistance}m`} accent="violet" />
        <StatCard icon="💫" label="Continuaciones" value={String(continues)} accent="amber" />
        <StatCard icon="🔮" label="Orbes totales" value={String(stats.totalOrbs)} accent="pink" />
      </div>

      {verifiedHuman && (
        <div className="home-daily-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-100">Reto diario</p>
              <p className="mt-1 text-sm text-amber-100/75">
                Recolecta {daily.targetOrbs} orbes reales
              </p>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
              {daily.bestOrbs}/{daily.targetOrbs}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (daily.bestOrbs / daily.targetOrbs) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-amber-200/60">
            {daily.completed ? '✅ Completado hoy' : 'Completa el reto diario para bonus'}
          </p>
        </div>
      )}

      <HomeSettings />

      {(speedBoosts > 0 || magnetBoosts > 0 || continues > 0) && (
        <div className="home-rewards-row">
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Recompensas
          </span>
          <div className="flex gap-3 text-sm text-white/75">
            <span>💫 {continues}</span>
            <span>⚡ {speedBoosts}</span>
            <span>🧲 {magnetBoosts}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: 'cyan' | 'violet' | 'amber' | 'pink';
}) {
  return (
    <div className={`home-stat-card home-stat-card--${accent}`}>
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-2 text-[11px] font-medium text-white/50">{label}</p>
      <p className="mt-0.5 text-xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}
