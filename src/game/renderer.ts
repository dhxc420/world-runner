import { PALETTE } from './constants';
import { drawCompanion } from './companion';
import { drawButterflyTrail, drawNeonButterfly } from './drawButterfly';
import { drawFloatTexts } from './floatText';
import type { ObstacleEntity, OrbEntity, Particle, PickupEntity, PowerupEntity, RenderState } from './types';
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

    this.drawTrail(ctx, state);
    if (state.wonderTimer > 0) this.drawWonderOverlay(ctx, state);
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
      case 'forest':
        this.drawForestParallax(ctx, s);
        break;
      case 'hangar':
        this.drawHangarParallax(ctx, s);
        break;
      default:
        this.drawGridParallax(ctx, s);
        break;
    }
  }

  private drawForestParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance } = s;
    const glow = s.mapTheme.accent;
    for (let i = 0; i < 12; i += 1) {
      const bx = ((i * 110 - (distance * 1.6) % 110) + width) % (width + 110) - 55;
      const bh = 45 + (i % 4) * 25;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(0, 30, 40, 0.75)';
      ctx.beginPath();
      ctx.moveTo(bx + 20, groundY);
      ctx.quadraticCurveTo(bx + 20, groundY - bh, bx + 5, groundY - bh * 0.85);
      ctx.quadraticCurveTo(bx - 5, groundY - bh * 0.5, bx + 20, groundY);
      ctx.fill();
      // Mushroom cap glow
      ctx.fillStyle = glow + '33';
      ctx.beginPath();
      ctx.ellipse(bx + 12, groundY - bh * 0.88, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawGridParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance, elapsed } = s;
    const t = s.mapTheme;
    for (let i = 0; i < 8; i += 1) {
      const bx = ((i * 130 - (distance * 2.2) % 130) + width) % (width + 130) - 65;
      const bh = 55 + (i % 3) * 30;
      ctx.fillStyle = 'rgba(0, 20, 50, 0.5)';
      ctx.strokeStyle = t.grid + '44';
      ctx.lineWidth = 1;
      ctx.fillRect(bx, groundY - bh, 48, bh);
      ctx.strokeRect(bx, groundY - bh, 48, bh);
      // Window lights
      const flicker = Math.sin(elapsed * 4 + i) > 0;
      if (flicker) {
        ctx.fillStyle = t.grid + '66';
        ctx.fillRect(bx + 8, groundY - bh + 12, 10, 6);
        ctx.fillRect(bx + 28, groundY - bh + 28, 10, 6);
      }
    }
  }

  private drawHangarParallax(ctx: CanvasRenderingContext2D, s: RenderState) {
    const { width, groundY, distance, elapsed } = s;
    const t = s.mapTheme;
    // Pipes + LED panels (Marathon ship aesthetic)
    for (let i = 0; i < 6; i += 1) {
      const bx = ((i * 160 - (distance * 1.4) % 160) + width) % (width + 160) - 80;
      ctx.fillStyle = '#141820';
      ctx.fillRect(bx, groundY - 90, 60, 90);
      ctx.strokeStyle = '#2a3040';
      ctx.strokeRect(bx, groundY - 90, 60, 90);

      // LED status panel
      const ledColors = ['#00ff44', '#ffaa00', '#ff2244', '#00aaff'];
      const ledIdx = Math.floor(elapsed * 2 + i) % ledColors.length;
      ctx.fillStyle = ledColors[ledIdx];
      ctx.shadowColor = ledColors[ledIdx];
      ctx.shadowBlur = 8;
      ctx.fillRect(bx + 8, groundY - 75, 44, 6);
      ctx.shadowBlur = 0;

      // Pipe
      ctx.fillStyle = '#1a2030';
      ctx.fillRect(bx + 20, groundY - 50, 20, 50);
      ctx.strokeStyle = t.accent + '55';
      ctx.strokeRect(bx + 20, groundY - 50, 20, 50);
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

    if (theme.parallax !== 'grid') return;

    const offset = (distance * 6) % 50;
    const speedFactor = speed / 720;

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
    if (o.kind === 'bot') this.drawBot(ctx, o, elapsed);
    else if (o.kind === 'deepfake') this.drawDeepfake(ctx, o, elapsed);
    else this.drawFirewall(ctx, o, elapsed);
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
    const rainbow = s.wonderTimer > 0 || mods.wonderTrail;
    if (rainbow) {
      s.trail.forEach((t, i) => {
        const hue = (s.elapsed * 120 + i * 18) % 360;
        drawButterflyTrail(ctx, [t], `hsl(${hue}, 95%, 62%)`);
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

    if (s.wonderTimer > 0) {
      const hue = (s.elapsed * 100) % 360;
      wingColor = `hsl(${hue}, 95%, 62%)`;
      bodyColor = `hsl(${(hue + 40) % 360}, 70%, 35%)`;
    }

    const wonderScale =
      s.wonderTimer > 0 && s.wonderVariant === 'float' ? 1.12 + Math.sin(s.elapsed * 5) * 0.06 : 1;
    const glowScale = s.wonderTimer > 0 && s.wonderVariant === 'glow' ? 1.08 : 1;

    if (s.invincibleTimer > 0) {
      ctx.globalAlpha = Math.sin(s.elapsed * 28) > 0 ? 1 : 0.35;
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
    if (s.speed < 500) return;
    const intensity = (s.speed - 500) / 220;
    const grid = s.mapTheme.grid;
    ctx.strokeStyle = hexAlpha(grid, intensity * 0.25);
    ctx.lineWidth = 1;
    for (let i = 0; i < 8 * intensity; i += 1) {
      const y = 40 + (i * 137) % (s.groundY - 80);
      const len = 30 + (i * 17) % 60;
      const x = (s.elapsed * 400 + i * 90) % (s.width + len) - len;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D, s: RenderState) {
    if (s.phase !== 'playing') return;
    const { width } = s;

    // Glass HUD panel
    ctx.fillStyle = 'rgba(0, 10, 30, 0.55)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 10, 168, s.combo > 1 ? 88 : 68, 8);
    ctx.fill();
    ctx.stroke();

    // Map zone label
    ctx.font = '9px monospace, system-ui, sans-serif';
    ctx.fillStyle = s.mapTheme.accent + 'cc';
    ctx.fillText(s.mapName.toUpperCase().slice(0, 18), 22, 22);
    ctx.fillStyle = s.mapTheme.grid + '88';
    ctx.fillText(s.chunkName, 22, 32);

    ctx.fillStyle = PALETTE.white;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`${Math.floor(s.score)}`, 22, 52);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = PALETTE.tealSoft;
    ctx.fillText('SCORE', 22, 64);

    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(`${Math.floor(s.distance)}m`, 100, 52);

    if (s.combo > 1) {
      ctx.fillStyle = PALETTE.magentaSoft;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(`COMBO x${s.combo}`, 22, 84);
    }

    // Active power-ups (right)
    const buffs: string[] = [];
    if (s.magnetTimer > 0) buffs.push(`🧲 ${s.magnetTimer.toFixed(0)}s`);
    if (s.speedBoostTimer > 0) buffs.push(`⚡ ${s.speedBoostTimer.toFixed(0)}s`);
    if (s.fluxTimer > 0) buffs.push(`⏳ ${s.fluxTimer.toFixed(0)}s`);
    if (s.novaTimer > 0) buffs.push(`✦ ${s.novaTimer.toFixed(0)}s`);
    if (s.shieldActive) buffs.push('🛡');

    if (buffs.length > 0) {
      ctx.fillStyle = 'rgba(0, 10, 30, 0.55)';
      ctx.beginPath();
      ctx.roundRect(width - 110, 10, 100, 20 + buffs.length * 18, 8);
      ctx.fill();
      ctx.fillStyle = PALETTE.tealSoft;
      ctx.font = '12px system-ui, sans-serif';
      buffs.forEach((b, i) => ctx.fillText(b, width - 98, 28 + i * 18));
    }
  }
}
