'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Gamepad, Home, ShoppingBag, User } from 'iconoir-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { value: 'home', href: '/home', icon: <Home />, label: 'Inicio' },
  { value: 'play', href: '/play', icon: <Gamepad />, label: 'Jugar' },
  { value: 'shop', href: '/shop', icon: <ShoppingBag />, label: 'Tienda' },
  { value: 'profile', href: '/profile', icon: <User />, label: 'Perfil' },
] as const;

export const Navigation = () => {
  const pathname = usePathname();
  const active =
    tabs.find((t) => pathname.startsWith(t.href))?.value ?? 'home';

  return (
    <Tabs value={active}>
      {tabs.map((tab) => (
        <Link key={tab.value} href={tab.href} className="flex-1">
          <TabItem value={tab.value} icon={tab.icon} label={tab.label} />
        </Link>
      ))}
    </Tabs>
  );
};
