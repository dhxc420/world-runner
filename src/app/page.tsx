import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import { GuestButton } from '../components/GuestButton';

export default function Home() {
  return (
    <Page className="bg-[#0b1026]">
      <Page.Main className="flex flex-col items-center justify-center gap-6 text-white">
        <div className="max-w-sm text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Mini App Arcade</p>
          <h1 className="mt-2 text-4xl font-bold">World Runner</h1>
          <p className="mt-3 text-sm text-violet-100/70">
            Endless runner verificado. Corre, esquiva bots y deepfakes, recolecta orbes reales.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <AuthButton />
          <div className="flex w-full items-center gap-3 text-xs text-violet-300/60">
            <span className="h-px flex-1 bg-violet-500/20" />
            <span className="text-violet-200/80">o</span>
            <span className="h-px flex-1 bg-violet-500/20" />
          </div>
          <GuestButton />
          <p className="text-center text-xs text-violet-300/50">
            Modo invitado: juega en el navegador sin wallet. Progreso guardado en este dispositivo.
          </p>
        </div>
      </Page.Main>
    </Page>
  );
}
