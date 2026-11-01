"use client";

import { useEffect, useRef } from "react";

/* Ambient background: short blockchains drifting at different depths. Far
   chains are smaller, dimmer, and blurrier. A "validation" pulse travels
   along a chain, lighting each block as it passes, and can hop to a
   neighbouring chain; moving the pointer near a chain fires it. Each chain
   is pre-rendered once to a sprite, so per-frame cost is a few drawImage calls. */

type P = [number, number];

interface Chain {
  nx: number; ny: number; z: number; ph: number; scale: number;
  sprite: HTMLCanvasElement;
  paths: [P[], P[]]; // forward and reversed block centers
  cums: [number[], number[]];
  flash: number[]; // per block, forward order
  sx: number; sy: number; x: number; y: number; cool: number;
}
interface Pulse { c: number; dir: 0 | 1; d: number; speed: number; hops: number; idx: number }

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

const cumulative = (p: P[]) => {
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  return cum;
};

const makeChain = (nx: number, ny: number, muted: string, dpr: number): Chain => {
  const z = 0.2 + Math.random() * 0.8;
  const scale = 0.55 + z * 0.75;
  const size = Math.ceil(2 * R * scale);
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr * scale, dpr * scale);
  g.filter = `blur(${((1 - z) * 2.4 + 0.2).toFixed(2)}px)`; // depth of field
  g.lineCap = "round";

  const n = 6 + Math.floor(Math.random() * 4);
  const gap = 52;
  const ang = (Math.random() < 0.65 ? 0 : Math.PI / 2) + (Math.random() - 0.5) * 0.9;
  const ph = Math.random() * Math.PI * 2;
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const along = (i - (n - 1) / 2) * gap;
    const wob = Math.sin(i * 1.3 + ph) * 8;
    pts.push([R + Math.cos(ang) * along - Math.sin(ang) * wob, R + Math.sin(ang) * along + Math.cos(ang) * wob]);
  }

  /* links, then blocks on top */
  g.strokeStyle = rgba(muted, 0.9);
  g.lineWidth = 1.4;
  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.stroke();

  const bw = 30;
  const bh = 22;
  pts.forEach((p) => {
    g.save();
    g.translate(p[0], p[1]);
    g.rotate(ang);
    g.beginPath();
    if (typeof g.roundRect === "function") g.roundRect(-bw / 2, -bh / 2, bw, bh, 4);
    else g.rect(-bw / 2, -bh / 2, bw, bh);
    g.fillStyle = "rgba(11,16,21,0.85)"; // knocks the link out behind the block
    g.fill();
    g.fillStyle = rgba(muted, 0.14);
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = rgba(muted, 0.9);
    g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = rgba(muted, 0.55); // "hash" rows
    g.beginPath();
    g.moveTo(-bw / 2 + 6, -3);
    g.lineTo(bw / 2 - 6, -3);
    g.moveTo(-bw / 2 + 6, 3);
    g.lineTo(bw / 2 - 12, 3);
    g.stroke();
    g.restore();
  });

  const rev = [...pts].reverse();
  return {
    nx, ny, z, ph, scale, sprite: c,
    paths: [pts, rev],
    cums: [cumulative(pts), cumulative(rev)],
    flash: new Array(n).fill(0),
    sx: 0, sy: 0, x: 0, y: 0, cool: 0,
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

export default function LedgerField() {
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
    let chains: Chain[] = [];
    const pulses: Pulse[] = [];
    const mouse = { x: -999, y: -999, ox: 0, oy: 0, tx: 0, ty: 0 };

    const place = () => {
      const count = W < 700 ? 5 : 9;
      const made: Chain[] = [];
      for (let tries = 0; made.length < count && tries < 400; tries++) {
        const nx = Math.random();
        const ny = Math.random() * 1.6;
        if (made.some((m) => Math.hypot((m.nx - nx) * W, (m.ny - ny) * H) < 260)) continue;
        made.push(makeChain(nx, ny, muted, dpr));
      }
      chains = made;
    };

    const fire = (i: number, hops: number, delay = 0) => {
      if (pulses.length > 16) return;
      const ch = chains[i];
      pulses.push({
        c: i,
        dir: Math.random() < 0.5 ? 0 : 1,
        d: -delay,
        speed: (120 + Math.random() * 60) * ch.scale,
        hops,
        idx: -1,
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

      for (const c of chains) {
        c.x = c.sx + Math.sin(t * 0.12 + c.ph) * 10 * c.z * drift + mouse.ox * 40 * c.z;
        c.y = c.sy + Math.cos(t * 0.1 + c.ph * 1.3) * 10 * c.z * drift + mouse.oy * 40 * c.z - shift * c.z;
      }

      const wx = (c: Chain, p: P) => c.x + (p[0] - R) * c.scale;
      const wy = (c: Chain, p: P) => c.y + (p[1] - R) * c.scale;

      /* chains */
      for (const c of chains) {
        const s = 2 * R * c.scale;
        if (c.y < -s || c.y > H + s) continue;
        ctx.globalAlpha = (0.2 + 0.4 * c.z) * fade;
        ctx.drawImage(c.sprite, c.x - s / 2, c.y - s / 2, s, s);
        const size = 40 * c.scale;
        c.flash.forEach((f, k) => {
          if (f <= 0.02) return;
          const p = c.paths[0][k];
          ctx.globalAlpha = Math.min(1, f) * 0.85 * fade;
          ctx.drawImage(glowSignal, wx(c, p) - size / 2, wy(c, p) - size / 2, size, size);
          c.flash[k] = f * Math.exp(-dt * 2.2);
        });
      }

      /* spontaneous and pointer-driven firing */
      if (!still) {
        spawn -= dt;
        if (spawn <= 0) {
          for (let k = 0; k < 6; k++) {
            const i = Math.floor(Math.random() * chains.length);
            if (chains[i].y > 0 && chains[i].y < H) {
              fire(i, 0);
              break;
            }
          }
          spawn = 0.7 + Math.random() * 1;
        }
        for (let i = 0; i < chains.length; i++) {
          const c = chains[i];
          if (c.cool > 0) c.cool -= dt;
          else if (Math.hypot(c.x - mouse.x, c.y - mouse.y) < 150 * c.scale) {
            c.cool = 1.6;
            fire(i, 0);
          }
        }
      }

      /* validation pulses travelling along chains */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const C = chains[p.c];
        const path = C.paths[p.dir];
        const cum = C.cums[p.dir];
        p.d += p.speed * dt;

        if (p.d >= cum[cum.length - 1]) {
          const end = pointAt(path, cum, p.d);
          const ex = wx(C, end);
          const ey = wy(C, end);
          if (p.hops < 2 && Math.random() < 0.5) {
            let best = -1;
            let bestD = 460;
            chains.forEach((m, k) => {
              const d = Math.hypot(m.x - ex, m.y - ey);
              if (k !== p.c && d < bestD) { best = k; bestD = d; }
            });
            if (best >= 0) fire(best, p.hops + 1, 50);
          }
          pulses.splice(i, 1);
          continue;
        }
        if (p.d < 0) continue;

        /* flash each block the head passes */
        let k = 0;
        while (k < cum.length - 1 && cum[k + 1] <= p.d) k++;
        if (k > p.idx) {
          p.idx = k;
          C.flash[p.dir === 0 ? k : C.flash.length - 1 - k] = 1;
        }

        const head = pointAt(path, cum, p.d);
        const hx = wx(C, head);
        const hy = wy(C, head);
        const from = Math.max(0, p.d - 70);
        const tail = pointAt(path, cum, from);
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.55 * fade;
        ctx.beginPath();
        ctx.moveTo(wx(C, tail), wy(C, tail));
        for (let m = 1; m < path.length; m++) {
          if (cum[m] > from && cum[m] < p.d) ctx.lineTo(wx(C, path[m]), wy(C, path[m]));
        }
        ctx.lineTo(hx, hy);
        ctx.stroke();

        const size = 22 * (0.6 + C.z * 0.6);
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
      if (!chains.length) place();
      chains.forEach((c) => {
        c.sx = c.nx * W;
        c.sy = c.ny * H;
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