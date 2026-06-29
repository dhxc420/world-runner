import { ArcadeBackdrop } from '@/components/world-runner/ArcadeBackdrop';
import { LeaderboardPanel } from '@/components/world-runner/LeaderboardPanel';
import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function RankingPage() {
  return (
    <Page className="relative min-h-dvh overflow-hidden bg-transparent">
      <ArcadeBackdrop variant="home" />
      <Page.Header className="relative z-10 border-b border-white/8 bg-[#030812]/45 p-0 text-white backdrop-blur-xl">
        <TopBar title="Ranking" />
      </Page.Header>
      <Page.Main className="relative z-10 mb-20 flex flex-col items-center gap-4 px-4 pt-5 text-white">
        <div className="ranking-hero w-full max-w-md p-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
            World ID Verified
          </p>
          <h1 className="arcade-glow-text mt-2 text-2xl font-bold">Top Runners</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Solo humanos verificados compiten en el leaderboard global.
          </p>
        </div>
        <div className="w-full max-w-md">
          <LeaderboardPanel variant="full" showHeader={false} />
        </div>
      </Page.Main>
    </Page>
  );
}
