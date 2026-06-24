'use client';

import { guestAuth } from '@/auth/guest';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export function GuestButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const onClick = useCallback(async () => {
    if (isPending) return;
    setIsPending(true);
    setFailed(false);
    try {
      const result = await guestAuth();
      if (!result.ok) {
        console.error('Guest auth failed:', result.error);
        setFailed(true);
        setTimeout(() => setFailed(false), 3000);
        return;
      }
      router.push('/play');
      router.refresh();
    } catch (error) {
      console.error('Guest auth error', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setIsPending(false);
    }
  }, [isPending, router]);

  return (
    <LiveFeedback
      label={{
        failed: 'Error al entrar',
        pending: 'Entrando...',
        success: '¡Listo!',
      }}
      state={isPending ? 'pending' : failed ? 'failed' : undefined}
      className="w-full max-w-xs"
    >
      <Button
        onClick={onClick}
        disabled={isPending}
        size="lg"
        variant="tertiary"
        className="w-full border border-cyan-400/50 bg-cyan-500/10 !text-white hover:bg-cyan-500/20"
      >
        Jugar como invitado
      </Button>
    </LiveFeedback>
  );
}
