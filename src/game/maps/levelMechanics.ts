/** Gimmicks inspirados en Ori (exploración/espíritu) y Mario Wonder (efecto único por nivel) */

import type { WonderVariant } from '../wonderMode';

export type LevelMechanicId =
  | 'ori_first_light'
  | 'ori_spirit_dive'
  | 'wonder_rainbow'
  | 'grid_pulse'
  | 'convoy_alley'
  | 'star_bridge'
  | 'hangar_dawn'
  | 'laser_waltz'
  | 'omega_siege';

export type MechanicGimmick =
  | 'tutorial_light'
  | 'mario_wonder'
  | 'spirit_duck'
  | 'rainbow_fly'
  | 'neon_pulse'
  | 'convoy_only'
  | 'sky_danger'
  | 'aerial_strike'
  | 'laser_rhythm'
  | 'siege_waves';

export interface LevelMechanic {
  id: LevelMechanicId;
  wonderName: string;
  description: string;
  /** Cómo jugar — visible en briefing móvil */
  mobileTip: string;
  /** Salto más alto / Mario bounce */
  jumpMult: number;
  gravityMult: number;
  /** Multiplicador de rampa de aceleración */
  speedRampMult: number;
  /** Velocidad inicial = BASE_SPEED × baseSpeedMult × level.speedMultiplier */
  baseSpeedMult: number;
  /** Tope de velocidad = BASE_SPEED × maxSpeedMult × level.speedMultiplier */
  maxSpeedMult: number;
  gimmick: MechanicGimmick;
  wonderVariant: WonderVariant;
  /** Wonder corto al entrar al acto climax */
  climaxWonder?: boolean;
  finite: boolean;
}

export const LEVEL_MECHANICS: Record<LevelMechanicId, LevelMechanic> = {
  ori_first_light: {
    id: 'ori_first_light',
    wonderName: 'Wonder: Flor del Amanecer',
    description: 'Estilo Mario Wonder — saltos altos, cadena de monedas y una flor al final del acto.',
    mobileTip: 'Botón A = saltar. Agáchate solo si hace falta. ¡Corre y recoge la cadena dorada!',
    jumpMult: 1.14,
    gravityMult: 0.74,
    speedRampMult: 0.78,
    baseSpeedMult: 0.66,
    maxSpeedMult: 0.96,
    gimmick: 'mario_wonder',
    wonderVariant: 'rainbow',
    climaxWonder: true,
    finite: true,
  },
  ori_spirit_dive: {
    id: 'ori_spirit_dive',
    wonderName: 'Wonder: Santuario bajo',
    description: 'Espíritus flotan bajo. Agáchate como en Ori al pasar bajo los shrines.',
    mobileTip: 'Mantén Agachar bajo obstáculos bajos.',
    jumpMult: 1.04,
    gravityMult: 0.96,
    speedRampMult: 0.62,
    baseSpeedMult: 0.58,
    maxSpeedMult: 0.8,
    gimmick: 'spirit_duck',
    wonderVariant: 'float',
    finite: true,
  },
  wonder_rainbow: {
    id: 'wonder_rainbow',
    wonderName: 'Wonder: Flor RGB',
    description: 'Recolecta la flor Wonder y la ★ Rainbow Star para volar invencible.',
    mobileTip: 'Estrella RGB: vuela a media altura. Agáchate para bajar.',
    jumpMult: 1.08,
    gravityMult: 0.78,
    speedRampMult: 0.68,
    baseSpeedMult: 0.62,
    maxSpeedMult: 0.88,
    gimmick: 'rainbow_fly',
    wonderVariant: 'rainbow',
    climaxWonder: true,
    finite: true,
  },
  grid_pulse: {
    id: 'grid_pulse',
    wonderName: 'Wonder: Pulso Neón',
    description: 'La velocidad late al compás neón. Cascada rítmica de orbes y firewalls.',
    mobileTip: 'Siente el pulso: acelera y frena con el ritmo del Grid.',
    jumpMult: 1,
    gravityMult: 1,
    speedRampMult: 0.82,
    baseSpeedMult: 0.62,
    maxSpeedMult: 0.94,
    gimmick: 'neon_pulse',
    wonderVariant: 'rainbow',
    climaxWonder: true,
    finite: true,
  },
  convoy_alley: {
    id: 'convoy_alley',
    wonderName: 'Wonder: Convoy Rojo',
    description: 'Solo vehículos en tierra. Salta por encima del convoy blindado.',
    mobileTip: 'Peligro en el suelo. Salta cuando veas el convoy rojo.',
    jumpMult: 1.02,
    gravityMult: 1.04,
    speedRampMult: 0.88,
    baseSpeedMult: 0.66,
    maxSpeedMult: 1.0,
    gimmick: 'convoy_only',
    wonderVariant: 'glow',
    finite: true,
  },
  star_bridge: {
    id: 'star_bridge',
    wonderName: 'Wonder: Puente Estelar',
    description: 'Todo el peligro está en el aire. El suelo es tu refugio seguro.',
    mobileTip: 'Quédate en tierra. El cielo es trampa: salta solo para orbes.',
    jumpMult: 1,
    gravityMult: 0.94,
    speedRampMult: 0.78,
    baseSpeedMult: 0.64,
    maxSpeedMult: 0.94,
    gimmick: 'sky_danger',
    wonderVariant: 'float',
    finite: true,
  },
  hangar_dawn: {
    id: 'hangar_dawn',
    wonderName: 'Wonder: Amanecer Hangar',
    description: 'Bombarderos desde arriba. Reacciona rápido entre oleadas aéreas.',
    mobileTip: 'Mira arriba: bombarderos y torretas. Ritmo rápido.',
    jumpMult: 1,
    gravityMult: 1,
    speedRampMult: 0.95,
    baseSpeedMult: 0.7,
    maxSpeedMult: 1.1,
    gimmick: 'aerial_strike',
    wonderVariant: 'glow',
    finite: true,
  },
  laser_waltz: {
    id: 'laser_waltz',
    wonderName: 'Wonder: Vals Láser',
    description: 'Láseres alternan altura al compás. Esquiva en ritmo mortal.',
    mobileTip: 'Láseres en vals: salta o agáchate al beat. Muy rápido.',
    jumpMult: 1,
    gravityMult: 1,
    speedRampMult: 1.02,
    baseSpeedMult: 0.76,
    maxSpeedMult: 1.16,
    gimmick: 'laser_rhythm',
    wonderVariant: 'rainbow',
    climaxWonder: true,
    finite: true,
  },
  omega_siege: {
    id: 'omega_siege',
    wonderName: 'Wonder: Asedio Omega',
    description: 'Oleadas escalonadas: convoy → aire → láser → jefe final.',
    mobileTip: 'Nivel más intenso. Cada zona cambia el tipo de amenaza.',
    jumpMult: 0.98,
    gravityMult: 1.06,
    speedRampMult: 1.15,
    baseSpeedMult: 0.78,
    maxSpeedMult: 1.22,
    gimmick: 'siege_waves',
    wonderVariant: 'rainbow',
    climaxWonder: true,
    finite: true,
  },
};

export function getMechanic(id: LevelMechanicId): LevelMechanic {
  return LEVEL_MECHANICS[id];
}

export type PaceLabel = 'tutorial' | 'tranquilo' | 'medio' | 'rapido' | 'extremo';

const PACE_COPY: Record<PaceLabel, string> = {
  tutorial: 'Tutorial — ritmo suave',
  tranquilo: 'Tranquilo',
  medio: 'Medio',
  rapido: 'Rápido',
  extremo: 'Extremo',
};

export function getLevelPaceLabel(level: { mechanic: LevelMechanicId; speedMultiplier: number }): string {
  const mech = getMechanic(level.mechanic);
  const peak = mech.maxSpeedMult * level.speedMultiplier;
  let key: PaceLabel;
  if (peak < 0.62) key = 'tutorial';
  else if (peak < 0.78) key = 'tranquilo';
  else if (peak < 0.95) key = 'medio';
  else if (peak < 1.12) key = 'rapido';
  else key = 'extremo';
  return PACE_COPY[key];
}

export function estimateMechanicAvgSpeed(
  mechanicId: LevelMechanicId,
  levelSpeedMult: number,
): number {
  const mech = getMechanic(mechanicId);
  const start = 252 * mech.baseSpeedMult * levelSpeedMult;
  const peak = 252 * mech.maxSpeedMult * levelSpeedMult;
  return (start + peak) / 2;
}
