"use client";

import { useEffect, useRef } from "react";

/* Eight scalp channels (10-20 system names). Left of the divider is
   raw EEG with noise and an eye-blink artifact; right is filtered.
   Move the pointer to slide the divider. */
const CHANNELS = ["Fp1", "F3", "C3", "P3", "O1", "C4", "P4", "O2"];
const LEFT = 44;
const STEP = 2;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function SignalField() {
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
    const font = style.fontFamily;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let hover = false;
    let target = 0.5;
    let boundary = 0.5;

    const draw = (time: number) => {
      const t = reduce ? 0 : time / 1000;
      if (!hover) target = 0.5 + (reduce ? 0 : 0.12 * Math.sin(t * 0.25));
      boundary = reduce ? target : boundary + (target - boundary) * 0.08;

      const bx = LEFT + (w - LEFT) * boundary;
      const rows = CHANNELS.length;
      const rowH = h / rows;
      const amp = rowH * 0.3;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `11px ${font}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.lineJoin = "round";

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
          const noise =
            Math.sin(u * 0.9 + ph * 3.1) * 0.5 +
            Math.sin(u * 1.7 + ph * 1.3) * 0.35 +
            Math.sin(u * 3.1 + ph * 0.7) * 0.3 +
            Math.sin(u * 5.3 + ph) * 0.2;
          let blink = 0;
          if (i < 2) {
            const d = (((u % 900) + 900) % 900) - 450;
            blink = Math.exp(-(d * d) / 512) * (i === 0 ? 2.2 : 1.2);
          }
          ys.push(y0 - (clean + (noise * 0.55 + blink) * rawWeight) * amp);
        }

        const path = () => {
          ctx.beginPath();
          ys.forEach((y, k) => {
            const x = LEFT + k * STEP;
            if (k) ctx.lineTo(x, y);
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
        ctx.fillText(CHANNELS[i], 0, y0);
      }

      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, h);
      ctx.stroke();

      ctx.fillStyle = ink;
      ctx.textBaseline = "top";
      ctx.textAlign = "right";
      ctx.fillText("raw", bx - 8, 8);
      ctx.textAlign = "left";
      ctx.fillText("filtered", bx + 8, 8);
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
      if (reduce) draw(0);
    };
    const onLeave = () => {
      hover = false;
      if (reduce) draw(0);
    };

    const loop = (time: number) => {
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
      aria-label="Eight EEG channels. Traces on the left are raw and noisy; traces on the right are filtered."
    />
  );
}
