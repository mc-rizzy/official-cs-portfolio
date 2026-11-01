
"use client";

import { useEffect, useRef } from "react";

/* Ambient background: trading-chart panels drifting at different depths.
   Each panel has candlesticks, a moving average, a volume strip, grid lines
   and a last-price tag. Far panels are smaller, dimmer, and blurrier. A
   price tick travels along the moving average to the latest candle and can
   jump to a neighbouring panel; moving the pointer near a panel fires it.
   Each panel is pre-rendered once to a sprite, so per-frame cost is just a
   few drawImage calls. */

type P = [number, number];

interface Panel {
  nx: number; ny: number; z: number; ph: number; scale: number;
  sprite: HTMLCanvasElement;
  path: P[]; // moving-average points, left to right
  cum: number[];
  last: P; // latest close
  sx: number; sy: number; x: number; y: number;
  glow: number; cool: number;
}
interface Pulse { c: number; d: number; speed: number; hops: number }

const PW = 440; // sprite size in local units
const PH = 280;

const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const makeGlow = (hex: string) => {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, rgba(hex, 1));
  grad.addColorStop(0.35, rgba(hex, 0.35));
  grad.addColorStop(1, rgba(hex, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
};

const makePanel = (nx: number, ny: number, muted: string, dpr: number): Panel => {
  const z = 0.2 + Math.random() * 0.8;
  const scale = 0.55 + z * 0.75;
  const c = document.createElement("canvas");
  c.width = Math.ceil(PW * scale * dpr);
  c.height = Math.ceil(PH * scale * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr * scale, dpr * scale);
  g.filter = `blur(${((1 - z) * 2.4 + 0.2).toFixed(2)}px)`; // depth of field
  g.lineCap = "round";
  const m = (a: number) => rgba(muted, a);

  /* frame */
  g.strokeStyle = m(0.35);
  g.lineWidth = 1;
  g.beginPath();
  if (typeof g.roundRect === "function") g.roundRect(0.5, 0.5, PW - 1, PH - 1, 8);
  else g.rect(0.5, 0.5, PW - 1, PH - 1);
  g.stroke();

  const L = 16;
  const Rr = PW - 46; // right axis gutter
  const T = 18;
  const Bp = PH - 78; // bottom of price area
  const Vb = PH - 16; // bottom of volume strip

  /* grid */
  g.setLineDash([2, 4]);
  g.lineWidth = 1;
  g.strokeStyle = m(0.25);
  for (let i = 0; i <= 4; i++) {
    const y = T + ((Bp - T) * i) / 4;
    g.beginPath();
    g.moveTo(L, y);
    g.lineTo(Rr, y);
    g.stroke();
    g.setLineDash([]);
    g.beginPath(); // axis tick
    g.moveTo(Rr, y);
    g.lineTo(Rr + 5, y);
    g.stroke();
    g.setLineDash([2, 4]);
  }
  g.strokeStyle = m(0.15);
  for (let i = 0; i <= 6; i++) {
    const x = L + ((Rr - L) * i) / 6;
    g.beginPath();
    g.moveTo(x, T);
    g.lineTo(x, Vb);
    g.stroke();
  }
  g.setLineDash([]);

  /* price series: random walk with a drifting trend */
  const n = 32;
  const step = (Rr - L) / n;
  const opens: number[] = [];
  const closes: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  let p = 0;
  let trend = (Math.random() - 0.5) * 0.8;
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.12) trend = (Math.random() - 0.5) * 0.8;
    const o = p;
    p += (Math.random() - 0.5) * 1.6 + trend * 0.3;
    opens.push(o);
    closes.push(p);
    highs.push(Math.max(o, p) + Math.random() * 0.8);
    lows.push(Math.min(o, p) - Math.random() * 0.8);
  }
  const lo = Math.min(...lows);
  const hi = Math.max(...highs);
  const Y = (v: number) => Bp - ((v - lo) / (hi - lo || 1)) * (Bp - T);

  for (let i = 0; i < n; i++) {
    const x = L + step * (i + 0.5);
    const up = closes[i] >= opens[i];

    /* volume */
    const vh = 6 + Math.random() * 38;
    g.fillStyle = m(up ? 0.45 : 0.25);
    g.fillRect(x - 3, Vb - vh, 6, vh);

    /* wick and body: up candles solid, down candles hollow */
    g.strokeStyle = m(0.9);
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x, Y(highs[i]));
    g.lineTo(x, Y(lows[i]));
    g.stroke();
    const top = Math.min(Y(opens[i]), Y(closes[i]));
    const bh = Math.max(1.5, Math.abs(Y(opens[i]) - Y(closes[i])));
    g.fillStyle = up ? m(0.9) : "rgba(13,16,17,0.95)";
    g.fillRect(x - 3, top, 6, bh);
    if (!up) g.strokeRect(x - 3, top, 6, bh);
  }

  /* moving average, also the path price ticks travel along */
  const path: P[] = [];
  for (let i = 0; i < n; i++) {
    const from = Math.max(0, i - 4);
    let sum = 0;
    for (let k = from; k <= i; k++) sum += closes[k];
    path.push([L + step * (i + 0.5), Y(sum / (i - from + 1))]);
  }
  g.strokeStyle = m(1);
  g.lineWidth = 1.6;
  g.beginPath();
  path.forEach((pt, i) => (i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1])));
  g.stroke();

  /* last-price line and axis tag */
  const lastY = Y(closes[n - 1]);
  g.setLineDash([3, 3]);
  g.strokeStyle = m(0.7);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(L, lastY);
  g.lineTo(Rr + 2, lastY);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = m(0.85);
  g.fillRect(Rr + 2, lastY - 7, 36, 14);

  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  }

  return {
    nx, ny, z, ph: Math.random() * Math.PI * 2, scale, sprite: c,
    path, cum, last: [L + step * (n - 0.5), lastY],
    sx: 0, sy: 0, x: 0, y: 0, glow: 0, cool: 0,
  };
};

const pointAt = (path: P[], cum: number[], d: number): P => {
  const dd = Math.min(Math.max(d, 0), cum[cum.length - 1]);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dd) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const t = (dd - cum[i - 1]) / seg;
  return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t];
};

export default function ChartField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const style = getComputedStyle(canvas);
    const muted = style.getPropertyValue("--muted").trim();
    const signal = style.getPropertyValue("--signal").trim();
    const root = canvas.closest<HTMLElement>(".bio");
    const still = root?.dataset.motion === "off"; // ?motion=off
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glowSignal = makeGlow(signal);

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let spawn = 0.4;
    let scrollY = window.scrollY;
    let panels: Panel[] = [];
    const pulses: Pulse[] = [];
    const mouse = { x: -999, y: -999, ox: 0, oy: 0, tx: 0, ty: 0 };

    const place = () => {
      const count = W < 700 ? 4 : 8;
      const made: Panel[] = [];
      for (let tries = 0; made.length < count && tries < 600; tries++) {
        const nx = Math.random();
        const ny = Math.random() * 1.6;
        if (made.some((o) => Math.abs((o.nx - nx) * W) < 400 && Math.abs((o.ny - ny) * H) < 280)) continue;
        made.push(makePanel(nx, ny, muted, dpr));
      }
      panels = made;
    };

    const fire = (i: number, hops: number, delay = 0) => {
      if (pulses.length > 16) return;
      pulses.push({ c: i, d: -delay, speed: 150 + Math.random() * 90, hops });
    };

    const frame = (time: number) => {
      const dt = Math.min(0.05, (time - last) / 1000 || 0);
      last = time;
      const t = time / 1000;
      const fade = 0.5 + 0.5 * Math.min(1, scrollY / (H * 0.8)); // calmer behind the hero
      const shift = still ? 0 : Math.min(scrollY * 0.08, H * 0.6);
      const drift = still ? 0 : 1;

      mouse.ox += (mouse.tx - mouse.ox) * 0.05;
      mouse.oy += (mouse.ty - mouse.oy) * 0.05;
      ctx.clearRect(0, 0, W, H);

      for (const p of panels) {
        p.x = p.sx + Math.sin(t * 0.12 + p.ph) * 10 * p.z * drift + mouse.ox * 40 * p.z;
        p.y = p.sy + Math.cos(t * 0.1 + p.ph * 1.3) * 10 * p.z * drift + mouse.oy * 40 * p.z - shift * p.z;
      }

      const wx = (p: Panel, q: P) => p.x + (q[0] - PW / 2) * p.scale;
      const wy = (p: Panel, q: P) => p.y + (q[1] - PH / 2) * p.scale;

      /* panels and their live price marker */
      for (const p of panels) {
        const sw = PW * p.scale;
        const sh = PH * p.scale;
        if (p.y < -sh || p.y > H + sh) continue;
        ctx.globalAlpha = (0.2 + 0.4 * p.z) * fade;
        ctx.drawImage(p.sprite, p.x - sw / 2, p.y - sh / 2, sw, sh);

        const blinkA = still ? 0.5 : 0.4 + 0.25 * Math.sin(t * 2.2 + p.ph);
        const size = 26 * p.scale * (1 + 0.5 * p.glow);
        ctx.globalAlpha = Math.min(1, blinkA + p.glow * 0.5) * fade;
        ctx.drawImage(glowSignal, wx(p, p.last) - size / 2, wy(p, p.last) - size / 2, size, size);
        if (p.glow > 0.02) p.glow *= Math.exp(-dt * 2.2);
      }

      /* spontaneous and pointer-driven ticks */
      if (!still) {
        spawn -= dt;
        if (spawn <= 0) {
          for (let k = 0; k < 6; k++) {
            const i = Math.floor(Math.random() * panels.length);
            if (panels[i].y > 0 && panels[i].y < H) {
              fire(i, 0);
              break;
            }
          }
          spawn = 0.8 + Math.random() * 1;
        }
        for (let i = 0; i < panels.length; i++) {
          const p = panels[i];
          if (p.cool > 0) p.cool -= dt;
          else if (Math.hypot(p.x - mouse.x, p.y - mouse.y) < 200 * p.scale) {
            p.cool = 1.6;
            fire(i, 0);
          }
        }
      }

      /* ticks travelling along the moving average */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        const P0 = panels[q.c];
        q.d += q.speed * dt;

        if (q.d >= P0.cum[P0.cum.length - 1]) {
          P0.glow = 1;
          if (q.hops < 2 && Math.random() < 0.5) {
            let best = -1;
            let bestD = 560;
            panels.forEach((m, k) => {
              const d = Math.hypot(m.x - P0.x, m.y - P0.y);
              if (k !== q.c && d < bestD) { best = k; bestD = d; }
            });
            if (best >= 0) fire(best, q.hops + 1, 50);
          }
          pulses.splice(i, 1);
          continue;
        }
        if (q.d < 0) continue;

        const head = pointAt(P0.path, P0.cum, q.d);
        const hx = wx(P0, head);
        const hy = wy(P0, head);
        const from = Math.max(0, q.d - 70);
        const tail = pointAt(P0.path, P0.cum, from);
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.55 * fade;
        ctx.beginPath();
        ctx.moveTo(wx(P0, tail), wy(P0, tail));
        for (let k = 1; k < P0.path.length; k++) {
          if (P0.cum[k] > from && P0.cum[k] < q.d) ctx.lineTo(wx(P0, P0.path[k]), wy(P0, P0.path[k]));
        }
        ctx.lineTo(hx, hy);
        ctx.stroke();

        const size = 22 * (0.6 + P0.z * 0.6);
        ctx.globalAlpha = 0.9 * fade;
        ctx.drawImage(glowSignal, hx - size / 2, hy - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!panels.length) place();
      panels.forEach((p) => {
        p.sx = p.nx * W;
        p.sy = p.ny * H;
      });
      if (still) frame(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!still) {
        mouse.tx = e.clientX / W - 0.5;
        mouse.ty = e.clientY / H - 0.5;
      }
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      if (still) frame(performance.now());
    };

    const loop = (time: number) => {
      frame(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!still) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}