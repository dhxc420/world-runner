import { Page } from '@/components/PageLayout';

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <Page className="overflow-hidden">{children}</Page>;
}
