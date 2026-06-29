import { getLeaderboard } from '@/lib/leaderboardStore';
import { NextResponse } from 'next/server';

export async function GET() {
  const entries = await getLeaderboard(15);
  return NextResponse.json({ entries });
}
