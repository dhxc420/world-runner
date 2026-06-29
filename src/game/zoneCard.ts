export interface ZoneCardState {
  title: string;
  subtitle: string;
  accent: string;
  timer: number;
}

export const ZONE_CARD_HOLD = 3;

export function createZoneCard(title: string, subtitle: string, accent: string): ZoneCardState {
  return { title, subtitle, accent, timer: ZONE_CARD_HOLD };
}

export function updateZoneCard(card: ZoneCardState | null, dt: number): ZoneCardState | null {
  if (!card) return null;
  card.timer -= dt;
  return card.timer > 0 ? card : null;
}

export function drawZoneCard(ctx: CanvasRenderingContext2D, card: ZoneCardState, width: number, height: number) {
  const t = card.timer;
  const total = ZONE_CARD_HOLD;
  const fadeIn = Math.min(1, (total - t) / 0.6);
  const fadeOut = Math.min(1, t / 0.5);
  const alpha = fadeIn * fadeOut;

  const stripH = 96;
  const stripY = height * 0.38 - stripH / 2;

  ctx.save();
  ctx.globalAlpha = alpha * 0.92;

  ctx.fillStyle = `rgba(0, 8, 24, 0.78)`;
  ctx.fillRect(0, stripY, width, stripH);

  const lineW = Math.min(220, width * 0.35);
  ctx.fillStyle = card.accent + 'cc';
  ctx.fillRect(width / 2 - lineW / 2, stripY + stripH / 2 - 1, lineW, 2);

  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0fbff';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  const slide = (1 - fadeIn) * -40;
  ctx.fillText(card.title.toUpperCase(), width / 2 + slide, stripY + 38);

  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = card.accent;
  ctx.shadowBlur = 0;
  ctx.fillText(card.subtitle, width / 2, stripY + 62);

  ctx.restore();
}
