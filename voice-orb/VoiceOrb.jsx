import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// fiber field per state: radius, flare, vortex, spin, accent
const LOOK = {
  idle: [0.6, 0.2, 0, 0.3, 0],
  listening: [0.66, 0.8, 0, 0.6, 0.5],
  thinking: [0.54, 0, 2.8, 2.4, 0.9], // the vortex
  speaking: [0.62, 0.5, 0.15, 0.7, 0.6],
  error: [0.5, -0.3, 0, 0.1, 0] };
const LABEL = { idle: "Start talking", listening: "Send",
  thinking: "Thinking", speaking: "Stop", error: "Retry" };

export default function VoiceOrb({ respond, onChange,
  transcript = "", size = 280 }) {
  const [state, setState] = useState("idle");
  const [reply, setReply] = useState("");
  const cv = useRef(null), look = useRef(state), run = useRef(0);
  const go = (s) => { look.current = s; setState(s); onChange?.(s); };
  const send = async () => {
    const id = ++run.current; go("thinking");
    try {
      const r = await respond?.(transcript);
      if (id === run.current) { setReply(r ?? ""); go("speaking"); }
    } catch { if (id === run.current) go("error"); }
  };
  const click = () => {
    if (state === "listening") return send();
    if (state === "speaking") { run.current++; return go("idle"); }
    if (state !== "thinking") go("listening");
  };
  const onKey = (e) => {
    if (e.key !== "Escape" || state === "idle") return;
    run.current++; go("idle");
  };

  // speaking ends on its own, roughly at reading speed
  useEffect(() => {
    if (state !== "speaking") return;
    const id = setTimeout(() => go("idle"), 800 + reply.length * 45);
    return () => clearTimeout(id);
  }, [state, reply]);

  useEffect(() => {
    const ctx = cv.current.getContext("2d");
    const p = [...LOOK.idle];
    let raf, last = performance.now(), t = 0, spin = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      t += dt; LOOK[look.current].forEach((v, i) => (p[i] += (v - p[i]) * dt * 4));
      spin += dt * p[3];
      // shortcut: synthetic voice level; feed a mic analyser for real input
      const lv = look.current === "listening" ? Math.abs(Math.sin(t * 7) * Math.sin(t * 2.3)) : 0;
      draw(ctx, size, t, spin, p, lv);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  const text = { idle: "Tap to speak", listening: transcript || "Listening…",
    thinking: "Thinking…", speaking: reply, error: "Couldn't connect · tap to retry" }[state];
  return (
    <div style={s.wrap} onKeyDown={onKey}>
      <motion.button type="button" onClick={click} aria-label={LABEL[state]}
        aria-pressed={state === "listening"} aria-busy={state === "thinking"}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        style={{ ...s.orb, width: size, height: size }}>
        <canvas ref={cv} width={size} height={size} style={s.cv} />
      </motion.button>
      <div role="status" aria-live="polite" style={s.panel}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={state + text} style={s.text(state)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

const N = 900;
function draw(ctx, size, t, spin, p, lv) {
  const c = size / 2, R = c * (p[0] + 0.06 * lv), fl = p[1] + lv;
  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(c - R * 0.35, c - R * 0.4, 2, c, c, R);
  g.addColorStop(0, "rgba(235,232,245,.4)");
  g.addColorStop(1, "rgba(12,10,20,.9)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 0.97, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  const k = p[4];
  ctx.strokeStyle = `rgba(${255 - 39 * k},${255 - 75 * k},254,.12)`;
  ctx.lineWidth = 0.8; ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const y0 = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y0 * y0);
    const a = i * 2.39996 + spin;
    let x = r * Math.cos(a), y = y0, z = r * Math.sin(a);
    if (z < -0.3) continue; // hidden behind the core
    ctx.moveTo(c + R * x, c - R * y);
    for (let j = 0; j < 7; j++) {
      const fx = Math.sin(2.3 * y + 1.7 * z + t);
      const fy = Math.sin(2.1 * z + 1.9 * x - 0.7 * t);
      const fz = Math.sin(2.7 * x + 1.3 * y + 0.8 * t);
      const d = fx * x + fy * y + fz * z, h = 0.07;
      x += h * (fx - d * x + x * fl - y * p[2]);
      y += h * (fy - d * y + y * fl + x * p[2]);
      z += h * (fz - d * z + z * fl);
      ctx.lineTo(c + R * x, c - R * y);
    }
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

const s = {
  wrap: { display: "grid", justifyItems: "center", gap: 16,
    fontFamily: "system-ui, sans-serif" },
  orb: { padding: 0, border: 0, borderRadius: "50%", cursor: "pointer",
    background: "radial-gradient(circle, rgba(168,85,247,.35), transparent 70%)",
    outlineOffset: 6 },
  cv: { display: "block" },
  panel: { minWidth: 320, padding: "14px 20px", borderRadius: 20,
    textAlign: "center", color: "#f8fafc", fontSize: 16,
    background: "linear-gradient(160deg, rgba(64,48,96,.5), rgba(9,8,16,.88))",
    border: "1px solid rgba(255,255,255,.12)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.6),"
      + " 0 14px 28px -10px rgba(0,0,0,.7), 0 0 60px -24px #a855f7" },
  text: (st) => ({ display: "inline-block",
    color: st === "idle" || st === "error" ? "#94a3b8" : "#f8fafc" }),
};
