import { WORLD_ID_ACTION } from '@/lib/shopCatalog';
import { signRequest } from '@worldcoin/idkit/signing';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SIGNING_KEY = process.env.RP_SIGNING_KEY;
const RP_ID = process.env.RP_ID;

const ALLOWED_ACTIONS = new Set(
  [process.env.WORLD_ID_ACTION, WORLD_ID_ACTION].filter(Boolean),
);

export async function POST(req: Request) {
  if (!SIGNING_KEY || !RP_ID) {
    return NextResponse.json(
      { error: 'RP_SIGNING_KEY or RP_ID not configured' },
      { status: 500 },
    );
  }

  const { action } = await req.json();
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const sig = signRequest({ action, signingKeyHex: SIGNING_KEY, ttl: 300 });

  return NextResponse.json({
    rp_id: RP_ID,
    sig: sig.sig,
    nonce: sig.nonce,
    created_at: Number(sig.createdAt),
    expires_at: Number(sig.expiresAt),
  });
}
