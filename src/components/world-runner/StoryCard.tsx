'use client';

export function StoryCard() {
  return (
    <div className="story-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#030812]/80 p-4 backdrop-blur-xl">
      <div className="story-card__glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-pink-300/80">
          Crónica
        </p>
        <h2 className="mt-1 text-sm font-bold text-white">La última mariposa</h2>
        <p className="mt-2 text-xs leading-relaxed text-white/65">
          La guerra humana fracturó el mundo real. Solo quedó el Grid — un Matrix de neón donde
          los algoritmos cazan lo que queda de vida. Una mariposa cruzó el umbral: es la única
          semilla de salvación. Corre entre ruinas, esquiva la máquina, y devuelve la luz.
        </p>
      </div>
    </div>
  );
}
