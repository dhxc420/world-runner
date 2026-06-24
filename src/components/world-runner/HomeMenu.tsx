'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { gameStorage } from '@/lib/gameStorage';

export function HomeMenu() {
  const { data: session } = useSession();
  const isGuest = session?.user?.isGuest;
  const { highScore, verifiedHuman, continues, speedBoosts, magnetBoosts } =
    usePlayerProgress();
  const daily = gameStorage.getDailyChallenge();
  const stats = gameStorage.getStats();

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="rounded-3xl bg-gradient-to-br from-[#1a1040] to-[#2d1b69] p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-widest text-violet-300">World Runner</p>
        <h1 className="mt-1 text-3xl font-bold">Corre. Esquiva. Verifica.</h1>
        <p className="mt-2 text-sm text-violet-100/80">
          Endless runner arcade. Salta bots, agáchate de deepfakes y recolecta orbes reales.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="High Score" value={String(highScore)} />
        <StatCard label="Mejor distancia" value={`${stats.bestDistance}m`} />
        <StatCard label="Continues" value={String(continues)} />
        <StatCard label="Orbes totales" value={String(stats.totalOrbs)} />
      </div>

      {verifiedHuman && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="font-semibold text-amber-200">Daily Challenge</p>
          <p className="mt-1 text-sm text-amber-100/80">
            Recolecta {daily.targetOrbs} orbes reales en una carrera (
            {daily.bestOrbs}/{daily.targetOrbs})
          </p>
          <p className="mt-2 text-xs text-amber-200/70">
            {daily.completed
              ? '✅ Completado hoy — ¡buen trabajo!'
              : 'Completa el reto para presumir tu racha diaria'}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        <Link href="/play" className="w-full">
          <Button size="lg" variant="primary" className="w-full text-lg">
            ▶ Jugar ahora
          </Button>
        </Link>
        {!verifiedHuman && !isGuest && (
          <Link href="/profile">
            <Button
              size="lg"
              variant="tertiary"
              className="w-full border border-violet-400/40 bg-white/5 text-white hover:bg-white/10"
            >
              Verificar con World ID
            </Button>
          </Link>
        )}
      </div>

      {(speedBoosts > 0 || magnetBoosts > 0 || continues > 0) && (
        <p className="text-center text-xs text-violet-300">
          Recompensas de juego: 💫 {continues} · ⚡ {speedBoosts} · 🧲 {magnetBoosts}
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <p className="text-xs text-violet-200/70">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}
