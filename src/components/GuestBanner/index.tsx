'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export function GuestBanner() {
  const { data: session } = useSession();

  if (!session?.user?.isGuest) return null;

  return (
    <div className="home-guest-banner">
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">
          👋
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-violet-100">Modo invitado</p>
          <p className="mt-1 text-sm leading-relaxed text-violet-200/75">
            Tu progreso se guarda en este navegador. Abre en World App para conectar wallet,
            verificar con World ID y usar la tienda.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 w-full rounded-xl border border-violet-300/35 bg-violet-500/20 px-4 py-2.5 text-sm font-semibold text-violet-50 transition hover:bg-violet-500/30"
        onClick={() => signOut({ redirectTo: '/' })}
      >
        Salir del modo invitado
      </button>
    </div>
  );
}
