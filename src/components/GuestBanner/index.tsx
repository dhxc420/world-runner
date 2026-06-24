'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useSession } from 'next-auth/react';

export function GuestBanner() {
  const { data: session } = useSession();

  if (!session?.user?.isGuest) return null;

  return (
    <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
      <p className="font-semibold text-violet-100">Modo invitado</p>
      <p className="mt-1 text-sm text-violet-200/70">
        Tu progreso se guarda en este navegador. Abre la app en World App para conectar wallet,
        verificar con World ID y usar la tienda.
      </p>
      <Button
        size="sm"
        variant="tertiary"
        className="mt-3 border border-violet-400/40 text-violet-100 hover:bg-violet-500/15"
        onClick={() => signOut({ redirectTo: '/' })}
      >
        Salir del modo invitado
      </Button>
    </div>
  );
}
