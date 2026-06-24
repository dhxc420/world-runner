export interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}

export function spawnFloatText(
  list: FloatText[],
  x: number,
  y: number,
  text: string,
  color: string,
  opts?: { vy?: number; scale?: number },
) {
  list.push({
    x,
    y,
    text,
    color,
    life: 0.9,
    maxLife: 0.9,
    vy: opts?.vy ?? -55,
    scale: opts?.scale ?? 1,
  });
}

export function updateFloatTexts(list: FloatText[], dt: number, scroll: number): FloatText[] {
  return list
    .map((t) => ({
      ...t,
      x: t.x - scroll * 0.12,
      y: t.y + t.vy * dt,
      vy: t.vy + 20 * dt,
      life: t.life - dt,
    }))
    .filter((t) => t.life > 0);
}

export function drawFloatTexts(ctx: CanvasRenderingContext2D, list: FloatText[]) {
  for (const t of list) {
    const alpha = Math.min(1, t.life / t.maxLife);
    const age = 1 - alpha;
    const pop = 1 + Math.max(0, 1 - age * 5) * 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale * pop, t.scale * pop);
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12;
    ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
