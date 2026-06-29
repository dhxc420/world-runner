'use client';

type ArcadeBackdropVariant = 'login' | 'home';

/** Fondo animado arcade — grid Tron, aurora y partículas */
export function ArcadeBackdrop({ variant = 'login' }: { variant?: ArcadeBackdropVariant }) {
  const isHome = variant === 'home';

  return (
    <div className={`login-backdrop ${isHome ? 'login-backdrop--home' : ''}`} aria-hidden="true">
      <div className="login-backdrop__void" />
      <div className="login-backdrop__aurora login-backdrop__aurora--a" />
      <div className="login-backdrop__aurora login-backdrop__aurora--b" />
      <div className="login-backdrop__aurora login-backdrop__aurora--c" />
      <div className="login-backdrop__grid" />
      <div className="login-backdrop__horizon" />
      <div className="login-backdrop__stars">
        {Array.from({ length: isHome ? 64 : 48 }, (_, i) => (
          <span
            key={i}
            className="login-backdrop__star"
            style={{
              left: `${(i * 17.3) % 100}%`,
              top: `${(i * 23.7) % (isHome ? 88 : 72)}%`,
              animationDelay: `${(i % 7) * 0.35}s`,
              opacity: 0.2 + (i % 5) * 0.14,
            }}
          />
        ))}
      </div>
      <div className={`login-backdrop__runner-silhouette ${isHome ? 'login-backdrop__runner-silhouette--home' : ''}`}>
        <span className="login-backdrop__butterfly">🦋</span>
        <span className="login-backdrop__star-pickup">★</span>
      </div>
      {isHome && <div className="login-backdrop__orb-trail" />}
      <div className="login-backdrop__scanlines" />
      <div className="login-backdrop__vignette" />
    </div>
  );
}
