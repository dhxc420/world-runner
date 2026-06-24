import { auth } from '@/auth';
import { GuestBanner } from '@/components/GuestBanner';
import { HomeMenu } from '@/components/world-runner/HomeMenu';
import { Page } from '@/components/PageLayout';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default async function HomePage() {
  const session = await auth();
  const isGuest = session?.user?.isGuest;

  return (
    <>
      <Page.Header className="border-b border-violet-500/10 bg-[#0b1026] p-0 text-white">
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/30 text-lg">
                    👤
                  </span>
                )}
              </div>
            ) : undefined
          }
        />
      </Page.Header>
      <Page.Main className="mb-20 flex flex-col items-center gap-4 bg-[#0b1026] pt-4 text-white">
        <div className="w-full max-w-md px-1">
          <GuestBanner />
        </div>
        <HomeMenu />
      </Page.Main>
    </>
  );
}
