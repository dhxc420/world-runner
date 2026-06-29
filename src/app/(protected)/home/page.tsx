import { auth } from '@/auth';
import { GuestBanner } from '@/components/GuestBanner';
import { HomeMenu } from '@/components/world-runner/HomeMenu';
import { HomeScreen } from '@/components/world-runner/HomeScreen';

export default async function HomePage() {
  const session = await auth();

  return (
    <HomeScreen session={session}>
      <div className="w-full max-w-md px-1">
        <GuestBanner />
      </div>
      <HomeMenu />
    </HomeScreen>
  );
}
