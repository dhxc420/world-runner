'use client';

import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export const AuthButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const { isInstalled } = useMiniKit();
  const hasAttemptedAuth = useRef(false);

  const completeLogin = useCallback(
    async (result: Awaited<ReturnType<typeof walletAuth>>) => {
      if (!result.ok) {
        console.error('Wallet authentication failed:', result.error);
        setFailed(true);
        setTimeout(() => setFailed(false), 3000);
        return;
      }
      router.push('/home');
      router.refresh();
    },
    [router],
  );

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) return;
    setIsPending(true);
    setFailed(false);
    try {
      await completeLogin(await walletAuth());
    } catch (error) {
      console.error('Wallet authentication button error', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setIsPending(false);
    }
  }, [completeLogin, isInstalled, isPending]);

  // Auto-auth only inside World App
  useEffect(() => {
    if (isInstalled !== true || hasAttemptedAuth.current) return;
    hasAttemptedAuth.current = true;
    setIsPending(true);
    walletAuth()
      .then(completeLogin)
      .catch((error) => {
        console.error('Auto wallet authentication error', error);
        setFailed(true);
        setTimeout(() => setFailed(false), 3000);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [completeLogin, isInstalled]);

  if (isInstalled === false) {
    return (
      <p className="max-w-xs text-center text-sm text-violet-200/60">
        Conecta tu wallet abriendo la app en World App, o juega como invitado abajo.
      </p>
    );
  }

  return (
    <LiveFeedback
      label={{
        failed: 'Error al conectar wallet',
        pending: 'Conectando wallet...',
        success: 'Conectado',
      }}
      state={isPending ? 'pending' : failed ? 'failed' : undefined}
      className="w-full max-w-xs"
    >
      <Button
        onClick={onClick}
        disabled={isPending || isInstalled !== true}
        size="lg"
        variant="primary"
        className="w-full"
      >
        Login with Wallet
      </Button>
    </LiveFeedback>
  );
};
