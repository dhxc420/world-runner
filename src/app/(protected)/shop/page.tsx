import { ShopPanel } from '@/components/world-runner/ShopPanel';
import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function ShopPage() {
  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="Tienda" />
      </Page.Header>
      <Page.Main className="mb-20 flex flex-col items-center">
        <ShopPanel />
      </Page.Main>
    </>
  );
}
