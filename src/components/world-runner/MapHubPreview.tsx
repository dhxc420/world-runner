'use client';

import { useEffect, useRef } from 'react';
import { getTheme } from '@/game/maps/themes';

interface MapHubPreviewProps {
  themeId: string;
}

/** Parallax mission-map preview — Metal Slug / arcade route select vibe */
export function MapHubPreview({ themeId }: MapHubPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeIdRef = useRef(themeId);
  themeIdRef.current = themeId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const drawForest = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      for (let i = -1; i < 8; i += 1) {
        const bx = ((i * 140 - scroll * 0.35) % (w + 140)) - 20;
        ctx.fillStyle = '#0a1828';
        ctx.beginPath();
        ctx.moveTo(bx, groundY);
        ctx.lineTo(bx + 30, groundY - 90 - (i % 3) * 20);
        ctx.lineTo(bx + 60, groundY);
        ctx.fill();
      }
      for (let i = 0; i < 12; i += 1) {
        const sx = ((i * 80 - scroll * 0.15) % (w + 80));
        const sy = h * 0.15 + (i % 4) * 30;
        ctx.fillStyle = `rgba(124, 255, 178, ${0.3 + (i % 3) * 0.15})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let x = -scroll % 40; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x - 80, h);
        ctx.stroke();
      }
      for (let y = groundY; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i += 1) {
        const px = ((i * 160 - scroll * 0.5) % (w + 160)) - 40;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.strokeRect(px, groundY - 50, 50, 50);
      }
    };

    const drawHangar = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      for (let i = -1; i < 6; i += 1) {
        const px = ((i * 200 - scroll * 0.4) % (w + 200)) - 30;
        ctx.fillStyle = '#141c28';
        ctx.fillRect(px, groundY - 70, 120, 70);
        ctx.strokeStyle = 'rgba(102, 204, 136, 0.4)';
        ctx.strokeRect(px + 8, groundY - 58, 104, 20);
        ctx.fillStyle = 'rgba(255, 34, 0, 0.6)';
        ctx.fillRect(px + 20, groundY - 52, 6, 6);
        ctx.fillRect(px + 90, groundY - 52, 6, 6);
      }
    };

    const drawRoute = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const midY = h * 0.48;
      ctx.strokeStyle = 'rgba(255, 230, 102, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      ctx.lineDashOffset = -scroll * 0.8;
      ctx.beginPath();
      ctx.moveTo(-20, midY + 20);
      for (let x = 0; x <= w + 40; x += 60) {
        ctx.lineTo(x, midY + Math.sin((x + scroll) * 0.02) * 18);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 5; i += 1) {
        const px = ((i * (w / 4) - scroll * 0.25) % (w + 80)) + 40;
        const py = midY + Math.sin((px + scroll) * 0.02) * 18;
        ctx.fillStyle = i === 2 ? '#ffe566' : 'rgba(255, 230, 102, 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, i === 2 ? 7 : 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      const theme = getTheme(themeIdRef.current);
      const w = canvas.width;
      const h = canvas.height;
      t += 0.016;
      const scroll = t * 60;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, theme.void);
      grad.addColorStop(0.4, theme.auroraC);
      grad.addColorStop(1, theme.auroraB);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (theme.parallax === 'forest') drawForest(ctx, w, h, scroll);
      else if (theme.parallax === 'hangar') drawHangar(ctx, w, h, scroll);
      else drawGrid(ctx, w, h, scroll);

      drawRoute(ctx, w, h, scroll);

      const groundY = h * 0.72;
      const gGrad = ctx.createLinearGradient(0, groundY, 0, h);
      gGrad.addColorStop(0, theme.ground);
      gGrad.addColorStop(1, '#020408');
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = theme.groundLine;
      ctx.lineWidth = 2;
      ctx.shadowColor = theme.groundLine;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
