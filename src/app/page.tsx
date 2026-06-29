import { Page } from '@/components/PageLayout';
import { LoginBackdrop } from '@/components/world-runner/LoginBackdrop';
import { AuthButton } from '../components/AuthButton';
import { GuestButton } from '../components/GuestButton';

export default function Home() {
  return (
    <Page className="relative overflow-hidden bg-[#030812]">
      <LoginBackdrop />
      <Page.Main className="relative z-10 flex flex-col items-center justify-center gap-6 bg-transparent p-6 text-white">
        <div className="glass-panel-strong w-full max-w-sm px-6 py-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
            Mini App Arcade
          </p>
          <h1 className="arcade-glow-text mt-3 text-4xl font-semibold tracking-tight">
            World Runner
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Endless runner verificado. Corre, esquiva bots y deepfakes, recolecta orbes reales.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3">
            <AuthButton />
            <div className="flex w-full items-center gap-3 text-xs text-white/35">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-white/55">o</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <GuestButton />
            <p className="text-center text-xs leading-relaxed text-white/40">
              Modo invitado: juega en el navegador sin wallet. Progreso guardado en este
              dispositivo.
            </p>
          </div>
        </div>
      </Page.Main>
    </Page>
  );
}
