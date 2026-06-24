'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { gameStorage } from '@/lib/gameStorage';

interface PlayerProgressContextValue {
  highScore: number;
  verifiedHuman: boolean;
  premiumSkin: boolean;
  wonderTrail: boolean;
  spiritAura: boolean;
  continues: number;
  speedBoosts: number;
  magnetBoosts: number;
  refresh: () => void;
  setVerifiedHuman: (value: boolean) => void;
  grantProduct: (productId: string) => void;
  consumePreRunBoost: (type: 'speed' | 'magnet') => boolean;
}

const PlayerProgressContext = createContext<PlayerProgressContextValue | null>(null);

export function PlayerProgressProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const setVerifiedHuman = useCallback(
    (value: boolean) => {
      gameStorage.setVerifiedHuman(value);
      refresh();
    },
    [refresh],
  );

  const grantProduct = useCallback(
    (productId: string) => {
      switch (productId) {
        case 'premium_skin':
          gameStorage.setPremiumSkin(true);
          break;
        case 'wonder_trail':
          gameStorage.setWonderTrail(true);
          break;
        case 'spirit_aura':
          gameStorage.setSpiritAura(true);
          break;
        default:
          break;
      }
      refresh();
    },
    [refresh],
  );

  const consumePreRunBoost = useCallback((type: 'speed' | 'magnet') => {
    if (type === 'speed') return gameStorage.consumeSpeedBoost();
    return gameStorage.consumeMagnetBoost();
  }, []);

  const value = useMemo<PlayerProgressContextValue>(
    () => ({
      highScore: gameStorage.getHighScore(),
      verifiedHuman: gameStorage.isVerifiedHuman(),
      premiumSkin: gameStorage.hasPremiumSkin(),
      wonderTrail: gameStorage.hasWonderTrail(),
      spiritAura: gameStorage.hasSpiritAura(),
      continues: gameStorage.getContinues(),
      speedBoosts: gameStorage.getSpeedBoosts(),
      magnetBoosts: gameStorage.getMagnetBoosts(),
      refresh,
      setVerifiedHuman,
      grantProduct,
      consumePreRunBoost,
    }),
    // tick forces re-read from localStorage after purchases / verify
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, refresh, setVerifiedHuman, grantProduct, consumePreRunBoost],
  );

  return (
    <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>
  );
}

export function usePlayerProgress() {
  const ctx = useContext(PlayerProgressContext);
  if (!ctx) throw new Error('usePlayerProgress must be used within PlayerProgressProvider');
  return ctx;
}
