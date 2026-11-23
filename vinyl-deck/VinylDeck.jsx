import { useState, useRef } from "react";
import { motion, useMotionValue, useAnimationFrame }
  from "framer-motion";
export default function VinylDeck({ track = TRACK, onPlay, onSeek,
  onLike, accent = "#f59e0b" }) {
  const [status, setStatus] = useState("paused"); // loading|playing|error
  const [pos, setPos] = useState(0);
  const [liked, setLiked] = useState(false);
  const spin = useMotionValue(0), speed = useRef(0);
  const playing = status === "playing";
  // platter spins up and coasts down; the clock runs only while playing
  useAnimationFrame((_, dt) => {
    const k = Math.min(1, dt / 400), v = playing ? 200 : 0;
    speed.current += (v - speed.current) * k;
    spin.set(spin.get() + (speed.current * dt) / 1000);
    if (playing) setPos((p) => Math.min(track.length, p + dt / 1e3));
  });

  const toggle = async () => {
    if (status === "loading") return;
    if (playing) return setStatus("paused"), onPlay?.(false);
    setStatus("loading");
    try { await onPlay?.(true); setStatus("playing"); }
    catch { setStatus("error"); }
  };
  const seek = (sec) => {
    const t = Math.max(0, Math.min(track.length, Math.round(sec)));
    setPos(t); onSeek?.(t);
  };
  const fromPointer = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * track.length);
  };
  const keys = { ArrowRight: 5, ArrowLeft: -5, Home: -Infinity, End: Infinity };
  const p = pos / track.length;

  return (
    <div style={{ ...s.card, "--a": accent }}>
      <div style={s.deck} aria-hidden>
        <motion.div style={{ ...s.vinyl, rotate: spin }}><div style={s.label} /></motion.div>
        <div style={s.sheen} />
        <motion.div style={s.arm} transition={{ type: "spring", stiffness: 120, damping: 12 }}
          animate={{ rotate: playing || status === "loading" ? 20 + 14 * p : 0 }} />
      </div>
      <div style={s.side}>
        <div style={s.cap}>{status === "error" ? "Couldn't play" : "Now playing"}</div>
        <div style={s.title}>{track.title}</div>
        <div style={s.artist}>{track.artist}</div>
        <div style={s.row}>
          <motion.button aria-label={playing ? "Pause" : "Play"} onClick={toggle}
            aria-busy={status === "loading"} whileHover={{ y: -2 }} whileTap={{ scale: 0.92 }}
            animate={status === "error" ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
            style={{ ...s.play, ...(playing && s.on) }}>
            {status === "loading" ? <motion.span style={s.ring} animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} /> : playing ? PAUSE : "▶"}
          </motion.button>
          <motion.button aria-label="Like" aria-pressed={liked} whileTap={{ scale: 0.8 }}
            onClick={() => { setLiked(!liked); onLike?.(!liked); }}
            style={{ ...s.like, color: liked ? accent : "#a8a29e" }}>{liked ? "♥" : "♡"}</motion.button>
        </div>
      </div>
      <div role="slider" tabIndex={0} aria-label="Seek" aria-valuemin={0}
        aria-valuemax={track.length} aria-valuenow={Math.round(pos)} aria-valuetext={fmt(pos)}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => e.buttons && fromPointer(e)}
        onKeyDown={(e) => e.key in keys && (e.preventDefault(), seek(pos + keys[e.key]))}
        style={s.wave}>
        {BARS.map((h, i) => (
          <i key={i} style={{ ...s.bar, height: h, ...(i / BARS.length < p && s.lit) }} />
        ))}
      </div>
      <div style={s.times}><span>{fmt(pos)}</span><span>-{fmt(track.length - pos)}</span></div>
    </div>
  );
}

const TRACK = { title: "Golden Hour", artist: "Lumen Coast", length: 228 };
const PAUSE = <svg width="18" height="20" aria-hidden><path d="M2 0h5v20H2zM11 0h5v20h-5z" fill="currentColor" /></svg>;
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const BARS = Array.from({ length: 48 }, (_, i) => 8 + Math.round(22 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31))));

const s = {
  card: {
    position: "relative", display: "grid", gridTemplateColumns: "200px 168px", gap: 24, padding: 24, width: 440,
    borderRadius: 28, color: "#fafaf9", fontFamily: "system-ui, sans-serif",
    background: "linear-gradient(160deg, rgba(48,36,28,.85), rgba(18,14,18,.92))",
    border: "1px solid rgba(255,255,255,.1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 2px 4px #000, 0 16px 32px -12px rgba(0,0,0,.7), 0 0 60px -20px var(--a)",
  },
  deck: { position: "relative", width: 200, height: 200 },
  vinyl: {
    position: "absolute", inset: 0, borderRadius: "50%", display: "grid", placeItems: "center",
    background: "repeating-radial-gradient(#111 0 2px, #1c1c1c 3px 4px)", boxShadow: "0 12px 24px -8px #000",
  },
  label: { width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(#1c1917 0 4px, var(--a) 5px, #b45309)" },
  sheen: {
    position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
    background: "conic-gradient(from 30deg, transparent, rgba(255,255,255,.14) 8%, transparent 16% 50%, rgba(255,255,255,.1) 58%, transparent 66%)",
  },
  arm: {
    position: "absolute", right: -8, top: -8, width: 6, height: 140, borderRadius: 3, transformOrigin: "3px 3px",
    background: "linear-gradient(90deg, #78716c, #e7e5e4, #78716c)",
  },
  side: { display: "flex", flexDirection: "column", gap: 4 },
  cap: { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--a)" },
  title: { fontSize: 24, fontWeight: 700 },
  artist: { fontSize: 14, color: "#a8a29e" },
  row: { display: "flex", alignItems: "center", gap: 16, marginTop: "auto" },
  play: {
    width: 64, height: 64, borderRadius: "50%", border: 0, cursor: "pointer", display: "grid", placeItems: "center",
    fontSize: 20, color: "#1c1917", background: "linear-gradient(#fcd34d, var(--a))",
  },
  on: { boxShadow: "0 0 28px -4px var(--a)" },
  ring: { width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(28,25,23,.25)", borderTopColor: "#1c1917" },
  like: { width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", fontSize: 22, cursor: "pointer" },
  wave: { gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 3, height: 40, cursor: "pointer", touchAction: "none" },
  bar: { flex: 1, borderRadius: 2, background: "rgba(255,255,255,.16)" },
  lit: { background: "var(--a)", boxShadow: "0 0 8px var(--a)" },
  times: { gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", marginTop: -16, fontSize: 12, color: "#a8a29e", fontVariantNumeric: "tabular-nums" },
};
