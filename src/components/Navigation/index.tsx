'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Gamepad, Home, Leaderboard, ShoppingBag, User } from 'iconoir-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const tabs = [
  { value: 'home', href: '/home', icon: <Home />, label: 'Inicio' },
  { value: 'play', href: '/play', icon: <Gamepad />, label: 'Jugar' },
  { value: 'ranking', href: '/ranking', icon: <Leaderboard />, label: 'Ranking' },
  { value: 'shop', href: '/shop', icon: <ShoppingBag />, label: 'Tienda' },
  { value: 'profile', href: '/profile', icon: <User />, label: 'Perfil' },
] as const;

function NeonTabIcon({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className={`nav-tab-icon ${active ? 'nav-tab-icon--active' : ''}`}>{children}</span>
  );
}

export const Navigation = () => {
  const pathname = usePathname();
  const active =
    tabs.find((t) => pathname.startsWith(t.href))?.value ?? 'home';

  return (
    <Tabs value={active}>
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={`nav-tab flex-1 ${isActive ? 'nav-tab--active' : ''}`}
            data-nav={tab.value}
          >
            <TabItem
              value={tab.value}
              icon={<NeonTabIcon active={isActive}>{tab.icon}</NeonTabIcon>}
              label={tab.label}
            />
          </Link>
        );
      })}
    </Tabs>
  );
};
