import { useEffect, useRef } from 'react';

const hsl = (raw, fallback) => {
  const value = (raw || '').trim();
  return value ? `hsl(${value})` : fallback;
};

export default function NeuronCanvas({ active }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(false);
  activeRef.current = Boolean(active);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const root = window.getComputedStyle(document.documentElement);
    const colPrimary = hsl(root.getPropertyValue('--primary'), 'hsl(76 92% 63%)');
    const colAccent = hsl(root.getPropertyValue('--accent'), 'hsl(14 100% 62%)');
    const colLine = hsl(root.getPropertyValue('--border'), 'hsl(45 8% 20%)');
    const colFg = hsl(root.getPropertyValue('--foreground'), 'hsl(43 32% 94%)');

    let nodes = [];
    let edges = [];
    let pulses = [];
    let raf = 0;
    let last = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width;
      const h = rect.height;
      const count = Math.max(24, Math.min(56, Math.round(w / 20)));

      nodes = Array.from({ length: count }, () => ({
        x: 26 + Math.random() * Math.max(1, w - 52),
        y: 22 + Math.random() * Math.max(1, h - 44),
        r: 1.3 + Math.random() * 2.3,
        glow: 0,
      }));

      edges = [];
      nodes.forEach((node, i) => {
        nodes
          .map((other, j) => ({ j, d: Math.hypot(other.x - node.x, other.y - node.y) }))
          .filter((entry) => entry.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2)
          .forEach((entry) => {
            if (entry.d < 190) edges.push({ a: i, b: entry.j });
          });
      });
      pulses = [];
    };

    const spawn = () => {
      if (!edges.length) return;
      pulses.push({
        e: edges[Math.floor(Math.random() * edges.length)],
        t: Math.random() * 0.15,
        speed: 0.0016 + Math.random() * 0.0034,
        color: Math.random() < 0.6 ? colPrimary : colAccent,
      });
    };

    const step = (ts) => {
      const dt = Math.min(48, ts - last || 16);
      last = ts;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (Math.random() < (activeRef.current ? 0.24 : 0.045) * (dt / 16)) spawn();
      if (pulses.length > 90) pulses.splice(0, pulses.length - 90);

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = colLine;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      edges.forEach(({ a, b }) => {
        const from = nodes[a];
        const to = nodes[b];
        if (!from || !to) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });

      pulses = pulses.filter((p) => {
        const from = nodes[p.e.a];
        const to = nodes[p.e.b];
        if (!from || !to) return false;
        p.t += p.speed * dt;
        if (p.t >= 1) {
          to.glow = 1;
          return false;
        }
        const x = from.x + (to.x - from.x) * p.t;
        const y = from.y + (to.y - from.y) * p.t;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(x, y, 5.4, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      nodes.forEach((node) => {
        node.glow *= 0.955;
        ctx.fillStyle = node.glow > 0.35 ? colPrimary : colFg;
        ctx.globalAlpha = 0.3 + node.glow * 0.7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + node.glow * 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (node.glow > 0.4) {
          ctx.strokeStyle = colPrimary;
          ctx.globalAlpha = (node.glow - 0.4) * 0.55;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7 + (1 - node.glow) * 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(step);
    };

    build();
    raf = requestAnimationFrame(step);
    const observer = new ResizeObserver(build);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <canvas ref={canvasRef} className="block h-56 w-full md:h-72" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            neural activity
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
              active ? 'text-primary' : 'text-muted-foreground/50'
            }`}
          >
            {active ? 'firing' : 'idle'}
          </span>
        </div>
        <p
          className={`truncate font-mono text-[10px] uppercase tracking-[0.16em] ${
            active ? 'text-primary' : 'text-muted-foreground/40'
          }`}
        >
          {active ? `absorbing ${active}` : 'waiting for something to read'}
        </p>
      </div>
    </div>
  );
}
