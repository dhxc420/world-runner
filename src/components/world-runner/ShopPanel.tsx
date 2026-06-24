'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { usePlayerProgress } from '@/context/PlayerProgressContext';
import { inWorldApp, payWithRCOL, payWithWLD } from '@/lib/minikit-pay';
import { formatRcol, rcolPriceForWld } from '@/lib/rcol';
import {
  SHOP_PRODUCTS,
  type PayMode,
  type ShopProductId,
} from '@/lib/shopCatalog';
import { isRcolPaymentsConfigured } from '@/lib/treasury';

export function ShopPanel() {
  const { data: session, status } = useSession();
  const isGuest = session?.user?.isGuest;
  const canPay = status === 'authenticated' && !!session?.user?.walletAddress && !isGuest;
  const { grantProduct, continues, speedBoosts, magnetBoosts, premiumSkin, wonderTrail, spiritAura } =
    usePlayerProgress();

  const [payMode, setPayMode] = useState<PayMode>('wld');
  const rcolReady = isRcolPaymentsConfigured();

  const isOwned = (id: ShopProductId) => {
    if (id === 'premium_skin') return premiumSkin;
    if (id === 'wonder_trail') return wonderTrail;
    if (id === 'spirit_aura') return spiritAura;
    return false;
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 pb-4">
      <div className="rounded-3xl bg-gradient-to-br from-[#1a1040] to-[#2d1b69] p-6 shadow-lg ring-1 ring-violet-400/20">
        <p className="text-sm uppercase tracking-widest text-violet-300">Cosméticos</p>
        <h2 className="mt-1 text-xl font-bold text-white">Tienda</h2>
        <p className="mt-2 text-sm text-violet-100/80">
          Paga con WLD o $RCOL vía World App. Solo skins — sin ventaja competitiva.
        </p>
        {!canPay && (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100/90">
            Conecta tu wallet en World App para comprar cosméticos.
          </p>
        )}
        {canPay && !inWorldApp() && (
          <p className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs text-cyan-100/90">
            Abre esta mini app dentro de World App para pagar con WLD o RCOL.
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPayMode('wld')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              payMode === 'wld'
                ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100'
                : 'border-white/10 text-white/60 hover:bg-white/5'
            }`}
          >
            WLD
          </button>
          <button
            type="button"
            onClick={() => rcolReady && setPayMode('rcol')}
            disabled={!rcolReady}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              payMode === 'rcol'
                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                : 'border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-40'
            }`}
          >
            $RCOL
          </button>
        </div>
        {!rcolReady && (
          <p className="mt-2 text-xs text-amber-200/70">
            RCOL: configura NEXT_PUBLIC_TREASURY_ADDRESS y NEXT_PUBLIC_RCOL_TOKEN en .env.local
          </p>
        )}
        <p className="mt-3 text-xs text-violet-300">
          Inventario ganado: 💫 {continues} continues · ⚡ {speedBoosts} rush · 🧲 {magnetBoosts}{' '}
          magnet
        </p>
      </div>

      {SHOP_PRODUCTS.map((product) => (
        <ShopItemCard
          key={product.id}
          productId={product.id}
          name={`${product.emoji} ${product.name}`}
          description={product.description}
          wldAmount={product.wldAmount}
          payMode={payMode}
          owned={isOwned(product.id)}
          disabled={!canPay}
          onSuccess={() => grantProduct(product.id)}
        />
      ))}
    </div>
  );
}

function ShopItemCard({
  productId,
  name,
  description,
  wldAmount,
  payMode,
  owned,
  disabled,
  onSuccess,
}: {
  productId: ShopProductId;
  name: string;
  description: string;
  wldAmount: number;
  payMode: PayMode;
  owned?: boolean;
  disabled?: boolean;
  onSuccess: () => void;
}) {
  const [payState, setPayState] = useState<'pending' | 'success' | 'failed' | undefined>();
  const rcolAmount = rcolPriceForWld(wldAmount);
  const priceLabel =
    payMode === 'rcol' ? `${formatRcol(rcolAmount)} RCOL` : `${wldAmount} WLD`;

  const pay = async () => {
    if (owned || disabled) return;
    setPayState('pending');

    try {
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, payMode }),
      });

      if (!res.ok) {
        setPayState('failed');
        setTimeout(() => setPayState(undefined), 2500);
        return;
      }

      const { id } = await res.json();

      const description = `World Runner — ${name}`;
      const result =
        payMode === 'rcol'
          ? await payWithRCOL({ rcol: rcolAmount, reference: id, description })
          : await payWithWLD({ wld: wldAmount, reference: id, description });

      if (!result.ok) {
        setPayState('failed');
        setTimeout(() => setPayState(undefined), 2500);
        return;
      }

      const confirmRes = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: result.transactionId,
          reference: id,
          payMode,
        }),
      });

      if (!confirmRes.ok) {
        setPayState('failed');
        setTimeout(() => setPayState(undefined), 2500);
        return;
      }

      onSuccess();
      setPayState('success');
    } catch {
      setPayState('failed');
      setTimeout(() => setPayState(undefined), 2500);
    }
  };

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <p className="font-semibold text-white">{name}</p>
      <p className="mt-1 text-sm text-violet-100/70">{description}</p>
      {owned ? (
        <p className="mt-3 text-sm font-medium text-emerald-300">Ya desbloqueado ✓</p>
      ) : disabled ? (
        <p className="mt-3 text-sm text-violet-300/60">Disponible con wallet en World App</p>
      ) : (
        <div className="mt-3">
          <LiveFeedback
            state={payState}
            label={{ pending: '...', success: 'OK', failed: 'Error' }}
          >
            <Button
              size="sm"
              variant="primary"
              className="w-full"
              disabled={payState === 'pending'}
              onClick={pay}
            >
              Comprar · {priceLabel}
            </Button>
          </LiveFeedback>
          {payMode === 'rcol' && (
            <p className="mt-1 text-center text-[10px] text-white/40">
              ≈ {wldAmount} WLD al tipo Vuela RCOl
            </p>
          )}
        </div>
      )}
    </div>
  );
}
