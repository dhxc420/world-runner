'use client';

import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useRef, useState } from 'react';

export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();
  const hasAttemptedAuth = useRef(false);

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) return;
    setIsPending(true);
    try {
      await walletAuth();
    } catch (error) {
      console.error('Wallet authentication button error', error);
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, isPending]);

  // Auto-auth only inside World App
  useEffect(() => {
    if (isInstalled !== true || hasAttemptedAuth.current) return;
    hasAttemptedAuth.current = true;
    setIsPending(true);
    walletAuth()
      .catch((error) => {
        console.error('Auto wallet authentication error', error);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [isInstalled]);

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
        failed: 'Failed to login',
        pending: 'Logging in',
        success: 'Logged in',
      }}
      state={isPending ? 'pending' : undefined}
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
