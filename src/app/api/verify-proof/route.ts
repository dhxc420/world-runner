import { auth } from '@/auth';
import { registerVerifiedPlayer } from '@/lib/leaderboardStore';
import type { IDKitResult } from '@worldcoin/idkit';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Forwards the IDKit result as-is to the Developer Portal v4 verify API.
 * @see https://docs.world.org/world-id/idkit/integrate#step-5-verify-the-proof-in-your-backend
 */
export async function POST(req: NextRequest) {
  const expectedRpId = process.env.RP_ID;
  if (!expectedRpId) {
    return NextResponse.json(
      { error: 'RP_ID not configured' },
      { status: 500 },
    );
  }

  const { rp_id, idkitResponse } = (await req.json()) as {
    rp_id?: string;
    idkitResponse?: IDKitResult;
  };

  if (rp_id !== expectedRpId) {
    return NextResponse.json({ error: 'Invalid rp_id' }, { status: 400 });
  }

  if (!idkitResponse) {
    return NextResponse.json(
      { error: 'idkitResponse is required' },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${encodeURIComponent(expectedRpId)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(idkitResponse),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: 'Verification failed', detail },
      { status: 400 },
    );
  }

  const session = await auth();
  const nullifierHash =
    (idkitResponse as { nullifier_hash?: string }).nullifier_hash ??
    (idkitResponse as { proof?: { nullifier_hash?: string } }).proof?.nullifier_hash;

  if (session?.user?.walletAddress && !session.user.isGuest && nullifierHash) {
    try {
      await registerVerifiedPlayer({
        walletAddress: session.user.walletAddress,
        username: session.user.username,
        profilePictureUrl: session.user.profilePictureUrl,
        nullifierHash,
        verifiedAt: new Date().toISOString(),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'register failed';
      if (msg === 'NULLIFIER_USED') {
        return NextResponse.json({ error: 'World ID already used' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true, registered: true });
  }

  return NextResponse.json({ success: true, registered: false });
}
