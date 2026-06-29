import Link from 'next/link';

export const metadata = {
  title: 'Términos y condiciones — World Runner',
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#030812] px-5 py-8 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/home" className="text-sm text-cyan-400/80 hover:text-cyan-300">
          ← Volver
        </Link>
        <h1 className="arcade-glow-text mt-6 text-2xl font-bold">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-white/50">Última actualización: junio 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/75">
          <section>
            <h2 className="font-semibold text-white">1. Aceptación</h2>
            <p className="mt-2">
              Al usar World Runner en World App aceptas estos términos. Si no estás de acuerdo, no uses
              la aplicación.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">2. Descripción del servicio</h2>
            <p className="mt-2">
              World Runner es un juego arcade endless runner integrado como mini app de World App.
              Incluye progreso local, verificación opcional con World ID, ranking de jugadores
              verificados y compras cosméticas opcionales con WLD o $RCOL.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">3. Cuenta y verificación</h2>
            <p className="mt-2">
              Puedes jugar como invitado (progreso en el dispositivo) o conectando tu wallet en World
              App. La verificación World ID es opcional y desbloquea beneficios descritos en la app. Un
              nullifier de World ID solo puede verificarse una vez en el ranking global.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">4. Pagos y cosméticos</h2>
            <p className="mt-2">
              Las compras en la tienda son transacciones on-chain. No hay reembolsos una vez
              confirmada la transacción en blockchain. Los ítems cosméticos no afectan la habilidad
              de juego de forma pay-to-win.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">5. Ranking y conducta</h2>
            <p className="mt-2">
              El ranking es solo para humanos verificados. Queda prohibido manipular puntuaciones,
              usar bots o explotar bugs. Nos reservamos el derecho de eliminar entradas sospechosas.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">6. Privacidad</h2>
            <p className="mt-2">
              Guardamos progreso en tu navegador, datos de sesión de wallet (username, avatar) y, si
              verificas, tu nullifier hash para el ranking. No vendemos datos personales.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">7. Limitación de responsabilidad</h2>
            <p className="mt-2">
              El juego se ofrece &quot;tal cual&quot;. No garantizamos disponibilidad continua ni
              ausencia de errores. El uso es bajo tu propio riesgo.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white">8. Contacto</h2>
            <p className="mt-2">
              Para soporte o consultas legales, contacta al desarrollador a través del repositorio o
              portal de World App asociado a esta mini app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
