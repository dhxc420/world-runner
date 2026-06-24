import { PALETTE } from './constants';

export interface CompanionState {
  x: number;
  y: number;
  phase: number;
  side: -1 | 1;
  pulse: number;
}

export function createCompanion(): CompanionState {
  return { x: 0, y: 0, phase: Math.random() * Math.PI * 2, side: -1, pulse: 0 };
}

export function updateCompanion(
  c: CompanionState,
  playerCx: number,
  playerCy: number,
  dt: number,
) {
  c.phase += dt * 2.2;
  const offsetX = c.side * 52;
  const offsetY = -38 + Math.sin(c.phase) * 14;
  const targetX = playerCx + offsetX;
  const targetY = playerCy + offsetY;
  const follow = 1 - Math.pow(0.001, dt);
  c.x += (targetX - c.x) * follow * 4;
  c.y += (targetY - c.y) * follow * 4;

  if (Math.abs(playerCx - c.x) > 120) {
    c.side = playerCx > c.x ? 1 : -1;
  }
  if (c.pulse > 0) c.pulse = Math.max(0, c.pulse - dt * 1.8);
}

export function pulseCompanion(c: CompanionState, strength = 1) {
  c.pulse = Math.min(1, strength);
}

export function drawCompanion(
  ctx: CanvasRenderingContext2D,
  c: CompanionState,
  elapsed: number,
  accent: string,
  spiritAura = false,
) {
  const pulseBoost = 1 + c.pulse * 0.55;
  const pulse = (0.75 + Math.sin(elapsed * 3 + c.phase) * 0.25) * pulseBoost;
  const radius = (spiritAura ? 24 : 18) * pulse;

  if (spiritAura || c.pulse > 0) {
    ctx.strokeStyle = accent + (spiritAura ? '66' : '44');
    ctx.lineWidth = spiritAura ? 2 : 1;
    ctx.shadowColor = accent;
    ctx.shadowBlur = spiritAura ? 22 : 12;
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);
  g.addColorStop(0, accent + 'ee');
  g.addColorStop(0.45, PALETTE.cyan + '88');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETTE.white;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tiny orbit trail
  for (let i = 1; i <= 3; i += 1) {
    const a = c.phase - i * 0.35;
    const tx = c.x + Math.cos(a) * (8 + i * 3);
    const ty = c.y + Math.sin(a) * (6 + i * 2);
    ctx.globalAlpha = 0.35 - i * 0.08;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(tx, ty, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
