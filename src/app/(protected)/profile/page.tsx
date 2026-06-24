import { VerifyHuman } from '@/components/world-runner/VerifyHuman';
import { ProfileStats } from '@/components/world-runner/ProfileStats';
import { GuestBanner } from '@/components/GuestBanner';
import { Page } from '@/components/PageLayout';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { auth } from '@/auth';

export default async function ProfilePage() {
  const session = await auth();
  const isGuest = session?.user?.isGuest;

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Perfil"
          endAdornment={
            session?.user && !isGuest && session.user.profilePictureUrl ? (
              <Marble src={session.user.profilePictureUrl} className="w-10" />
            ) : undefined
          }
        />
      </Page.Header>
      <Page.Main className="mb-20 flex flex-col gap-5">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="font-semibold capitalize text-white">
            {isGuest ? 'Invitado' : (session?.user?.username ?? 'Runner')}
          </p>
          <p className="text-sm text-violet-200/70">
            {isGuest
              ? 'Sesión de navegador — sin wallet conectada'
              : 'Wallet conectada vía MiniKit'}
          </p>
        </div>

        <GuestBanner />
        {!isGuest && <VerifyHuman />}
        <ProfileStats />
      </Page.Main>
    </>
  );
}
