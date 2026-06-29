import { auth } from '@/auth';
import type { PaymentIntent } from '@/lib/paymentStore';
import { completePaymentIntent, getPaymentIntent } from '@/lib/paymentStore';
import { rcolPriceForWld } from '@/lib/rcol';
import type { PayMode, ShopProductId } from '@/lib/shopCatalog';
import { SHOP_PRODUCTS } from '@/lib/shopCatalog';
import { getTreasuryAddress } from '@/lib/treasury';
import { NextResponse } from 'next/server';

interface ConfirmBody {
  transactionId?: string;
  reference?: string;
  payMode?: PayMode;
}

function wldToWei18(wld: number): bigint {
  return BigInt(Math.round(wld * 1e6)) * BigInt(1e12);
}

function amountMatchesProduct(
  amountField: string,
  intent: PaymentIntent,
  payMode: PayMode,
): boolean {
  const product = SHOP_PRODUCTS.find((p) => p.id === intent.productId);
  if (!product) return false;

  const actual = BigInt(amountField);
  if (payMode === 'wld') {
    const micro = BigInt(Math.round(product.wldAmount * 1_000_000));
    const wei18 = wldToWei18(product.wldAmount);
    return actual === micro || actual === wei18;
  }

  const rcol = rcolPriceForWld(product.wldAmount);
  return actual === wldToWei18(rcol);
}

async function verifyWithWorldApi(
  transactionId: string,
  payMode: PayMode,
  intent: PaymentIntent,
): Promise<boolean> {
  const appId = process.env.NEXT_PUBLIC_APP_ID;
  const apiKey = process.env.WORLD_API_KEY || process.env.DEV_PORTAL_API_KEY;
  if (!appId || !apiKey) return false;

  const type = payMode === 'wld' ? 'payment' : 'transaction';

  try {
    const url = new URL(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}`,
    );
    url.searchParams.set('app_id', appId);
    url.searchParams.set('type', type);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      status?: string;
      transactionStatus?: string;
      transaction_status?: string;
      reference?: string;
      id?: string;
      recipientAddress?: string;
      to?: string;
      token_amount?: string;
      amount?: string;
    };
    const status = data.status ?? data.transactionStatus ?? data.transaction_status;
    const okStatus =
      status === 'confirmed' || status === 'mined' || status === 'success';

    if (data.reference && data.reference !== intent.id) return false;
    if (data.id && data.id !== intent.id) return false;

    const amountField = data.token_amount ?? data.amount;
    if (amountField && !amountMatchesProduct(amountField, intent, payMode)) {
      return false;
    }

    const treasury = getTreasuryAddress()?.toLowerCase();
    const recipient = (data.recipientAddress ?? data.to)?.toLowerCase();
    if (treasury && recipient) {
      return okStatus && recipient === treasury;
    }
    return okStatus;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.walletAddress || session.user.isGuest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ConfirmBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { transactionId, reference } = body;
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  const intent = getPaymentIntent(reference);
  if (!intent) {
    return NextResponse.json({ error: 'Unknown payment reference' }, { status: 404 });
  }

  if (intent.walletAddress !== session.user.walletAddress.toLowerCase()) {
    return NextResponse.json({ error: 'Payment owner mismatch' }, { status: 403 });
  }

  if (intent.status === 'completed') {
    return NextResponse.json({ productId: intent.productId, alreadyGranted: true });
  }

  const payMode = body.payMode === 'rcol' ? 'rcol' : intent.payMode;
  const portalOk = transactionId
    ? await verifyWithWorldApi(transactionId, payMode, intent)
    : false;
  const devBypass = process.env.NODE_ENV === 'development' && !process.env.DEV_PORTAL_API_KEY;

  if (!portalOk && !devBypass) {
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment not verified' }, { status: 402 });
  }

  const completed = completePaymentIntent(reference, transactionId ?? 'dev-bypass');
  if (!completed) {
    return NextResponse.json({ error: 'Could not complete payment' }, { status: 409 });
  }

  return NextResponse.json({
    productId: completed.productId as ShopProductId,
    granted: true,
    payMode: completed.payMode,
  });
}
