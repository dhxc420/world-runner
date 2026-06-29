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

    const drawRuins = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      for (let i = -1; i < 8; i += 1) {
        const bx = ((i * 130 - scroll * 0.35) % (w + 130)) - 20;
        const bh = 70 + (i % 3) * 25;
        ctx.fillStyle = '#1a1c22';
        ctx.beginPath();
        ctx.moveTo(bx, groundY);
        ctx.lineTo(bx + 12, groundY - bh + 10);
        ctx.lineTo(bx + 28, groundY - bh);
        ctx.lineTo(bx + 48, groundY - bh + 8);
        ctx.lineTo(bx + 56, groundY);
        ctx.fill();
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 107, 53, 0.5)';
          ctx.fillRect(bx + 14, groundY - bh * 0.5, 6, 8);
        }
      }
    };

    const drawRuinsGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      for (let i = -1; i < 6; i += 1) {
        const bx = ((i * 150 - scroll * 0.4) % (w + 150)) - 30;
        ctx.fillStyle = 'rgba(20, 24, 32, 0.7)';
        ctx.fillRect(bx, groundY - 60, 48, 60);
      }
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
    };

    const drawWarzone = (ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) => {
      const groundY = h * 0.72;
      for (let i = -1; i < 6; i += 1) {
        const px = ((i * 200 - scroll * 0.4) % (w + 200)) - 30;
        ctx.fillStyle = '#18141a';
        ctx.fillRect(px, groundY - 70, 120, 70);
        ctx.strokeStyle = 'rgba(255, 102, 51, 0.4)';
        ctx.strokeRect(px + 8, groundY - 58, 104, 20);
        ctx.fillStyle = 'rgba(255, 68, 0, 0.6)';
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

      if (theme.parallax === 'ruins') drawRuins(ctx, w, h, scroll);
      else if (theme.parallax === 'warzone') drawWarzone(ctx, w, h, scroll);
      else drawRuinsGrid(ctx, w, h, scroll);

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
