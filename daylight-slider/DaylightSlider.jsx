import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const MIN = 720, MAX = 1440;                 // 12:00 → 24:00 in minutes
const PHASES = [[1050, "Day"], [1170, "Golden hour"],
  [1260, "Blue hour"], [Infinity, "Night"]];
const phaseOf = (m) => PHASES.find(([end]) => m < end)[1];
const pad = (n) => String(n).padStart(2, "0");
const clock = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const KEYS = { ArrowUp: 15, ArrowRight: 15, ArrowDown: -15,
  ArrowLeft: -15, PageUp: 60, PageDown: -60 };

export default function DaylightSlider({ defaultValue = 780,
  onChange, width = 320, height = 280 }) {
  const [min, setMin] = useState(defaultValue);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const val = useRef(min), track = useRef(null), cv = useRef(null);
  const set = (m, commit) => {
    const v = Math.round(Math.min(MAX, Math.max(MIN, m)) / 5) * 5;
    if (commit && v !== val.current) onChange?.(v);
    val.current = v; setMin(v);
  };
  const fromY = (y) => { const r = track.current.getBoundingClientRect();
    return MAX - ((y - r.top) / r.height) * (MAX - MIN); };
  const onKey = (e) => {
    const k = e.key, m = KEYS[k] ? min + KEYS[k]
      : k === "Home" ? MIN : k === "End" ? MAX : null;
    if (m !== null) { e.preventDefault(); set(m, true); }
  };
  const p = (min - MIN) / (MAX - MIN);       // 0 = noon, 1 = midnight
  useEffect(() => drawScene(cv.current, p), [p]);

  return (
    <div style={{ ...s.card, width, height }}>
      <canvas ref={cv} width={width} height={height} style={s.fill} />
      <div style={s.chip} aria-live="polite">
        <b style={s.time}>{clock(min)}</b>
        <motion.span key={phaseOf(min)} style={s.phase}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {phaseOf(min)}</motion.span>
      </div>
      <div style={s.rail}>
        <button style={s.end} aria-label="Midnight" onClick={() => set(MAX, true)}>☾</button>
        <div ref={track} style={s.track}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(true); set(fromY(e.clientY)); }}
          onPointerMove={(e) => drag && set(fromY(e.clientY))}
          onPointerUp={() => { if (drag) onChange?.(val.current); setDrag(false); }}
          onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
          <motion.div style={s.fillBar} initial={false} animate={{ height: `${p * 100}%` }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }} />
          <motion.div role="slider" tabIndex={0} aria-label="Time of day"
            aria-orientation="vertical" aria-valuemin={MIN} aria-valuemax={MAX}
            aria-valuenow={min} aria-valuetext={`${clock(min)} · ${phaseOf(min)}`}
            onKeyDown={onKey} style={s.thumb} initial={false} whileFocus={{ boxShadow: GLOW }}
            animate={{ top: `${(1 - p) * 100}%`, scale: drag ? 1.18 : hover ? 1.08 : 1,
              boxShadow: drag ? GLOW : REST }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }} />
        </div>
        <button style={s.end} aria-label="Noon" onClick={() => set(MIN, true)}>☀</button>
      </div>
    </div>
  );
}

// 4×4 Bayer dither between 4-stop palettes keyed at noon, golden, blue, night
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const KEYP = [0, 0.4, 0.68, 1];
const PAL = [["2a6f97", "4f9fc4", "9fd3e6", "f1fbff"], ["5a2a3a", "c2553f", "f39a52", "ffe2a8"],
  ["1a1b4b", "3b3f8f", "8e6fb8", "f3a6b0"], ["03040d", "0b1030", "26306a", "dfe6ff"]]
  .map((r) => r.map((h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))));
const palette = (p) => {
  let i = 0; while (i < 2 && p > KEYP[i + 1]) i++;
  const f = (p - KEYP[i]) / (KEYP[i + 1] - KEYP[i]);
  return PAL[i].map((c, j) => c.map((v, k) => v + (PAL[i + 1][j][k] - v) * f));
};
const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5; return v - Math.floor(v); };

function drawScene(canvas, p) {
  const g = canvas.getContext("2d"), C = 3, W = canvas.width, H = canvas.height, hz = H * 0.58;
  const pal = palette(p), night = Math.min(1, Math.max(0, (p - 0.6) / 0.3));
  const sun = p < 0.6, lx = W * (sun ? 0.35 + 0.4 * p : 0.62);
  const ly = sun ? hz * (0.3 + 0.75 * p / 0.6) : hz * (1.05 - 0.75 * night), r = W * 0.05;
  for (let y = 0; y < H; y += C) for (let x = 0; x < W; x += C) {
    const sy = y < hz ? y : 2 * hz - y, d = Math.hypot(x - lx, sy - ly);
    let v = 0.15 + 0.45 * (sy / hz) + 0.5 * Math.exp(-((d / (r * 4)) ** 2)) + (d < r ? 1 : 0);
    if (y < hz && hash(x, y) > 0.985) v += night;
    if (y >= hz) v = v * 0.55 + (Math.abs(x - lx) < (y - hz) * 0.6 + 6 && hash(x, y) > 0.55 ? 0.6 : 0);
    const q = Math.min(2.999, Math.max(0, v * 3)), i = q | 0;
    const c = pal[i + ((q - i) * 16 > BAYER[(y / C % 4) * 4 + (x / C % 4)] ? 1 : 0)];
    g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.fillRect(x, y, C, C);
  }
}

const REST = "0 2px 6px rgba(0,0,0,.45), inset 0 1px 0 #fff";
const GLOW = "0 0 0 6px rgba(251,113,133,.25), 0 0 24px #fb7185, inset 0 1px 0 #fff";
const s = {
  card: { position: "relative", borderRadius: 24, overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,.4), 0 12px 24px -8px rgba(0,0,0,.5), 0 40px 80px -24px rgba(0,0,0,.6)" },
  fill: { position: "absolute", inset: 0, imageRendering: "pixelated" },
  chip: { position: "absolute", right: 16, top: 16, padding: "8px 12px", borderRadius: 12,
    background: "rgba(8,10,24,.45)", backdropFilter: "blur(12px)", color: "#fff",
    border: "1px solid rgba(255,255,255,.18)", display: "grid", textAlign: "right" },
  time: { font: "600 22px system-ui", fontVariantNumeric: "tabular-nums" },
  phase: { font: "700 9px system-ui", letterSpacing: 2, textTransform: "uppercase", opacity: 0.8 },
  rail: { position: "absolute", left: 16, top: 16, bottom: 16, width: 40, borderRadius: 20,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0",
    background: "rgba(8,10,24,.45)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,.18)" },
  end: { border: 0, background: "none", color: "#fff", fontSize: 14, cursor: "pointer" },
  track: { position: "relative", flex: 1, width: 4, borderRadius: 2,
    background: "rgba(255,255,255,.2)", cursor: "ns-resize", touchAction: "none" },
  fillBar: { position: "absolute", left: 0, right: 0, bottom: 0, borderRadius: 2,
    background: "linear-gradient(#a5b4fc, #fb7185)" },
  thumb: { position: "absolute", left: -10, width: 24, height: 14, marginTop: -7,
    borderRadius: 7, background: "#fff", outline: "none" },
};
