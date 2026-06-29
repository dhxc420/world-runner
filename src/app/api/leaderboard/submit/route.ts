import { auth } from '@/auth';
import { submitScore } from '@/lib/leaderboardStore';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SCORE = 500_000;
const MAX_DISTANCE = 50_000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.walletAddress || session.user.isGuest) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const body = (await req.json()) as {
    score?: number;
    distance?: number;
    levelName?: string;
  };

  const score = Math.floor(Number(body.score ?? 0));
  const distance = Math.floor(Number(body.distance ?? 0));
  const levelName = String(body.levelName ?? 'World Runner').slice(0, 64);

  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }
  if (!Number.isFinite(distance) || distance < 0 || distance > MAX_DISTANCE) {
    return NextResponse.json({ error: 'Invalid distance' }, { status: 400 });
  }

  try {
    const entry = await submitScore({
      walletAddress: session.user.walletAddress,
      username: session.user.username,
      profilePictureUrl: session.user.profilePictureUrl,
      score,
      distance,
      levelName,
    });
    return NextResponse.json({ entry });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Submit failed';
    if (msg === 'NOT_VERIFIED') {
      return NextResponse.json({ error: 'Verified human required' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
