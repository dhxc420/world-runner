import { PALETTE } from './constants';
import type { Particle, TrailPoint } from './types';

export function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
  opts?: { speed?: number; glow?: boolean; size?: number },
) {
  const speed = opts?.speed ?? 120;
  const size = opts?.size ?? 3;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const v = speed * (0.6 + Math.random() * 0.6);
    const life = 0.4 + Math.random() * 0.35;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life,
      maxLife: life,
      color,
      size: size * (0.5 + Math.random()),
      glow: opts?.glow ?? true,
    });
  }
}

export function spawnTrailSpark(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
) {
  particles.push({
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    vx: -60 - Math.random() * 80,
    vy: (Math.random() - 0.5) * 40,
    life: 0.25 + Math.random() * 0.2,
    maxLife: 0.45,
    color,
    size: 1.5 + Math.random() * 2,
    glow: true,
  });
}

export function spawnDeathExplosion(particles: Particle[], x: number, y: number) {
  spawnBurst(particles, x, y, PALETTE.redNeon, 24, { speed: 200, size: 4 });
  spawnBurst(particles, x, y, PALETTE.magenta, 16, { speed: 140, size: 3 });
  spawnBurst(particles, x, y, PALETTE.teal, 12, { speed: 100, size: 2 });
}

export function spawnCollectRing(particles: Particle[], x: number, y: number, color: string) {
  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 160,
      vy: Math.sin(angle) * 160,
      life: 0.5,
      maxLife: 0.5,
      color,
      size: 2,
      glow: true,
    });
  }
}

export function pushTrail(trail: TrailPoint[], x: number, y: number, max = 18) {
  trail.unshift({ x, y, alpha: 1 });
  if (trail.length > max) trail.pop();
  for (let i = 0; i < trail.length; i += 1) {
    trail[i].alpha = 1 - i / max;
  }
}

export function updateParticles(
  particles: Particle[],
  dt: number,
  scroll: number,
): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x - scroll * 0.15 + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 120 * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}
