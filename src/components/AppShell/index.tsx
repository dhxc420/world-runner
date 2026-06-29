'use client';

import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith('/play');

  return (
    <Page className="bg-[#0b1026] text-white">
      {children}
      {!hideNav && (
        <Page.Footer className="fixed bottom-0 w-full border-t border-white/10 bg-[#0b1026]/80 px-0 backdrop-blur-xl">
          <Navigation />
        </Page.Footer>
      )}
    </Page>
  );
}
