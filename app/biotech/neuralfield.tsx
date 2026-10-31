"use client";

import { useEffect, useRef } from "react";

/* Ambient background: a graph of neurons drifting at different depths.
   Spikes travel along the edges and light up the nodes they reach;
   moving the pointer near a node fires it. Far nodes are drawn larger
   and softer, which gives the blur without a heavy CSS filter.
   It is a graph on purpose: nodes and edges, like the GNN work. */

interface Node {
  nx: number; ny: number; z: number; ph: number;
  glow: number; cool: number;
  sx: number; sy: number; x: number; y: number;
  adj: number[];
}
interface Pulse { a: number; b: number; p: number; speed: number; depth: number }

const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const makeSprite = (hex: string) => {
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
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      root?.dataset.motion !== "full";

    const dotMuted = makeSprite(muted);
    const dotSignal = makeSprite(signal);

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let spawn = 0.4;
    let scrollY = window.scrollY;
    let nodes: Node[] = [];
    let links: [number, number][] = [];
    let pulses: Pulse[] = [];
    const mouse = { x: -999, y: -999, ox: 0, oy: 0, tx: 0, ty: 0 };

    const build = () => {
      const count = W < 700 ? 38 : 76;
      if (nodes.length !== count) {
        nodes = Array.from({ length: count }, () => ({
          nx: Math.random(), ny: Math.random() * 1.6, z: 0.2 + Math.random() * 0.8,
          ph: Math.random() * Math.PI * 2, glow: 0, cool: 0,
          sx: 0, sy: 0, x: 0, y: 0, adj: [],
        }));
      }
      nodes.forEach((n) => {
        n.adj = [];
        n.sx = n.nx * W;
        n.sy = n.ny * H;
      });
      links = [];
      pulses = [];
      const maxD = Math.max(150, W * 0.14);
      const seen = new Set<string>();
      nodes.forEach((n, i) => {
        nodes
          .map((m, j) => ({ j, d: Math.hypot(n.sx - m.sx, n.sy - m.sy) }))
          .filter((o) => o.j !== i && o.d < maxD)
          .sort((a, b) => a.d - b.d)
          .slice(0, 3)
          .forEach(({ j }) => {
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (seen.has(key)) return;
            seen.add(key);
            links.push([i, j]);
            n.adj.push(j);
            nodes[j].adj.push(i);
          });
      });
    };

    const fire = (a: number, depth: number) => {
      const n = nodes[a];
      if (!n.adj.length || pulses.length > 26) return;
      const b = n.adj[Math.floor(Math.random() * n.adj.length)];
      const len = Math.hypot(n.x - nodes[b].x, n.y - nodes[b].y) || 1;
      pulses.push({ a, b, p: 0, speed: (160 + Math.random() * 80) / len, depth });
      n.glow = 1;
    };

    const frame = (time: number) => {
      const dt = Math.min(0.05, (time - last) / 1000 || 0);
      last = time;
      const t = time / 1000;
      const fade = 0.5 + 0.5 * Math.min(1, scrollY / (H * 0.8)); // calmer behind the hero
      const shift = reduce ? 0 : Math.min(scrollY * 0.08, H * 0.6);
      const drift = reduce ? 0 : 1;

      mouse.ox += (mouse.tx - mouse.ox) * 0.05;
      mouse.oy += (mouse.ty - mouse.oy) * 0.05;
      ctx.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x = n.sx + Math.sin(t * 0.15 + n.ph) * 14 * n.z * drift + mouse.ox * 40 * n.z;
        n.y = n.sy + Math.cos(t * 0.12 + n.ph * 1.3) * 14 * n.z * drift + mouse.oy * 40 * n.z - shift * n.z;
      }

      /* edges */
      ctx.lineWidth = 1;
      ctx.strokeStyle = muted;
      for (const [a, b] of links) {
        const A = nodes[a];
        const B = nodes[b];
        if ((A.y < -60 && B.y < -60) || (A.y > H + 60 && B.y > H + 60)) continue;
        ctx.globalAlpha = (0.05 + 0.12 * ((A.z + B.z) / 2)) * fade;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }

      /* spontaneous and pointer-driven firing */
      if (!reduce) {
        spawn -= dt;
        if (spawn <= 0) {
          for (let k = 0; k < 6; k++) {
            const i = Math.floor(Math.random() * nodes.length);
            if (nodes[i].y > 0 && nodes[i].y < H) {
              fire(i, 0);
              break;
            }
          }
          spawn = 0.5 + Math.random() * 0.7;
        }
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (n.cool > 0) n.cool -= dt;
          else if (Math.hypot(n.x - mouse.x, n.y - mouse.y) < 70) {
            n.cool = 1.2;
            fire(i, 0);
          }
        }
      }

      /* spikes travelling along edges */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.p += p.speed * dt;
        const A = nodes[p.a];
        const B = nodes[p.b];
        if (p.p >= 1) {
          B.glow = 1;
          if (p.depth < 3) {
            for (let k = 0; k < 2; k++) if (Math.random() < 0.55) fire(p.b, p.depth + 1);
          }
          pulses.splice(i, 1);
          continue;
        }
        const x = A.x + (B.x - A.x) * p.p;
        const y = A.y + (B.y - A.y) * p.p;
        const tp = Math.max(0, p.p - 0.16);
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 * fade;
        ctx.beginPath();
        ctx.moveTo(A.x + (B.x - A.x) * tp, A.y + (B.y - A.y) * tp);
        ctx.lineTo(x, y);
        ctx.stroke();
        const size = 26 * (0.6 + B.z * 0.6);
        ctx.globalAlpha = 0.9 * fade;
        ctx.drawImage(dotSignal, x - size / 2, y - size / 2, size, size);
      }

      /* nodes: far ones larger and softer */
      for (const n of nodes) {
        if (n.y < -60 || n.y > H + 60) continue;
        const size = 10 + (1 - n.z) * 22;
        ctx.globalAlpha = (0.18 + 0.4 * n.z) * fade;
        ctx.drawImage(dotMuted, n.x - size / 2, n.y - size / 2, size, size);
        if (n.glow > 0.02) {
          const g = 34 + (1 - n.z) * 20;
          ctx.globalAlpha = Math.min(1, n.glow) * 0.85 * fade;
          ctx.drawImage(dotSignal, n.x - g / 2, n.y - g / 2, g, g);
          n.glow *= Math.exp(-dt * 2.2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduce) frame(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!reduce) {
        mouse.tx = e.clientX / W - 0.5;
        mouse.ty = e.clientY / H - 0.5;
      }
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      if (reduce) frame(performance.now());
    };

    const loop = (time: number) => {
      frame(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}