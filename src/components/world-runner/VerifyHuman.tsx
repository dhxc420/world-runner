'use client';

import { IDKitRequestWidget, orbLegacy, type IDKitResult, type RpContext } from '@worldcoin/idkit';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { WORLD_ID_ACTION } from '@/lib/shopCatalog';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

interface VerifyHumanProps {
  compact?: boolean;
}

export function VerifyHuman({ compact }: VerifyHumanProps) {
  const { verifiedHuman, setVerifiedHuman } = usePlayerProgress();
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  const startVerify = async () => {
    setButtonState('pending');
    try {
      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: WORLD_ID_ACTION }),
      });

      if (!rpRes.ok) throw new Error('Failed to get RP signature');

      const rpSig = await rpRes.json();
      setRpContext({
        rp_id: rpSig.rp_id,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        signature: rpSig.sig,
      });
      setOpen(true);
    } catch (error) {
      console.error('World ID RP signature error', error);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 2000);
    }
  };

  const handleVerify = async (result: IDKitResult) => {
    const response = await fetch('/api/verify-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rp_id: rpContext?.rp_id,
        idkitResponse: result,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      console.error('World ID verify error', data);
      throw new Error(data.error ?? 'Verification failed');
    }
    if (data.registered) {
      setVerifiedHuman(true);
    }
  };

  if (verifiedHuman) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="font-semibold text-emerald-200">✓ Humano verificado</p>
        <ul className="mt-2 space-y-1 text-sm text-emerald-100/80">
          <li>• Skin dorada exclusiva</li>
          <li>• Multiplicador de puntos x1.5</li>
          <li>• Acceso al Daily Challenge</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-3">
      {!compact && (
        <div>
          <p className="text-lg font-semibold text-white">Verifica tu humanidad</p>
          <p className="text-sm text-violet-100/80">
            Desbloquea skin especial, x1.5 puntos y Daily Challenge.
          </p>
        </div>
      )}
      <LiveFeedback
        label={{
          failed: 'Verificación fallida',
          pending: 'Verificando...',
          success: '¡Verificado!',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={startVerify}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verificar con World ID
        </Button>
      </LiveFeedback>

      {rpContext && APP_ID?.startsWith('app_') && (
        <IDKitRequestWidget
          app_id={APP_ID}
          action={WORLD_ID_ACTION}
          rp_context={rpContext}
          allow_legacy_proofs
          preset={orbLegacy({ signal: '' })}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setRpContext(null);
              if (buttonState === 'pending') setButtonState(undefined);
            }
          }}
          handleVerify={handleVerify}
          onSuccess={() => {
            setButtonState('success');
            setOpen(false);
            setRpContext(null);
          }}
          onError={(code) => {
            setOpen(false);
            setRpContext(null);
            if (code !== 'user_rejected') {
              setButtonState('failed');
              setTimeout(() => setButtonState(undefined), 2000);
            } else {
              setButtonState(undefined);
            }
          }}
          autoClose
        />
      )}
    </div>
  );
}
