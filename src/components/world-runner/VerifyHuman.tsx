'use client';

import { IDKit, orbLegacy, type RpContext } from '@worldcoin/idkit';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { WORLD_ID_ACTION } from '@/lib/shopCatalog';

interface VerifyHumanProps {
  compact?: boolean;
}

export function VerifyHuman({ compact }: VerifyHumanProps) {
  const { verifiedHuman, setVerifiedHuman } = usePlayerProgress();
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const onClickVerify = async () => {
    setButtonState('pending');
    try {
      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: WORLD_ID_ACTION }),
      });

      if (!rpRes.ok) throw new Error('Failed to get RP signature');

      const rpSig = await rpRes.json();
      const rpContext: RpContext = {
        rp_id: rpSig.rp_id,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        signature: rpSig.sig,
      };

      const request = await IDKit.request({
        app_id: process.env.NEXT_PUBLIC_APP_ID as `app_${string}`,
        action: WORLD_ID_ACTION,
        rp_context: rpContext,
        allow_legacy_proofs: true,
      }).preset(orbLegacy({ signal: '' }));

      const completion = await request.pollUntilCompletion();
      if (!completion.success) {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 2000);
        return;
      }

      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rp_id: rpSig.rp_id,
          idkitResponse: completion.result,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVerifiedHuman(true);
        setButtonState('success');
      } else {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 2000);
      }
    } catch {
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 2000);
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
          onClick={onClickVerify}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verificar con World ID
        </Button>
      </LiveFeedback>
    </div>
  );
}
