import type { PayMode, ShopProductId } from '@/lib/shopCatalog';

export type PaymentStatus = 'pending' | 'completed';

export interface PaymentIntent {
  id: string;
  productId: ShopProductId;
  walletAddress: string;
  payMode: PayMode;
  wldAmount: number;
  status: PaymentStatus;
  createdAt: number;
  transactionId?: string;
}

const globalStore = globalThis as unknown as {
  __worldRunnerPayments?: Map<string, PaymentIntent>;
};

function getStore(): Map<string, PaymentIntent> {
  if (!globalStore.__worldRunnerPayments) {
    globalStore.__worldRunnerPayments = new Map();
  }
  return globalStore.__worldRunnerPayments;
}

export function createPaymentIntent(
  productId: ShopProductId,
  walletAddress: string,
  payMode: PayMode,
  wldAmount: number,
): PaymentIntent {
  const id = crypto.randomUUID().replace(/-/g, '');
  const intent: PaymentIntent = {
    id,
    productId,
    walletAddress: walletAddress.toLowerCase(),
    payMode,
    wldAmount,
    status: 'pending',
    createdAt: Date.now(),
  };
  getStore().set(id, intent);
  return intent;
}

export function getPaymentIntent(id: string): PaymentIntent | undefined {
  return getStore().get(id);
}

export function completePaymentIntent(
  id: string,
  transactionId: string,
): PaymentIntent | undefined {
  const intent = getStore().get(id);
  if (!intent || intent.status === 'completed') return undefined;
  intent.status = 'completed';
  intent.transactionId = transactionId;
  getStore().set(id, intent);
  return intent;
}
