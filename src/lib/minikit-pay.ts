import { MiniKit } from '@worldcoin/minikit-js';
import { encodeFunctionData } from 'viem';
import { getRcolTokenAddress, getTreasuryAddress } from '@/lib/treasury';

export interface PayResult {
  ok: boolean;
  transactionId?: string;
}

function toWei18(amount: number): bigint {
  return BigInt(Math.round(amount * 1e6)) * BigInt(1e12);
}

export function inWorldApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (MiniKit.isInstalled()) return true;
  } catch {
    /* fallback */
  }
  return Boolean((window as { WorldApp?: unknown }).WorldApp);
}

export async function payWithWLD(opts: {
  wld: number;
  reference: string;
  description: string;
}): Promise<PayResult> {
  const treasury = getTreasuryAddress();
  if (!inWorldApp() || !treasury) return { ok: false };
  try {
    const tokenAmount = toWei18(opts.wld).toString();
    const res = await MiniKit.pay({
      reference: opts.reference,
      to: treasury,
      tokens: [{ symbol: 'WLD', token_amount: tokenAmount }],
      description: opts.description,
    } as Parameters<typeof MiniKit.pay>[0]);
    const data = res.data as { transactionId?: string; reference?: string } | undefined;
    const transactionId = data?.transactionId;
    return { ok: Boolean(data && (transactionId || data.reference)), transactionId };
  } catch {
    return { ok: false };
  }
}

const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export async function payWithRCOL(opts: {
  rcol: number;
  reference: string;
  description: string;
}): Promise<PayResult> {
  const treasury = getTreasuryAddress();
  const rcolToken = getRcolTokenAddress();
  if (!inWorldApp() || !treasury || !rcolToken) return { ok: false };
  try {
    const amount = toWei18(opts.rcol);
    const data = encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [treasury, amount],
    });
    const res = await MiniKit.sendTransaction({
      transactions: [{ to: rcolToken, data }],
      chainId: 480,
    });
    const r = res.data as
      | { transaction_id?: string; transactionId?: string; userOpHash?: string; status?: string }
      | undefined;
    const transactionId = r?.transaction_id ?? r?.transactionId ?? r?.userOpHash;
    return { ok: Boolean(r && (transactionId || r.status === 'success')), transactionId };
  } catch {
    return { ok: false };
  }
}
