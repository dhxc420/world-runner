'use client';

import { ArcadeBackdrop } from '@/components/world-runner/ArcadeBackdrop';
import { Page } from '@/components/PageLayout';
import { gameMusic } from '@/game/music';
import { isMusicEnabled, setMusicEnabled } from '@/lib/settings';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import type { Session } from 'next-auth';
import { useCallback, useEffect } from 'react';

type HomeScreenProps = {
  session: Session | null;
  children: React.ReactNode;
};

export function HomeScreen({ session, children }: HomeScreenProps) {
  const isGuest = session?.user?.isGuest;

  const startHomeMusic = useCallback(async () => {
    if (!isMusicEnabled()) return;
    setMusicEnabled(true);
    if (!gameMusic.isActive()) gameMusic.startHomeTron();
    else gameMusic.setMuted(false);
  }, []);

  useEffect(() => {
    void startHomeMusic();

    const onPointer = () => {
      void startHomeMusic();
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('touchstart', onPointer);

    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('touchstart', onPointer);
      gameMusic.stop();
    };
  }, [startHomeMusic]);

  return (
    <Page className="relative min-h-dvh overflow-hidden bg-transparent">
      <ArcadeBackdrop variant="home" />
      <Page.Header className="relative z-10 border-b border-white/8 bg-[#030812]/45 p-0 text-white backdrop-blur-xl">
        <TopBar
          title="World Runner"
          endAdornment={
            session?.user ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold capitalize">
                  {isGuest ? 'Invitado' : session.user.username}
                </p>
                {!isGuest && session.user.profilePictureUrl ? (
                  <Marble src={session.user.profilePictureUrl} className="w-10" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/30 text-lg ring-2 ring-violet-400/25">
                    👤
                  </span>
                )}
              </div>
            ) : undefined
          }
        />
      </Page.Header>
      <Page.Main className="relative z-10 mb-20 flex flex-col items-center gap-4 bg-transparent pt-4 text-white">
        {children}
      </Page.Main>
    </Page>
  );
}
