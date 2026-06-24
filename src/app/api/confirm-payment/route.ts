import { auth } from '@/auth';
import { completePaymentIntent, getPaymentIntent } from '@/lib/paymentStore';
import type { PayMode, ShopProductId } from '@/lib/shopCatalog';
import { getTreasuryAddress } from '@/lib/treasury';
import { NextResponse } from 'next/server';

interface ConfirmBody {
  transactionId?: string;
  reference?: string;
  payMode?: PayMode;
}

async function verifyWithWorldApi(
  transactionId: string,
  payMode: PayMode,
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
      reference?: string;
      recipientAddress?: string;
    };
    const status = data.status ?? data.transactionStatus;
    const okStatus =
      status === 'confirmed' || status === 'mined' || status === 'success';

    const treasury = getTreasuryAddress()?.toLowerCase();
    if (treasury && data.recipientAddress) {
      return okStatus && data.recipientAddress.toLowerCase() === treasury;
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
  const portalOk = transactionId ? await verifyWithWorldApi(transactionId, payMode) : false;
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
