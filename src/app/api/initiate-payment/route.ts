import { auth } from '@/auth';
import { createPaymentIntent } from '@/lib/paymentStore';
import type { PayMode, ShopProductId } from '@/lib/shopCatalog';
import { SHOP_PRODUCTS } from '@/lib/shopCatalog';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.walletAddress || session.user.isGuest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let productId: ShopProductId = 'premium_skin';
  let payMode: PayMode = 'wld';
  try {
    const body = await request.json();
    if (body.productId) productId = body.productId;
    if (body.payMode === 'rcol') payMode = 'rcol';
  } catch {
    /* optional body */
  }

  const product = SHOP_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  const intent = createPaymentIntent(
    productId,
    session.user.walletAddress,
    payMode,
    product.wldAmount,
  );

  return NextResponse.json({
    id: intent.id,
    productId: intent.productId,
    payMode: intent.payMode,
    wldAmount: intent.wldAmount,
  });
}
