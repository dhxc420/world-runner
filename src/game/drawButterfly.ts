import { PALETTE } from './constants';

/** Dibuja mariposa neón de 4 alas — silueta clara, NO esfera */
export function drawNeonButterfly(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    wingColor: string;
    bodyColor: string;
    wingPhase: number;
    ducking: boolean;
    verified: boolean;
    squashX?: number;
    squashY?: number;
    rainbowMode?: boolean;
    elapsed?: number;
  },
) {
  const { wingColor, bodyColor, wingPhase, ducking, verified, rainbowMode, elapsed = 0 } = opts;
  const squashX = opts.squashX ?? 1;
  const squashY = opts.squashY ?? 1;
  const flap = ducking ? 0.1 : Math.sin(wingPhase) * 0.5 + 0.5;
  const scale = ducking ? 0.65 : 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * squashX, scale * squashY);

  const drawWingSide = (side: -1 | 1) => {
    const open = 0.35 + flap * 0.65;
    const upperAngle = side * (-0.15 - open * 0.85);
    const lowerAngle = side * (0.1 + open * 0.55);
    const wingHue = rainbowMode
      ? (elapsed * 280 + side * 60 + open * 40) % 360
      : null;
    const fillColor = wingHue !== null ? `hsl(${wingHue}, 100%, 62%)` : wingColor + 'bb';
    const strokeColor = wingHue !== null ? `hsl(${wingHue}, 100%, 72%)` : wingColor;

    // Ala superior
    ctx.save();
    ctx.rotate(upperAngle);
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = rainbowMode ? 22 : 14;
    ctx.beginPath();
    ctx.moveTo(2 * side, -2);
    ctx.bezierCurveTo(8 * side, -22, 34 * side, -20, 38 * side, -2);
    ctx.bezierCurveTo(32 * side, 8, 14 * side, 10, 2 * side, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mancha interior (Ori glow)
    ctx.fillStyle = PALETTE.white + '55';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(18 * side, -8, 6, 8, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ala inferior (más pequeña)
    ctx.save();
    ctx.rotate(lowerAngle);
    const lowerFill = wingHue !== null ? `hsl(${(wingHue! + 40) % 360}, 100%, 55%)` : wingColor + '99';
    ctx.fillStyle = lowerFill;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = rainbowMode ? 18 : 10;
    ctx.beginPath();
    ctx.moveTo(2 * side, 2);
    ctx.bezierCurveTo(10 * side, 8, 26 * side, 14, 28 * side, 6);
    ctx.bezierCurveTo(22 * side, 2, 10 * side, 0, 2 * side, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawWingSide(-1);
  drawWingSide(1);

  ctx.shadowBlur = 0;

  // Cuerpo delgado — NO óvalo grande
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // Tórax neón fino
  ctx.strokeStyle = wingColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, 6);
  ctx.stroke();

  // Cabeza pequeña
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -14, 3, 0, Math.PI * 2);
  ctx.fill();

  // Antenas
  ctx.strokeStyle = wingColor;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = wingColor;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(-1, -15);
  ctx.quadraticCurveTo(-10, -26, -8, -32);
  ctx.moveTo(1, -15);
  ctx.quadraticCurveTo(10, -26, 8, -32);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (verified) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(-7, -30, 2, 0, Math.PI * 2);
    ctx.arc(7, -30, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Estela de alas — líneas horizontales, no círculos */
export function drawButterflyTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number; alpha: number }[],
  color: string,
) {
  for (const t of trail) {
    ctx.globalAlpha = t.alpha * 0.35;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(t.x - 10 * t.alpha, t.y);
    ctx.lineTo(t.x + 4 * t.alpha, t.y - 3 * t.alpha);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t.x - 8 * t.alpha, t.y + 2);
    ctx.lineTo(t.x + 2 * t.alpha, t.y + 4 * t.alpha);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
