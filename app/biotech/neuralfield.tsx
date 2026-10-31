"use client";

import { useEffect, useRef } from "react";

/* Ambient background: neurons with branching dendrites drifting at
   different depths. Far cells are smaller, dimmer, and blurrier. Spikes
   travel along the dendrites and can hop to a neighbouring cell; moving
   the pointer near a cell body fires it. Each cell is pre-rendered once
   to a sprite, so per-frame cost is just a few drawImage calls. */

type P = [number, number];

interface Neuron {
  nx: number; ny: number; z: number; ph: number; scale: number;
  sprite: HTMLCanvasElement;
  paths: P[][];
  cums: number[][];
  sx: number; sy: number; x: number; y: number;
  glow: number; cool: number;
}
interface Pulse { n: number; path: number; d: number; speed: number; hops: number; started: boolean }

const R = 230; // sprite half-size in local units

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

/* Recursively draw a curved dendrite segment and record the path from the
   cell body to each terminal, so spikes can travel along it. */
const grow = (
  g: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number,
  depth: number, width: number, trail: P[], out: P[][]
) => {
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const cx = (x + x2) / 2 + (Math.random() - 0.5) * len * 0.5;
  const cy = (y + y2) / 2 + (Math.random() - 0.5) * len * 0.5;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(cx, cy, x2, y2);
  g.stroke();

  const seg: P[] = [];
  for (let k = 1; k <= 5; k++) {
    const t = k / 5;
    const u = 1 - t;
    seg.push([u * u * x + 2 * u * t * cx + t * t * x2, u * u * y + 2 * u * t * cy + t * t * y2]);
  }
  const path = trail.concat(seg);

  if (depth === 0) {
    out.push(path);
    g.beginPath();
    g.arc(x2, y2, width * 1.4 + 0.8, 0, Math.PI * 2);
    g.fill();
    return;
  }
  const kids = depth > 1 || Math.random() < 0.6 ? 2 : 1;
  for (let i = 0; i < kids; i++) {
    const turn = kids === 1 ? (Math.random() - 0.5) * 0.8 : (i ? 1 : -1) * (0.35 + Math.random() * 0.4);
    grow(g, x2, y2, ang + turn, len * (0.68 + Math.random() * 0.15), depth - 1, width * 0.75, path, out);
  }
};

const makeNeuron = (nx: number, ny: number, muted: string, dpr: number): Neuron => {
  const z = 0.2 + Math.random() * 0.8;
  const scale = 0.55 + z * 0.75;
  const size = Math.ceil(2 * R * scale);
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr * scale, dpr * scale);
  g.filter = `blur(${((1 - z) * 2.4 + 0.2).toFixed(2)}px)`; // depth of field
  g.lineCap = "round";
  g.strokeStyle = rgba(muted, 0.9);
  g.fillStyle = rgba(muted, 0.9);

  const paths: P[][] = [];
  const dendrites = 5;
  for (let i = 0; i < dendrites; i++) {
    const ang = (i / dendrites) * Math.PI * 2 + Math.random() * 0.5;
    grow(g, R, R, ang, 52 + Math.random() * 14, 3, 2.2, [[R, R]], paths);
  }
  grow(g, R, R, Math.random() * Math.PI * 2, 78, 2, 1.6, [[R, R]], paths); // axon
  g.beginPath();
  g.arc(R, R, 7, 0, Math.PI * 2);
  g.fill();

  const cums = paths.map((p) => {
    const cum = [0];
    for (let i = 1; i < p.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    }
    return cum;
  });

  return { nx, ny, z, ph: Math.random() * Math.PI * 2, scale, sprite: c, paths, cums, sx: 0, sy: 0, x: 0, y: 0, glow: 0, cool: 0 };
};

const pointAt = (path: P[], cum: number[], d: number): P => {
  const dd = Math.min(Math.max(d, 0), cum[cum.length - 1]);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dd) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const t = (dd - cum[i - 1]) / seg;
  return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t];
};

export default function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const style = getComputedStyle(canvas);
    const muted = style.getPropertyValue("--muted").trim();
    const signal = style.getPropertyValue("--signal").trim();
    const root = canvas.closest<HTMLElement>(".bio");
    const still = root?.dataset.motion === "off"; // /biotech?motion=off
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glowSignal = makeGlow(signal);

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let spawn = 0.4;
    let scrollY = window.scrollY;
    let neurons: Neuron[] = [];
    const pulses: Pulse[] = [];
    const mouse = { x: -999, y: -999, ox: 0, oy: 0, tx: 0, ty: 0 };

    const place = () => {
      const count = W < 700 ? 6 : 12;
      const made: Neuron[] = [];
      for (let tries = 0; made.length < count && tries < 400; tries++) {
        const nx = Math.random();
        const ny = Math.random() * 1.6;
        if (made.some((m) => Math.hypot((m.nx - nx) * W, (m.ny - ny) * H) < 240)) continue;
        made.push(makeNeuron(nx, ny, muted, dpr));
      }
      neurons = made;
    };

    const fire = (i: number, hops: number, delay = 0) => {
      const n = neurons[i];
      if (!n.paths.length || pulses.length > 20) return;
      pulses.push({
        n: i,
        path: Math.floor(Math.random() * n.paths.length),
        d: -delay,
        speed: (110 + Math.random() * 70) * n.scale,
        hops,
        started: false,
      });
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

      for (const n of neurons) {
        n.x = n.sx + Math.sin(t * 0.12 + n.ph) * 10 * n.z * drift + mouse.ox * 40 * n.z;
        n.y = n.sy + Math.cos(t * 0.1 + n.ph * 1.3) * 10 * n.z * drift + mouse.oy * 40 * n.z - shift * n.z;
      }

      /* cells */
      for (const n of neurons) {
        const s = 2 * R * n.scale;
        if (n.y < -s || n.y > H + s) continue;
        ctx.globalAlpha = (0.2 + 0.4 * n.z) * fade;
        ctx.drawImage(n.sprite, n.x - s / 2, n.y - s / 2, s, s);
        if (n.glow > 0.02) {
          const g = 46 * n.scale;
          ctx.globalAlpha = Math.min(1, n.glow) * 0.85 * fade;
          ctx.drawImage(glowSignal, n.x - g / 2, n.y - g / 2, g, g);
          n.glow *= Math.exp(-dt * 2.2);
        }
      }

      /* spontaneous and pointer-driven firing */
      if (!still) {
        spawn -= dt;
        if (spawn <= 0) {
          for (let k = 0; k < 6; k++) {
            const i = Math.floor(Math.random() * neurons.length);
            if (neurons[i].y > 0 && neurons[i].y < H) {
              fire(i, 0);
              break;
            }
          }
          spawn = 0.6 + Math.random() * 0.9;
        }
        for (let i = 0; i < neurons.length; i++) {
          const n = neurons[i];
          if (n.cool > 0) n.cool -= dt;
          else if (Math.hypot(n.x - mouse.x, n.y - mouse.y) < 110 * n.scale) {
            n.cool = 1.4;
            fire(i, 0);
          }
        }
      }

      /* spikes travelling along dendrites */
      const wx = (n: Neuron, p: P) => n.x + (p[0] - R) * n.scale;
      const wy = (n: Neuron, p: P) => n.y + (p[1] - R) * n.scale;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const N = neurons[p.n];
        const path = N.paths[p.path];
        const cum = N.cums[p.path];
        p.d += p.speed * dt;

        if (p.d >= cum[cum.length - 1]) {
          const end = pointAt(path, cum, p.d);
          const ex = wx(N, end);
          const ey = wy(N, end);
          if (p.hops < 2 && Math.random() < 0.55) {
            let best = -1;
            let bestD = 420;
            neurons.forEach((m, k) => {
              const d = Math.hypot(m.x - ex, m.y - ey);
              if (k !== p.n && d < bestD) { best = k; bestD = d; }
            });
            if (best >= 0) fire(best, p.hops + 1, 50);
          }
          pulses.splice(i, 1);
          continue;
        }
        if (p.d < 0) continue;
        if (!p.started) {
          p.started = true;
          N.glow = 1;
        }

        const head = pointAt(path, cum, p.d);
        const hx = wx(N, head);
        const hy = wy(N, head);
        const from = Math.max(0, p.d - 70);
        const tail = pointAt(path, cum, from);
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.55 * fade;
        ctx.beginPath();
        ctx.moveTo(wx(N, tail), wy(N, tail));
        for (let k = 1; k < path.length; k++) {
          if (cum[k] > from && cum[k] < p.d) ctx.lineTo(wx(N, path[k]), wy(N, path[k]));
        }
        ctx.lineTo(hx, hy);
        ctx.stroke();

        const size = 22 * (0.6 + N.z * 0.6);
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
      if (!neurons.length) place();
      neurons.forEach((n) => {
        n.sx = n.nx * W;
        n.sy = n.ny * H;
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