import type { ChunkRole, MapChunk } from './types';

const S = 6;
const FIN = 5;

function c(
  id: string,
  name: string,
  width: number,
  spawns: MapChunk['spawns'],
  role: ChunkRole,
  zoneAccent?: string,
  scale = S,
): MapChunk {
  return {
    id,
    name,
    role,
    zoneAccent,
    width: Math.round(width * scale),
    spawns: spawns.map((s) => ({
      ...s,
      offsetX: Math.round(s.offsetX * scale),
    })),
  };
}

const M1 = 4;

/** Ori / Mario Wonder act chunks — scaled for ~120–180s per level */
export const LEVEL_CHUNKS: Record<string, MapChunk> = {
  /* ── 1-1 Flor Wonder (Mario) ── */
  lvl_1_1_intro: c('lvl_1_1_intro', '¡Vamos!', 520, [
    { offsetX: 70, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 140, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 210, type: 'orb_real', lane: 'air_low' },
    { offsetX: 280, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 350, type: 'orb_real', lane: 'air_high' },
    { offsetX: 420, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 490, type: 'powerup_nova', lane: 'air_high' },
  ], 'intro', '#ff6b8a', M1),
  lvl_1_1_dawn: c('lvl_1_1_dawn', 'Cadena Dorada', 720, [
    { offsetX: 100, type: 'orb_real', lane: 'air_low' },
    { offsetX: 200, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 300, type: 'orb_real', lane: 'air_high' },
    { offsetX: 400, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 500, type: 'wonder_flower', lane: 'air_mid' },
    { offsetX: 620, type: 'orb_real', lane: 'air_high' },
    { offsetX: 700, type: 'orb_real', lane: 'air_mid' },
  ], 'core', '#ffb347', M1),
  lvl_1_1_path: c('lvl_1_1_path', '¡Wonder Time!', 680, [
    { offsetX: 90, type: 'bot', lane: 'ground' },
    { offsetX: 220, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 340, type: 'orb_real', lane: 'air_high' },
    { offsetX: 460, type: 'bot', lane: 'ground' },
    { offsetX: 580, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 650, type: 'powerup_shield', lane: 'air_mid' },
  ], 'climax', '#ffe082', M1),
  lvl_1_1_payoff: c('lvl_1_1_payoff', 'Flor Viva', 520, [
    { offsetX: 120, type: 'wonder_flower', lane: 'air_mid' },
    { offsetX: 300, type: 'orb_real', lane: 'air_high' },
    { offsetX: 450, type: 'rainbow_star', lane: 'air_high' },
  ], 'payoff', '#ffd699', M1),
  lvl_1_1_finish: c('lvl_1_1_finish', 'Bandera', 640, [
    { offsetX: 180, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 380, type: 'orb_real', lane: 'air_high' },
    { offsetX: 560, type: 'spirit_shrine', lane: 'air_mid' },
  ], 'finish', '#fff3e0', M1),

  /* ── 1-2 Escombros Azules ── */
  lvl_1_2_intro: c('lvl_1_2_intro', 'Entrada', 580, [
    { offsetX: 140, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 320, type: 'orb_real', lane: 'air_low' },
    { offsetX: 500, type: 'spirit_shrine', lane: 'air_mid' },
  ], 'intro', '#7ec8ff'),
  lvl_1_2_whisper: c('lvl_1_2_whisper', 'Susurro bajo', 720, [
    { offsetX: 160, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 340, type: 'deepfake', lane: 'air_low' },
    { offsetX: 500, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 650, type: 'deepfake', lane: 'air_low' },
  ], 'core', '#5eb3ff'),
  lvl_1_2_tunnel: c('lvl_1_2_tunnel', 'Túnel Espiritual', 960, [
    { offsetX: 100, type: 'deepfake', lane: 'air_low' },
    { offsetX: 280, type: 'spirit_shrine', lane: 'air_mid' },
    { offsetX: 450, type: 'deepfake', lane: 'air_low' },
    { offsetX: 620, type: 'orb_real', lane: 'air_low' },
    { offsetX: 800, type: 'deepfake', lane: 'air_low' },
  ], 'climax'),
  lvl_1_2_payoff: c('lvl_1_2_payoff', 'Santuario', 650, [
    { offsetX: 180, type: 'spirit_shrine', lane: 'air_mid' },
    { offsetX: 400, type: 'orb_real', lane: 'air_high' },
  ], 'payoff'),
  lvl_1_2_finish: c('lvl_1_2_finish', 'Salida Azul', 850, [
    { offsetX: 250, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 550, type: 'spirit_shrine', lane: 'air_high' },
  ], 'finish', undefined, FIN),

  /* ── 1-3 Ceniza RGB ── */
  lvl_1_3_intro: c('lvl_1_3_intro', 'Ceniza', 600, [
    { offsetX: 150, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 350, type: 'orb_real', lane: 'air_low' },
    { offsetX: 520, type: 'orb_real', lane: 'air_mid' },
  ], 'intro', '#ff99cc'),
  lvl_1_3_flower: c('lvl_1_3_flower', 'Flor Wonder', 640, [
    { offsetX: 200, type: 'wonder_flower', lane: 'air_mid' },
    { offsetX: 400, type: 'orb_real', lane: 'air_low' },
    { offsetX: 560, type: 'orb_real', lane: 'air_high' },
  ], 'core'),
  lvl_1_3_gate: c('lvl_1_3_gate', 'Puerta RGB', 1000, [
    { offsetX: 140, type: 'rainbow_star', lane: 'air_high' },
    { offsetX: 360, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 540, type: 'orb_real', lane: 'air_high' },
    { offsetX: 720, type: 'bot', lane: 'ground' },
    { offsetX: 880, type: 'orb_real', lane: 'air_mid' },
  ], 'climax'),
  lvl_1_3_payoff: c('lvl_1_3_payoff', 'Vuelo RGB', 750, [
    { offsetX: 200, type: 'rainbow_star', lane: 'air_high' },
    { offsetX: 480, type: 'orb_real', lane: 'air_mid' },
  ], 'payoff', '#ff66cc'),
  lvl_1_3_finish: c('lvl_1_3_finish', 'Meta RGB', 880, [
    { offsetX: 300, type: 'orb_real', lane: 'air_high' },
    { offsetX: 600, type: 'rainbow_star', lane: 'air_mid' },
  ], 'finish', undefined, FIN),

  /* ── 2-1 Grid Entre Ruinas ── */
  lvl_2_1_intro: c('lvl_2_1_intro', 'Umbral Grid', 620, [
    { offsetX: 160, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 380, type: 'orb_real', lane: 'air_low' },
    { offsetX: 540, type: 'orb_real', lane: 'air_high' },
  ], 'intro', '#00e5ff'),
  lvl_2_1_pulse_a: c('lvl_2_1_pulse_a', 'Pulso I', 800, [
    { offsetX: 120, type: 'orb_real', lane: 'air_low' },
    { offsetX: 240, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 360, type: 'orb_real', lane: 'air_high' },
    { offsetX: 520, type: 'firewall', lane: 'air_low' },
    { offsetX: 680, type: 'orb_real', lane: 'air_mid' },
  ], 'core', '#00d4ff'),
  lvl_2_1_pulse_b: c('lvl_2_1_pulse_b', 'Pulso II', 880, [
    { offsetX: 100, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 220, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 340, type: 'powerup_nova', lane: 'air_high' },
    { offsetX: 500, type: 'orb_real', lane: 'air_low' },
    { offsetX: 660, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 800, type: 'spirit_shrine', lane: 'air_mid' },
  ], 'climax', '#00ffff'),
  lvl_2_1_payoff: c('lvl_2_1_payoff', 'Eco Neón', 700, [
    { offsetX: 200, type: 'wonder_flower', lane: 'air_mid' },
    { offsetX: 480, type: 'orb_real', lane: 'air_high' },
  ], 'payoff'),
  lvl_2_1_finish: c('lvl_2_1_finish', 'Eco Grid', 850, [
    { offsetX: 280, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 580, type: 'spirit_shrine', lane: 'air_high' },
  ], 'finish', undefined, FIN),

  /* ── 2-2 Convoy de Hierro ── */
  lvl_2_2_intro: c('lvl_2_2_intro', 'Vía Muerta', 600, [
    { offsetX: 180, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 420, type: 'orb_real', lane: 'air_high' },
  ], 'intro', '#ff6677'),
  lvl_2_2_convoy_a: c('lvl_2_2_convoy_a', 'Convoy I', 920, [
    { offsetX: 120, type: 'patrol_car', lane: 'ground' },
    { offsetX: 320, type: 'orb_real', lane: 'air_high' },
    { offsetX: 500, type: 'patrol_car', lane: 'ground' },
    { offsetX: 700, type: 'orb_real', lane: 'air_mid' },
  ], 'core'),
  lvl_2_2_convoy_b: c('lvl_2_2_convoy_b', 'Convoy II', 1000, [
    { offsetX: 80, type: 'patrol_car', lane: 'ground' },
    { offsetX: 240, type: 'patrol_car', lane: 'ground' },
    { offsetX: 420, type: 'orb_real', lane: 'air_high' },
    { offsetX: 600, type: 'patrol_car', lane: 'ground' },
    { offsetX: 780, type: 'powerup_shield', lane: 'air_mid' },
  ], 'climax'),
  lvl_2_2_payoff: c('lvl_2_2_payoff', 'Brecha', 680, [
    { offsetX: 220, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 500, type: 'rainbow_star', lane: 'air_high' },
  ], 'payoff', '#ff4455'),
  lvl_2_2_finish: c('lvl_2_2_finish', 'Salida Convoy', 880, [
    { offsetX: 320, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 620, type: 'powerup_nova', lane: 'air_high' },
  ], 'finish', undefined, FIN),

  /* ── 2-3 Puente de Luz ── */
  lvl_2_3_intro: c('lvl_2_3_intro', 'Abismo', 580, [
    { offsetX: 160, type: 'orb_real', lane: 'air_high' },
    { offsetX: 400, type: 'orb_real', lane: 'air_mid' },
  ], 'intro', '#c4b5fd'),
  lvl_2_3_bridge_a: c('lvl_2_3_bridge_a', 'Puente I', 880, [
    { offsetX: 140, type: 'deepfake', lane: 'air_low' },
    { offsetX: 300, type: 'orb_real', lane: 'air_high' },
    { offsetX: 460, type: 'firewall', lane: 'air_mid' },
    { offsetX: 620, type: 'orb_real', lane: 'air_high' },
  ], 'core'),
  lvl_2_3_bridge_b: c('lvl_2_3_bridge_b', 'Puente II', 960, [
    { offsetX: 100, type: 'rainbow_star', lane: 'air_high' },
    { offsetX: 280, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 440, type: 'deepfake', lane: 'air_low' },
    { offsetX: 600, type: 'orb_real', lane: 'air_high' },
    { offsetX: 780, type: 'firewall', lane: 'air_mid' },
  ], 'climax'),
  lvl_2_3_payoff: c('lvl_2_3_payoff', 'Luz Puente', 720, [
    { offsetX: 240, type: 'spirit_shrine', lane: 'air_mid' },
    { offsetX: 520, type: 'rainbow_star', lane: 'air_high' },
  ], 'payoff', '#a78bfa'),
  lvl_2_3_finish: c('lvl_2_3_finish', 'Cielo Grid', 900, [
    { offsetX: 350, type: 'rainbow_star', lane: 'air_high' },
    { offsetX: 650, type: 'orb_real', lane: 'air_mid' },
  ], 'finish', undefined, FIN),

  /* ── 3-1 Hangar M-7 ── */
  lvl_3_1_intro: c('lvl_3_1_intro', 'Perímetro', 600, [
    { offsetX: 180, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 420, type: 'orb_real', lane: 'air_low' },
  ], 'intro', '#ff8833'),
  lvl_3_1_strike_a: c('lvl_3_1_strike_a', 'Strike I', 900, [
    { offsetX: 120, type: 'bomber', lane: 'air_high' },
    { offsetX: 320, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 520, type: 'bomber', lane: 'air_mid' },
    { offsetX: 720, type: 'orb_real', lane: 'air_low' },
  ], 'core'),
  lvl_3_1_strike_b: c('lvl_3_1_strike_b', 'Strike II', 940, [
    { offsetX: 100, type: 'turret', lane: 'air_mid' },
    { offsetX: 300, type: 'bomber', lane: 'air_high' },
    { offsetX: 500, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 700, type: 'bomber', lane: 'air_high' },
    { offsetX: 860, type: 'powerup_flux', lane: 'air_high' },
  ], 'climax'),
  lvl_3_1_payoff: c('lvl_3_1_payoff', 'Hangar Libre', 700, [
    { offsetX: 260, type: 'powerup_shield', lane: 'air_mid' },
    { offsetX: 520, type: 'orb_real', lane: 'air_high' },
  ], 'payoff', '#ff7722'),
  lvl_3_1_finish: c('lvl_3_1_finish', 'Salida Hangar', 880, [
    { offsetX: 300, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 600, type: 'spirit_shrine', lane: 'air_high' },
  ], 'finish', undefined, FIN),

  /* ── 3-2 Corredor Láser ── */
  lvl_3_2_intro: c('lvl_3_2_intro', 'Acceso', 580, [
    { offsetX: 200, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 450, type: 'orb_real', lane: 'air_high' },
  ], 'intro', '#ff4488'),
  lvl_3_2_laser_a: c('lvl_3_2_laser_a', 'Vals I', 860, [
    { offsetX: 140, type: 'laser_gate', lane: 'air_low' },
    { offsetX: 320, type: 'orb_real', lane: 'air_high' },
    { offsetX: 500, type: 'laser_gate', lane: 'air_low' },
    { offsetX: 680, type: 'turret', lane: 'air_mid' },
  ], 'core'),
  lvl_3_2_laser_b: c('lvl_3_2_laser_b', 'Vals II', 980, [
    { offsetX: 100, type: 'laser_gate', lane: 'air_low' },
    { offsetX: 260, type: 'laser_gate', lane: 'air_mid' },
    { offsetX: 420, type: 'orb_real', lane: 'air_high' },
    { offsetX: 580, type: 'laser_gate', lane: 'air_low' },
    { offsetX: 760, type: 'patrol_car', lane: 'ground' },
    { offsetX: 900, type: 'laser_gate', lane: 'air_low' },
  ], 'climax'),
  lvl_3_2_payoff: c('lvl_3_2_payoff', 'Respiro', 680, [
    { offsetX: 240, type: 'powerup_flux', lane: 'air_high' },
    { offsetX: 500, type: 'orb_real', lane: 'air_mid' },
  ], 'payoff', '#ff2266'),
  lvl_3_2_finish: c('lvl_3_2_finish', 'Corridor Out', 900, [
    { offsetX: 350, type: 'powerup_shield', lane: 'air_mid' },
    { offsetX: 650, type: 'orb_real', lane: 'air_high' },
  ], 'finish', undefined, FIN),

  /* ── 3-3 Omega Salvación ── */
  lvl_3_3_intro: c('lvl_3_3_intro', 'Preludio', 620, [
    { offsetX: 180, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 420, type: 'spirit_shrine', lane: 'air_high' },
  ], 'intro', '#ffe066'),
  lvl_3_3_wave1: c('lvl_3_3_wave1', 'Oleada I', 800, [
    { offsetX: 160, type: 'patrol_car', lane: 'ground' },
    { offsetX: 400, type: 'patrol_car', lane: 'ground' },
    { offsetX: 640, type: 'orb_real', lane: 'air_mid' },
  ], 'core'),
  lvl_3_3_wave2: c('lvl_3_3_wave2', 'Oleada II', 920, [
    { offsetX: 120, type: 'bomber', lane: 'air_high' },
    { offsetX: 340, type: 'turret', lane: 'air_mid' },
    { offsetX: 560, type: 'bomber', lane: 'air_mid' },
    { offsetX: 780, type: 'laser_gate', lane: 'air_low' },
  ], 'climax'),
  lvl_3_3_boss: c('lvl_3_3_boss', 'Omega Final', 1100, [
    { offsetX: 80, type: 'patrol_car', lane: 'ground' },
    { offsetX: 220, type: 'bomber', lane: 'air_high' },
    { offsetX: 380, type: 'laser_gate', lane: 'air_low' },
    { offsetX: 540, type: 'turret', lane: 'air_mid' },
    { offsetX: 700, type: 'bot', lane: 'ground' },
    { offsetX: 860, type: 'rainbow_star', lane: 'air_high' },
    { offsetX: 1000, type: 'bomber', lane: 'air_mid' },
  ], 'climax', '#ffd54a'),
  lvl_3_3_finish: c('lvl_3_3_finish', 'Victoria Omega', 950, [
    { offsetX: 250, type: 'orb_real', lane: 'air_mid' },
    { offsetX: 550, type: 'spirit_shrine', lane: 'air_high' },
    { offsetX: 800, type: 'rainbow_star', lane: 'air_high' },
  ], 'finish', '#ffd54a', FIN),
};
