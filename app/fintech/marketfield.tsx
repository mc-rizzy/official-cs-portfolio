"use client";

import { useEffect, useRef } from "react";

/* Six simulated market-data series. Left of the divider is the raw feed
   with jagged ticks and outlier prints; right is cleaned. On load the
   cleaning sweeps in; after that the divider drifts until the pointer
   takes over. A chart-recorder grid scrolls behind it. */
const CHANNELS = ["price", "volume", "return", "volatility", "spread", "depth"];
const LABEL_X = 20;
const LEFT = 64;
const STEP = 2;
const GRID = 40;
const GRID_SPEED = 50;
const INTRO = 2400; // ms

/* Deterministic pseudo-random in [0, 1) so ticks are stable as they scroll. */
const rand = (n: number, ph: number) => {
  const v = Math.sin(n * 127.1 + ph * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function MarketField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const style = getComputedStyle(canvas);
    const col = (name: string) => style.getPropertyValue(name).trim();
    const ink = col("--ink");
    const muted = col("--muted");
    const signal = col("--signal");
    const rule = col("--rule");
    const font = style.fontFamily;
    const root = canvas.closest<HTMLElement>(".bio");
    const reduce = root?.dataset.motion === "off"; // /biotech?motion=off
    const hint = window.matchMedia("(pointer: coarse)").matches
      ? "Drag across the feed"
      : "Move across the feed";

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let hover = false;
    let started = false;
    let t0 = 0;
    let hintAlpha = 1;
    let target = reduce ? 0.5 : 1;
    let boundary = target;

    const draw = (time: number) => {
      const t = reduce ? 0 : (time - t0) / 1000;
      const intro = reduce ? 1 : Math.min(1, (t * 1000) / INTRO);
      const ease = 1 - Math.pow(1 - intro, 3);

      if (!hover) {
        const idleT = Math.max(0, t - INTRO / 1000);
        target = intro < 1 ? 1 - 0.5 * ease : 0.5 + (reduce ? 0 : 0.14 * Math.sin(idleT * 0.35));
      }
      boundary = reduce ? target : boundary + (target - boundary) * 0.1;

      const bx = LEFT + (w - LEFT) * boundary;
      const rows = CHANNELS.length;
      const rowH = h / rows;
      const amp = rowH * 0.3;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `11px ${font}`;
      ctx.lineJoin = "round";

      /* scrolling recorder grid */
      const shift = t * GRID_SPEED;
      const k = Math.floor(shift / GRID);
      const start = LEFT - (shift % GRID);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rule;
      for (let i = 0; start + i * GRID <= w; i++) {
        const x = start + i * GRID;
        if (x < LEFT) continue;
        ctx.globalAlpha = (k + i) % 5 === 0 ? 0.9 : 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      for (let i = 0; i < rows; i++) {
        const y0 = rowH * (i + 0.5);
        const f1 = 0.016 + i * 0.0017;
        const f2 = f1 * 2.3;
        const ph = i * 1.7;
        const speed = 40 + i * 3;
        const ys: number[] = [];

        for (let x = LEFT; x <= w; x += STEP) {
          const u = x + t * speed;
          const clean = Math.sin(u * f1 + ph) * 0.65 + Math.sin(u * f2 + ph * 0.6) * 0.35;
          const rawWeight = 1 - smooth(bx - 24, bx + 24, x);
          const noise = (rand(Math.floor(u / 4), ph) - 0.5) * 2; // jagged ticks
          const r = rand(Math.floor(u / 6) + 977, ph);
          const blink = r > 0.985 ? (r > 0.9925 ? 2.2 : -2.2) : 0; // outlier prints
          ys.push(y0 - (clean + (noise * 0.55 + blink) * rawWeight) * amp);
        }

        const path = () => {
          ctx.beginPath();
          ys.forEach((y, n) => {
            const x = LEFT + n * STEP;
            if (n) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          });
        };

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, bx, h);
        ctx.clip();
        ctx.strokeStyle = muted;
        ctx.lineWidth = 1.1;
        path();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(bx, 0, w - bx, h);
        ctx.clip();
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.8;
        path();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = muted;
        ctx.fillText(CHANNELS[i], LABEL_X, y0);
      }

      /* divider */
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, h);
      ctx.stroke();

      ctx.fillStyle = ink;
      ctx.textBaseline = "top";
      ctx.textAlign = "right";
      ctx.fillText("raw feed", bx - 8, 8);
      ctx.textAlign = "left";
      ctx.fillText("cleaned", bx + 8, 8);

      /* affordance: pulsing handle + hint until first interaction */
      const a = hintAlpha * intro;
      if (a > 0.01) {
        const pulse = (t * 0.8) % 1;
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = a * (1 - pulse);
        ctx.beginPath();
        ctx.arc(bx, h / 2, 6 + pulse * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = a;
        ctx.fillStyle = signal;
        ctx.beginPath();
        ctx.arc(bx, h / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = muted;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(hint, w - LABEL_X, h - 12);
        ctx.globalAlpha = 1;
      }
      if (hover) hintAlpha = Math.max(0, hintAlpha - 0.04);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      hover = true;
      target = Math.min(1, Math.max(0, (e.clientX - r.left - LEFT) / (w - LEFT)));
      if (reduce) {
        hintAlpha = 0;
        draw(0);
      }
    };
    const onLeave = () => {
      hover = false;
      if (reduce) draw(0);
    };

    const loop = (time: number) => {
      if (!started) {
        started = true;
        t0 = time;
      }
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    resize();
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="field-canvas"
      role="img"
      aria-label="Six simulated market data series. Lines on the left are a raw noisy feed; lines on the right are cleaned."
    />
  );
}