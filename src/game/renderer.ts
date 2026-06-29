import { PALETTE } from './constants';
import { drawCompanion } from './companion';
import { drawButterflyTrail, drawNeonButterfly } from './drawButterfly';
import { drawFloatTexts } from './floatText';
import type { ObstacleEntity, OrbEntity, Particle, PickupEntity, PowerupEntity, ProjectileEntity, RenderState } from './types';
import { drawZoneCard } from './zoneCard';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export class GameRenderer {
  draw(ctx: CanvasRenderingContext2D, state: RenderState) {
    ctx.save();
    ctx.translate(state.shakeX, state.shakeY);

    this.drawBackground(ctx, state);
    this.drawAurora(ctx, state);
    this.drawWisps(ctx, state);
    this.drawParallax(ctx, state);
    this.drawTronGrid(ctx, state);
    this.drawGround(ctx, state);

    for (const o of state.orbs) {
      if (!o.collected) this.drawOrb(ctx, o, state.elapsed);
    }
    for (const p of state.powerups) {
      if (!p.collected) this.drawPowerup(ctx, p, state.elapsed);
    }
    for (const pk of state.pickups) {
      if (!pk.collected) this.drawPickup(ctx, pk, state.elapsed);
    }
    for (const o of state.obstacles) {
      this.drawObstacle(ctx, o, state.elapsed);
    }
    for (const p of state.projectiles) {
      this.drawProjectile(ctx, p);
    }

    this.drawTrail(ctx, state);
    if (state.wonderTimer > 0) this.drawWonderOverlay(ctx, state);
    if (state.rainbowStarTimer > 0) this.drawRainbowStarOverlay(ctx, state);
    if (state.novaTimer > 0) this.drawNovaAura(ctx, state);
    this.drawButterfly(ctx, state);
    drawCompanion(
      ctx,
      state.companion,
      state.elapsed,
      state.mapTheme.accent,
      state.modifiers.spiritAura,
    );
    this.drawParticles(ctx, state.particles);
    drawFloatTexts(ctx, state.floatTexts);
    this.drawSpeedLines(ctx, state);
    if (state.dyingTimer > 0) this.drawDeathVignette(ctx, state);
    if (state.showFinishGate) this.drawFinishGate(ctx, state);
    this.drawHud(ctx, state);
    if (state.zoneCard) {
      drawZoneCard(ctx, state.zoneCard, state.width, state.height);
    }

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, height } = s;
    const t = s.mapTheme;
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, t.void);
    g.addColorStop(0.35, t.auroraC);
    g.addColorStop(0.7, t.auroraB);
    g.addColorStop(1, '#050508');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    for (const star of s.stars) {
      const twinkle = 0.4 + Math.sin(s.elapsed * 3 + star.twinkle) * 0.35;
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = star.size > 1.5 ? PALETTE.tealSoft : PALETTE.white;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawAurora(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, elapsed } = s;
    const t = s.mapTheme;
    const bands = 3;
    const colors = [t.accent, t.grid, t.groundLine];
    for (let i = 0; i < bands; i += 1) {
      const y = groundY * (0.15 + i * 0.12);
      const wave = Math.sin(elapsed * 0.4 + i * 1.2) * 30;
      const g = ctx.createLinearGradient(0, y - 60, 0, y + 80);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, colors[i] + '20');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 20) {
        const ny = y + Math.sin(x * 0.008 + elapsed * 0.6 + i) * 18 + wave;
        ctx.lineTo(x, ny);
      }
      ctx.lineTo(width, groundY);
      ctx.lineTo(0, groundY);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawWisps(ctx: CanvasRenderingContext2D, s: RenderState) {
    for (const w of s.wisps) {
      const pulse = 0.5 + Math.sin(s.elapsed * 2 + w.phase) * 0.3;
      const g = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.size * pulse);
      g.addColorStop(0, `hsla(${w.hue}, 90%, 70%, 0.5)`);
      g.addColorStop(0.5, `hsla(${w.hue}, 80%, 50%, 0.15)`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.size * pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    switch (s.mapTheme.parallax) {
      case 'ruins':
        this.drawRuinsParallax(ctx, s);
        break;
      case 'warzone':
        this.drawWarzoneParallax(ctx, s);
        break;
      case 'ruins_grid':
      default:
        this.drawRuinsGridParallax(ctx, s);
        break;
    }
  }

  /** Metal Slug–style ruined city silhouettes (Act I) */
  private drawRuinsParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance, elapsed, visualSeed } = s;
    const fire = s.mapTheme.accent;
    const seed = visualSeed || 1;
    const buildingCount = 8 + (seed % 5);
    const spacing = 108 + (seed % 24);

    // Distant smoke plumes
    for (let i = 0; i < 4; i += 1) {
      const sx = ((i * 180 - (distance * 0.4) % 180) + width) % (width + 180) - 90;
      const sh = 60 + (i % 2) * 30;
      const drift = Math.sin(elapsed * 0.3 + i) * 12;
      const g = ctx.createRadialGradient(sx + drift, groundY - sh, 0, sx + drift, groundY - sh, sh);
      g.addColorStop(0, 'rgba(80, 70, 65, 0.35)');
      g.addColorStop(0.5, 'rgba(60, 55, 50, 0.15)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(sx + drift, groundY - sh, sh * 0.6, sh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Broken building silhouettes
    for (let i = 0; i < buildingCount; i += 1) {
      const bx = ((i * spacing - (distance * (1.4 + (seed % 3) * 0.1)) % spacing) + width) % (width + spacing) - spacing / 2;
      const bh = 45 + ((i + seed) % 6) * 26;
      const broken = i % 3 === 0;
      const topY = groundY - bh + (broken ? 12 : 0);

      ctx.fillStyle = 'rgba(28, 30, 36, 0.85)';
      ctx.beginPath();
      ctx.moveTo(bx, groundY);
      if (broken) {
        ctx.lineTo(bx, topY + 8);
        ctx.lineTo(bx + 18, topY);
        ctx.lineTo(bx + 32, topY + 14);
        ctx.lineTo(bx + 44, topY - 4);
      } else {
        ctx.lineTo(bx + 8, topY);
        ctx.lineTo(bx + 36, topY);
      }
      ctx.lineTo(bx + 44, groundY);
      ctx.closePath();
      ctx.fill();

      // Window fire glow
      if (i % 2 === 0) {
        const flicker = 0.5 + Math.sin(elapsed * 3 + i * 1.7) * 0.4;
        ctx.fillStyle = hexAlpha(fire, flicker * 0.85);
        ctx.shadowColor = fire;
        ctx.shadowBlur = 10;
        ctx.fillRect(bx + 10, groundY - bh * 0.55, 8, 10);
        ctx.fillRect(bx + 26, groundY - bh * 0.35, 6, 8);
        ctx.shadowBlur = 0;
      }

      // Rubble at base
      ctx.fillStyle = 'rgba(45, 48, 55, 0.7)';
      ctx.fillRect(bx - 4, groundY - 6, 12, 6);
      ctx.fillRect(bx + 30, groundY - 4, 10, 4);
    }
  }

  /** Neon grid corridor between ruined towers (Act II) */
  private drawRuinsGridParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance, elapsed, visualSeed } = s;
    const t = s.mapTheme;
    const seed = visualSeed || 1;
    const towerCount = 5 + (seed % 4);

    // Ruined towers behind grid
    for (let i = 0; i < towerCount; i += 1) {
      const bx = ((i * (128 + seed % 20) - (distance * (1.6 + (seed % 4) * 0.05)) % 140) + width) % (width + 140) - 70;
      const bh = 62 + ((i + seed) % 5) * 24;
      ctx.fillStyle = 'rgba(20, 24, 32, 0.6)';
      ctx.fillRect(bx, groundY - bh, 52, bh);
      // Jagged top
      ctx.beginPath();
      ctx.moveTo(bx, groundY - bh);
      ctx.lineTo(bx + 16, groundY - bh - 8);
      ctx.lineTo(bx + 36, groundY - bh + 4);
      ctx.lineTo(bx + 52, groundY - bh - 6);
      ctx.lineTo(bx + 52, groundY - bh);
      ctx.fill();

      const flicker = Math.sin(elapsed * 4 + i) > 0;
      if (flicker) {
        ctx.fillStyle = t.grid + '55';
        ctx.shadowColor = t.grid;
        ctx.shadowBlur = 6;
        ctx.fillRect(bx + 10, groundY - bh + 14, 10, 6);
        ctx.fillRect(bx + 30, groundY - bh + 32, 10, 6);
        ctx.shadowBlur = 0;
      }
    }

    // Neon grid accent lines on ruins
    ctx.strokeStyle = t.grid + '22';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const lx = ((i * 90 - (distance * 2.5) % 90) + width) % (width + 90);
      ctx.beginPath();
      ctx.moveTo(lx, groundY - 20);
      ctx.lineTo(lx + 20, groundY - 80);
      ctx.stroke();
    }
  }

  /** Industrial war zone hangar (Act III) */
  private drawWarzoneParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance, elapsed, visualSeed } = s;
    const t = s.mapTheme;
    const seed = visualSeed || 1;

    // Heavy smoke stacks
    for (let i = 0; i < 3; i += 1) {
      const sx = ((i * 220 - (distance * 0.5) % 220) + width) % (width + 220) - 110;
      const g = ctx.createRadialGradient(sx, groundY - 100, 0, sx, groundY - 100, 70);
      g.addColorStop(0, 'rgba(70, 60, 55, 0.4)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(sx + Math.sin(elapsed * 0.5 + i) * 8, groundY - 90, 40, 70, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Destroyed industrial structures
    const structCount = 4 + (seed % 4);
    for (let i = 0; i < structCount; i += 1) {
      const bx = ((i * (148 + seed % 16) - (distance * (1.3 + (seed % 3) * 0.05)) % 155) + width) % (width + 155) - 77;
      ctx.fillStyle = '#18141a';
      ctx.fillRect(bx, groundY - 85, 64, 85);
      ctx.strokeStyle = '#2a2028';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, groundY - 85, 64, 85);

      // Warning LEDs / fire
      const ledColors = [t.accent, '#ff4400', '#cc2200', '#ffaa00'];
      const ledIdx = Math.floor(elapsed * 2 + i) % ledColors.length;
      ctx.fillStyle = ledColors[ledIdx];
      ctx.shadowColor = ledColors[ledIdx];
      ctx.shadowBlur = 8;
      ctx.fillRect(bx + 8, groundY - 72, 48, 5);
      ctx.shadowBlur = 0;

      // Collapsed pipe / rubble
      ctx.fillStyle = '#221a20';
      ctx.fillRect(bx + 22, groundY - 48, 18, 48);
      ctx.fillStyle = 'rgba(50, 45, 48, 0.8)';
      ctx.beginPath();
      ctx.moveTo(bx + 60, groundY);
      ctx.lineTo(bx + 72, groundY - 12);
      ctx.lineTo(bx + 80, groundY);
      ctx.fill();
    }

    // Scattered debris on horizon
    for (let i = 0; i < 8; i += 1) {
      const dx = ((i * 70 - (distance * 3) % 70) + width) % (width + 70);
      ctx.fillStyle = 'rgba(55, 50, 48, 0.6)';
      ctx.fillRect(dx, groundY - 4 - (i % 3) * 3, 8 + (i % 4) * 4, 4);
    }
  }

  private drawTronGrid(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, height, groundY, distance, speed } = s;
    const theme = s.mapTheme;
    const gridTop = groundY + 8;
    const gridH = height - gridTop;

    // Horizon glow line (all themes — Ori-style ground rim)
    const horizonGrad = ctx.createLinearGradient(0, groundY - 2, 0, groundY + 20);
    horizonGrad.addColorStop(0, theme.groundLine + 'cc');
    horizonGrad.addColorStop(0.3, theme.groundLine + '44');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, groundY - 3, width, 24);

    ctx.shadowColor = theme.groundLine;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = theme.groundLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (theme.parallax !== 'ruins_grid') return;

    const offset = (distance * 6) % 50;
    const speedFactor = speed / 470;

    ctx.lineWidth = 1;

    for (let y = gridTop; y < height; y += 14 + speedFactor * 4) {
      const progress = (y - gridTop) / gridH;
      const alpha = lerp(0.04, 0.2, progress);
      ctx.strokeStyle = hexAlpha(theme.grid, alpha);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = hexAlpha(theme.grid, 0.12);
    for (let x = -offset; x < width + 50; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, gridTop);
      ctx.lineTo(x - 30, height);
      ctx.stroke();
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, height, groundY, distance } = s;
    const t = s.mapTheme;
    const g = ctx.createLinearGradient(0, groundY, 0, height);
    g.addColorStop(0, t.ground);
    g.addColorStop(1, t.void);
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, width, height - groundY);

    const dashOffset = (distance * 5) % 45;
    ctx.strokeStyle = t.grid + '40';
    ctx.lineWidth = 2;
    ctx.shadowColor = t.accent;
    ctx.shadowBlur = 6;
    for (let x = -dashOffset; x < width; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 22);
      ctx.lineTo(x + 22, groundY + 22);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Rubble / cracked pavement for ruined themes
    if (t.parallax === 'ruins' || t.parallax === 'warzone') {
      const rubbleOffset = (distance * 4) % 60;
      ctx.fillStyle = 'rgba(50, 52, 58, 0.5)';
      for (let x = -rubbleOffset; x < width + 30; x += 35) {
        const h = 3 + (Math.abs(x) % 5);
        ctx.fillRect(x, groundY + 8, 10 + (x % 12), h);
        ctx.fillRect(x + 18, groundY + 14, 6, 2);
      }
    }
  }

  private drawOrb(ctx: CanvasRenderingContext2D, orb: OrbEntity, elapsed: number) {
    const bob = Math.sin(elapsed * 4 + orb.bobPhase) * 4;
    const y = orb.y + bob;
    const pulse = 1 + Math.sin(elapsed * 6 + orb.bobPhase) * 0.12;
    const r = orb.radius * pulse;

    if (orb.real) {
      // Outer rotating ring (Tron)
      ctx.save();
      ctx.translate(orb.x, y);
      ctx.rotate(orb.ringAngle);
      ctx.strokeStyle = PALETTE.gold + '88';
      ctx.lineWidth = 2;
      ctx.shadowColor = PALETTE.goldGlow;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, r + 8, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      const g = ctx.createRadialGradient(orb.x, y, 0, orb.x, y, r);
      g.addColorStop(0, PALETTE.white);
      g.addColorStop(0.3, PALETTE.gold);
      g.addColorStop(0.7, PALETTE.gold + 'aa');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.shadowColor = PALETTE.goldGlow;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(orb.x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Corrupted orb — glitchy red
      const glitch = Math.sin(elapsed * 20) > 0.7 ? 3 : 0;
      ctx.fillStyle = PALETTE.fakeOrb;
      ctx.shadowColor = PALETTE.redNeon;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(orb.x + glitch, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(orb.x - 7, y - 7);
      ctx.lineTo(orb.x + 7, y + 7);
      ctx.moveTo(orb.x + 7, y - 7);
      ctx.lineTo(orb.x - 7, y + 7);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  private drawPowerup(ctx: CanvasRenderingContext2D, p: PowerupEntity, elapsed: number) {
    const bob = Math.sin(elapsed * 5 + p.bobPhase) * 5;
    const y = p.y + bob;
    const r = p.radius;
    const colors = { shield: PALETTE.shield, flux: PALETTE.flux, nova: PALETTE.nova };
    const color = colors[p.kind];

    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, y, r + 6 + Math.sin(elapsed * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color + '44';
    ctx.beginPath();
    if (p.kind === 'shield') {
      ctx.moveTo(p.x, y - r);
      ctx.lineTo(p.x + r * 0.9, y - r * 0.3);
      ctx.lineTo(p.x + r * 0.7, y + r);
      ctx.lineTo(p.x - r * 0.7, y + r);
      ctx.lineTo(p.x - r * 0.9, y - r * 0.3);
      ctx.closePath();
    } else if (p.kind === 'flux') {
      ctx.arc(p.x, y, r * 0.75, 0, Math.PI * 2);
    } else {
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const px = p.x + Math.cos(a) * r * 0.8;
        const py = y + Math.sin(a) * r * 0.8;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    switch (o.kind) {
      case 'bot':
        this.drawBot(ctx, o, elapsed);
        break;
      case 'deepfake':
        this.drawDeepfake(ctx, o, elapsed);
        break;
      case 'firewall':
        this.drawFirewall(ctx, o, elapsed);
        break;
      case 'patrol_car':
        this.drawPatrolCar(ctx, o, elapsed);
        break;
      case 'bomber':
        this.drawBomber(ctx, o, elapsed);
        break;
      case 'turret':
        this.drawTurret(ctx, o, elapsed);
        break;
      case 'laser_gate':
        this.drawLaserGate(ctx, o, elapsed);
        break;
      default:
        break;
    }
  }

  private drawProjectile(ctx: CanvasRenderingContext2D, p: ProjectileEntity) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.color;
    ctx.fillRect(0, -p.h / 2, p.w, p.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.w - 4, -1, 4, 2);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /** Metal Slug style patrol jeep */
  private drawPatrolCar(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const cx = o.x + o.w / 2;
    const baseY = o.y + o.h;
    const bounce = Math.sin(elapsed * 12 + o.phase) * 1.5;
    ctx.save();
    ctx.translate(cx, baseY + bounce);

    ctx.fillStyle = '#8b2020';
    ctx.fillRect(-o.w / 2, -o.h + 8, o.w, o.h - 10);
    ctx.fillStyle = '#c43030';
    ctx.fillRect(-o.w / 2 + 4, -o.h + 10, o.w - 8, 14);

    ctx.fillStyle = '#1a1a22';
    for (let wx = -o.w / 2 + 6; wx < o.w / 2 - 6; wx += 14) {
      ctx.beginPath();
      ctx.arc(wx, -4, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    const gunAngle = Math.sin(elapsed * 3 + o.phase) * 0.15;
    ctx.save();
    ctx.translate(o.w / 2 - 8, -o.h / 2);
    ctx.rotate(gunAngle);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, -3, 22, 6);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(18, -2, 6, 4);
    ctx.restore();

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('!', -2, -o.h + 20);
    ctx.restore();
  }

  /** Side-scrolling bomber aircraft */
  private drawBomber(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const tilt = Math.sin(elapsed * 4 + o.phase) * 0.08;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    ctx.fillStyle = '#3a4458';
    ctx.beginPath();
    ctx.moveTo(-o.w / 2, 4);
    ctx.lineTo(-o.w / 4, -o.h / 2);
    ctx.lineTo(o.w / 3, -o.h / 2 + 2);
    ctx.lineTo(o.w / 2, 0);
    ctx.lineTo(o.w / 3, o.h / 2 - 2);
    ctx.lineTo(-o.w / 4, o.h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#556070';
    ctx.fillRect(-8, -o.h / 2 - 6, 16, 8);

    const propSpin = elapsed * 30 + o.phase;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(o.w / 2, 0);
    ctx.lineTo(o.w / 2 + 10 + Math.sin(propSpin) * 4, Math.cos(propSpin) * 6);
    ctx.stroke();

    const bombDrop = (Math.sin(elapsed * 5 + o.phase) + 1) * 0.5;
    if (bombDrop > 0.7) {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(0, o.h / 2 + 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Ground turret with laser sight */
  private drawTurret(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const cx = o.x + o.w / 2;
    const baseY = o.y + o.h;
    ctx.save();
    ctx.translate(cx, baseY);

    ctx.fillStyle = '#2a3040';
    ctx.fillRect(-16, -10, 32, 10);
    ctx.fillStyle = '#1a2030';
    ctx.beginPath();
    ctx.arc(0, -o.h + 14, 14, 0, Math.PI * 2);
    ctx.fill();

    const aim = Math.atan2(Math.sin(elapsed + o.phase), 1);
    ctx.save();
    ctx.rotate(aim * 0.4 - 0.3);
    ctx.fillStyle = '#444';
    ctx.fillRect(0, -4, 28, 8);
    ctx.fillStyle = '#ff2244';
    const pulse = Math.sin(elapsed * 16) > 0.3;
    if (pulse) {
      ctx.shadowColor = '#ff2244';
      ctx.shadowBlur = 14;
      ctx.fillRect(24, -2, 8, 4);
    }
    ctx.restore();

    ctx.strokeStyle = `rgba(255, 50, 80, ${0.2 + Math.sin(elapsed * 10) * 0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -o.h + 14);
    ctx.lineTo(-60, -o.h - 20);
    ctx.stroke();
    ctx.restore();
  }

  /** Horizontal laser gate — duck to survive */
  private drawLaserGate(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const pulse = 0.6 + Math.sin(elapsed * 18 + o.phase) * 0.4;
    const cy = o.y + o.h / 2;
    ctx.save();
    ctx.shadowColor = '#ff00aa';
    ctx.shadowBlur = 20 * pulse;
    ctx.strokeStyle = `rgba(255, 0, 170, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x, cy);
    ctx.lineTo(o.x + o.w, cy);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 100, 200, ${pulse * 0.35})`;
    ctx.fillRect(o.x, cy - 4, o.w, 8);
    for (let i = 0; i < 4; i += 1) {
      const ex = o.x + (o.w / 4) * (i + 0.5);
      ctx.fillStyle = '#ff66cc';
      ctx.fillRect(ex - 3, cy - 8, 6, 16);
    }
    ctx.restore();
  }

  private drawBot(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    this.drawMarathonDrone(ctx, o, elapsed);
  }

  /** Bungie Marathon-style security drone — industrial chassis + LED strips */
  private drawMarathonDrone(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const cx = o.x + o.w / 2;
    const baseY = o.y + o.h;
    const walk = Math.sin(elapsed * 10 + o.phase) * 2;

    ctx.save();
    ctx.translate(cx, baseY + walk * 0.3);

    const bodyW = o.w * 0.85;
    const bodyH = o.h * 0.72;

    // Tank treads
    ctx.fillStyle = '#1a1e28';
    ctx.strokeStyle = '#3a4458';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-bodyW / 2 - 4, -8, bodyW + 8, 10);
    ctx.strokeRect(-bodyW / 2 - 4, -8, bodyW + 8, 10);
    for (let tx = -bodyW / 2; tx < bodyW / 2; tx += 8) {
      ctx.fillStyle = '#2a3040';
      ctx.fillRect(tx, -7, 4, 6);
    }

    // Main chassis — angular Marathon hull
    ctx.fillStyle = '#222830';
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2, -8);
    ctx.lineTo(-bodyW / 2 + 6, -bodyH);
    ctx.lineTo(bodyW / 2 - 6, -bodyH);
    ctx.lineTo(bodyW / 2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shoulder blocks
    ctx.fillStyle = '#2a3040';
    ctx.fillRect(-bodyW / 2 - 6, -bodyH + 8, 10, 16);
    ctx.fillRect(bodyW / 2 - 4, -bodyH + 8, 10, 16);

    // Head unit
    const headY = -bodyH - 10;
    ctx.fillStyle = '#1a1e26';
    ctx.strokeStyle = '#5a6478';
    ctx.fillRect(-14, headY, 28, 14);
    ctx.strokeRect(-14, headY, 28, 14);

    // LED eyes — Marathon style (red/green alternating)
    const eyeOn = Math.sin(elapsed * 14 + o.phase) > 0;
    const eyeColor = eyeOn ? '#ff2200' : '#00ff44';
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(-10, headY + 4, 6, 4);
    ctx.fillRect(4, headY + 4, 6, 4);
    ctx.shadowBlur = 0;

    // Chest LED status strip (cycles green → amber → red)
    const ledColors = ['#00ff66', '#00ff66', '#ffcc00', '#ff2244'];
    const ledSlot = Math.floor(elapsed * 3 + o.phase) % ledColors.length;
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(-bodyW / 2 + 8, -bodyH + 18, bodyW - 16, 8);
    for (let i = 0; i < 4; i += 1) {
      const on = i <= ledSlot;
      ctx.fillStyle = on ? ledColors[i] : '#1a2030';
      if (on) {
        ctx.shadowColor = ledColors[i];
        ctx.shadowBlur = 6;
      }
      ctx.fillRect(-bodyW / 2 + 10 + i * 8, -bodyH + 20, 5, 4);
      ctx.shadowBlur = 0;
    }

    // Scanning laser line
    const scanY = -bodyH + 30 + Math.sin(elapsed * 6) * 8;
    ctx.strokeStyle = `rgba(255, 34, 0, ${0.4 + Math.sin(elapsed * 12) * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2, scanY);
    ctx.lineTo(bodyW / 2, scanY);
    ctx.stroke();

    // ID label
    ctx.fillStyle = '#5a7088';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('M-7', -8, -bodyH + 42);

    ctx.restore();
  }

  private drawDeepfake(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const glitch = Math.floor(elapsed * 15) % 3 === 0 ? 2 : 0;

    ctx.save();
    ctx.translate(cx + glitch, cy);

    // Glitch hologram face
    ctx.strokeStyle = PALETTE.deepfake;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.magenta;
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(204, 0, 255, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 0, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Scan lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let ly = -o.h / 2; ly < o.h / 2; ly += 5) {
      ctx.beginPath();
      ctx.moveTo(-o.w / 2, ly);
      ctx.lineTo(o.w / 2, ly);
      ctx.stroke();
    }

    // X eyes
    ctx.strokeStyle = PALETTE.magentaSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-4, 4);
    ctx.moveTo(-4, -4);
    ctx.lineTo(-12, 4);
    ctx.moveTo(4, -4);
    ctx.lineTo(12, 4);
    ctx.moveTo(12, -4);
    ctx.lineTo(4, 4);
    ctx.stroke();

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  private drawFirewall(ctx: CanvasRenderingContext2D, o: ObstacleEntity, elapsed: number) {
    const flicker = Math.sin(elapsed * 20 + o.phase) > 0 ? 1 : 0.7;
    ctx.globalAlpha = flicker;
    ctx.fillStyle = 'rgba(255, 102, 0, 0.2)';
    ctx.strokeStyle = PALETTE.firewall;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.firewall;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.rect(o.x, o.y, o.w, o.h);
    ctx.fill();
    ctx.stroke();

    // Inner grid
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
    ctx.lineWidth = 1;
    for (let ix = o.x + 8; ix < o.x + o.w; ix += 10) {
      ctx.beginPath();
      ctx.moveTo(ix, o.y);
      ctx.lineTo(ix, o.y + o.h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  private drawPickup(ctx: CanvasRenderingContext2D, p: PickupEntity, elapsed: number) {
    const bob = Math.sin(elapsed * 4 + p.bobPhase) * 5;
    const y = p.y + bob;

    if (p.kind === 'wonder_flower') {
      const hue = (elapsed * 80 + p.bobPhase * 40) % 360;
      ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.shadowBlur = 18;
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 + elapsed * 2;
        const px = p.x + Math.cos(a) * 14;
        const py = y + Math.sin(a) * 10;
        ctx.fillStyle = `hsl(${(hue + i * 50) % 360}, 95%, 62%)`;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.arc(p.x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      return;
    }

    if (p.kind === 'rainbow_star') {
      const hue = (elapsed * 220 + p.bobPhase * 60) % 360;
      const spin = elapsed * 6 + p.bobPhase;
      ctx.save();
      ctx.translate(p.x, y);
      ctx.rotate(spin);
      ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.shadowBlur = 24;
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        const r = 16 + Math.sin(elapsed * 8 + i) * 3;
        ctx.fillStyle = `hsl(${(hue + i * 45) % 360}, 100%, 62%)`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + 0.35) * (r * 0.45), Math.sin(a + 0.35) * (r * 0.45));
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = PALETTE.white;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
      return;
    }

    // Spirit shrine — Ori light well
    const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, p.radius * 2.2);
    g.addColorStop(0, 'rgba(180, 255, 220, 0.9)');
    g.addColorStop(0.4, 'rgba(80, 220, 180, 0.35)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, y, p.radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(120, 255, 200, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#7cffb2';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p.x, y - 16);
    ctx.lineTo(p.x, y + 16);
    ctx.moveTo(p.x - 12, y);
    ctx.lineTo(p.x + 12, y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawRainbowStarOverlay(ctx: CanvasRenderingContext2D, s: RenderState) {
    const t = s.rainbowStarTimer / 8;
    const pulse = 0.12 + Math.sin(s.elapsed * 14) * 0.06;
    const hue = (s.elapsed * 280) % 360;
    const grad = ctx.createRadialGradient(
      s.playerRect.x + s.playerRect.w / 2,
      s.playerRect.y + s.playerRect.h / 2,
      20,
      s.playerRect.x + s.playerRect.w / 2,
      s.playerRect.y + s.playerRect.h / 2,
      s.width * 0.75,
    );
    grad.addColorStop(0, `hsla(${hue}, 100%, 65%, ${pulse * t})`);
    grad.addColorStop(0.5, `hsla(${(hue + 120) % 360}, 100%, 55%, ${pulse * 0.5 * t})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s.width, s.height);
  }

  private drawWonderOverlay(ctx: CanvasRenderingContext2D, s: RenderState) {
    const t = s.wonderTimer / 7;
    const pulse = 0.08 + Math.sin(s.elapsed * 6) * 0.04;
    const hue = (s.elapsed * 50) % 360;
    const grad = ctx.createRadialGradient(
      s.width * 0.5,
      s.groundY * 0.5,
      40,
      s.width * 0.5,
      s.groundY * 0.5,
      s.width * 0.9,
    );
    grad.addColorStop(0, `hsla(${hue}, 90%, 60%, ${pulse * t})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s.width, s.height);

    ctx.strokeStyle = `hsla(${(hue + 120) % 360}, 100%, 70%, ${0.25 * t})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, s.width - 16, s.height - 16);
  }

  private drawNovaAura(ctx: CanvasRenderingContext2D, s: RenderState) {
    const rect = s.playerRect;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const pulse = 0.5 + Math.sin(s.elapsed * 8) * 0.2;
    ctx.strokeStyle = `rgba(255, 200, 80, ${0.35 * pulse})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.gold;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, 48 + pulse * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawDeathVignette(ctx: CanvasRenderingContext2D, s: RenderState) {
    const alpha = 0.35 * (1 - s.dyingTimer / 0.55);
    const g = ctx.createRadialGradient(
      s.width * 0.5,
      s.groundY * 0.45,
      30,
      s.width * 0.5,
      s.groundY * 0.45,
      s.width * 0.75,
    );
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, `rgba(20, 5, 40, ${alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.width, s.height);
  }

  private drawTrail(ctx: CanvasRenderingContext2D, s: RenderState) {
    const mods = s.modifiers;
    const rainbow = s.rainbowStarTimer > 0 || s.wonderTimer > 0 || mods.wonderTrail;
    if (rainbow) {
      s.trail.forEach((t, i) => {
        const speed = s.rainbowStarTimer > 0 ? 280 : 120;
        const hue = (s.elapsed * speed + i * 22) % 360;
        drawButterflyTrail(ctx, [t], `hsl(${hue}, 100%, 62%)`);
      });
      return;
    }
    let color: string = PALETTE.player;
    if (mods.premiumSkin) color = PALETTE.playerPremium;
    else if (mods.verifiedSkin) color = PALETTE.playerVerified;
    drawButterflyTrail(ctx, s.trail, color);
  }

  private drawButterfly(ctx: CanvasRenderingContext2D, s: RenderState) {
    const rect = s.playerRect;
    const mods = s.modifiers;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2 + 4;

    let wingColor: string = PALETTE.player;
    let bodyColor: string = '#2a4050';
    if (mods.premiumSkin) {
      wingColor = PALETTE.playerPremium;
      bodyColor = '#4a1850';
    } else if (mods.verifiedSkin) {
      wingColor = PALETTE.playerVerified;
      bodyColor = '#4a3810';
    }

    const ducking = s.isDucking && s.isGrounded;
    const rainbowStar = s.rainbowStarTimer > 0;

    if (rainbowStar) {
      const hue = (s.elapsed * 280) % 360;
      wingColor = `hsl(${hue}, 100%, 62%)`;
      bodyColor = `hsl(${(hue + 180) % 360}, 90%, 45%)`;
    } else if (s.wonderTimer > 0) {
      const hue = (s.elapsed * 100) % 360;
      wingColor = `hsl(${hue}, 95%, 62%)`;
      bodyColor = `hsl(${(hue + 40) % 360}, 70%, 35%)`;
    }

    const wonderScale =
      (s.wonderTimer > 0 && s.wonderVariant === 'float') || rainbowStar
        ? 1.12 + Math.sin(s.elapsed * 5) * 0.06
        : 1;
    const glowScale = s.wonderTimer > 0 && s.wonderVariant === 'glow' ? 1.08 : rainbowStar ? 1.15 : 1;

    if (s.invincibleTimer > 0) {
      ctx.globalAlpha = rainbowStar
        ? 0.85 + Math.sin(s.elapsed * 32) * 0.15
        : Math.sin(s.elapsed * 28) > 0
          ? 1
          : 0.35;
    }

    if (rainbowStar) {
      ctx.strokeStyle = `hsl(${(s.elapsed * 280 + 90) % 360}, 100%, 65%)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = wingColor;
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(cx, cy, 44 + Math.sin(s.elapsed * 10) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (mods.spiritAura) {
      ctx.strokeStyle = s.mapTheme.accent + '55';
      ctx.lineWidth = 2;
      ctx.shadowColor = s.mapTheme.accent;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 38 * wonderScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Disco de luz bajo las alas (no bajo un círculo)
    if (s.isGrounded && !ducking) {
      ctx.strokeStyle = wingColor + '66';
      ctx.lineWidth = 1;
      ctx.shadowColor = wingColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(cx, rect.y + rect.h + 1, 22, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    drawNeonButterfly(ctx, cx, cy, {
      wingColor,
      bodyColor,
      wingPhase: s.wingPhase,
      ducking,
      verified: !!mods.verifiedSkin,
      squashX: s.squashX * wonderScale * glowScale,
      squashY: s.squashY * wonderScale,
      rainbowMode: rainbowStar,
      elapsed: s.elapsed,
    });

    // Shield bubble
    if (s.shieldActive) {
      ctx.strokeStyle = PALETTE.shield + 'cc';
      ctx.lineWidth = 2;
      ctx.shadowColor = PALETTE.shield;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, s: RenderState) {
    this.drawButterfly(ctx, s);
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  private drawSpeedLines(ctx: CanvasRenderingContext2D, s: RenderState) {
    if (s.speed < 380) return;
    const intensity = ((s.speed - 380) / 200) * 0.45;
    const grid = s.mapTheme.grid;
    ctx.strokeStyle = hexAlpha(grid, intensity * 0.15);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4 * intensity; i += 1) {
      const y = 40 + (i * 137) % (s.groundY - 80);
      const len = 20 + (i * 17) % 40;
      const x = (s.elapsed * 250 + i * 90) % (s.width + len) - len;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
  }

  private drawFinishGate(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, elapsed } = s;
    const accent = s.mapTheme.accent;
    const gateX = width - 28 + Math.sin(elapsed * 3) * 3;
    const pulse = 0.55 + Math.sin(elapsed * 5) * 0.35;

    ctx.strokeStyle = hexAlpha(accent, pulse);
    ctx.lineWidth = 3;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.moveTo(gateX, groundY);
    ctx.lineTo(gateX, groundY - 110);
    ctx.arc(gateX - 28, groundY - 110, 28, 0, Math.PI, true);
    ctx.lineTo(gateX - 56, groundY);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText('META', gateX - 50, groundY - 118);
    ctx.shadowBlur = 0;

    // Progress strip
    if (s.levelProgress > 0) {
      const barW = 80;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.roundRect(width - 100, 18, barW, 5, 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(width - 100, 18, barW * s.levelProgress, 5, 2);
      ctx.fill();
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D, s: RenderState) {
    if (s.phase !== 'playing') return;
    const { width } = s;
    const hudTop = 56;
    const hudLeft = 14;

    // Glass HUD panel — Apple-style frosted card
    const hudH = s.combo > 1 ? 96 : s.rainbowStarTimer > 0 ? 84 : 72;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudLeft, hudTop, 176, hudH, 14);
    ctx.fill();
    ctx.stroke();

    // Map zone label
    ctx.font = '600 9px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = s.mapTheme.accent + 'dd';
    const textX = hudLeft + 12;
    ctx.fillText(s.mapName.toUpperCase().slice(0, 18), textX, hudTop + 16);
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(s.chunkName.slice(0, 16), textX, hudTop + 28);
    if (s.chunkTotal > 1) {
      ctx.fillStyle = s.mapTheme.accent + '99';
      ctx.font = '600 9px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Zona ${s.chunkIndex + 1}/${s.chunkTotal}`, textX + 92, hudTop + 28);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${Math.floor(s.score)}`, textX, hudTop + 50);
    ctx.font = '500 10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 213, 0.75)';
    ctx.fillText('PUNTOS', textX, hudTop + 62);

    ctx.font = '600 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(`${Math.floor(s.distance)}m`, textX + 84, hudTop + 50);

    if (s.rainbowStarTimer > 0) {
      const barW = 140;
      const pct = s.rainbowStarTimer / 8;
      const hue = (s.elapsed * 280) % 360;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.roundRect(textX, hudTop + 66, barW, 6, 3);
      ctx.fill();
      ctx.fillStyle = `hsl(${hue}, 100%, 58%)`;
      ctx.beginPath();
      ctx.roundRect(textX, hudTop + 66, barW * pct, 6, 3);
      ctx.fill();
      ctx.font = '600 9px system-ui, sans-serif';
      ctx.fillStyle = `hsl(${(hue + 60) % 360}, 100%, 75%)`;
      ctx.fillText('RAINBOW', textX, hudTop + 80);
    }

    if (s.combo > 1) {
      ctx.fillStyle = PALETTE.magentaSoft;
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.fillText(`COMBO ×${s.combo}`, textX, s.rainbowStarTimer > 0 ? hudTop + 94 : hudTop + 78);
    }

    // Active power-ups (right)
    const buffs: string[] = [];
    if (s.magnetTimer > 0) buffs.push(`🧲 ${s.magnetTimer.toFixed(0)}s`);
    if (s.speedBoostTimer > 0) buffs.push(`⚡ ${s.speedBoostTimer.toFixed(0)}s`);
    if (s.fluxTimer > 0) buffs.push(`⏳ ${s.fluxTimer.toFixed(0)}s`);
    if (s.novaTimer > 0) buffs.push(`✦ ${s.novaTimer.toFixed(0)}s`);
    if (s.shieldActive) buffs.push('🛡');

    if (buffs.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(width - 118, hudTop, 106, 24 + buffs.length * 18, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '500 12px system-ui, -apple-system, sans-serif';
      buffs.forEach((b, i) => ctx.fillText(b, width - 106, hudTop + 18 + i * 18));
    }
  }
}
