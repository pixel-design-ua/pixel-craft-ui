import { useRef, useState } from "react";
import { motion } from "framer-motion";

// 4×4 Bayer matrix: ordered dithering turns any photo into dots
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dither = (ctx, img, w, h, cell = 3) => {
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  ctx.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y += cell)
    for (let x = 0; x < w; x += cell) {
      const i = (y * w + x) * 4;
      const lum = (px[i] * .3 + px[i+1] * .59 + px[i+2] * .11) / 255;
      const k = BAYER[(y / cell % 4) * 4 + (x / cell % 4)] / 16;
      if (lum > k + .03) ctx.fillRect(x, y, cell - 1, cell - 1);
    }
};
const pct = (v) => `${(v * 100).toFixed(1)}%`;

export default function ObjectScan({ src, detect, onSelect,
  width = 360, height = 240 }) {
  const canvas = useRef(null);
  const [status, setStatus] = useState("idle");
  const [hits, setHits] = useState([]);
  const [hover, setHover] = useState(null);
  const [picked, setPicked] = useState(null);

  const scan = async () => {
    setStatus("scanning"); setHits([]); setPicked(null);
    try {
      const img = new Image(); img.src = src; await img.decode();
      const ctx = canvas.current.getContext("2d");
      ctx.fillStyle = ACCENT; dither(ctx, img, width, height);
      const found = await detect(img);
      setHits(found); setStatus(found.length ? "done" : "empty");
    } catch { setStatus("error"); }
  };

  const focus = hover ?? picked;
  const label = { idle: "Ready", scanning: "Scanning…", empty: "Nothing found",
    error: "No signal", done: `${hits.length} objects` }[status];

  return (
    <div style={s.card}>
      <div style={{ ...s.view, width, height }}>
        <motion.canvas ref={canvas} width={width} height={height}
          initial={false} style={s.canvas}
          animate={{ clipPath: status === "idle"
            ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: "easeInOut" }} />
        {status === "scanning" && (
          <motion.div style={s.line} initial={{ top: 0 }}
            animate={{ top: height }}
            transition={{ duration: 1.1, repeat: Infinity }} />
        )}
        {hits.map((h, i) => {
          const [x, y, w, bh] = h.box, on = focus === i;
          return (
            <motion.button key={i} type="button"
              aria-label={`#${i + 1} ${h.label} ${pct(h.score)}`}
              aria-pressed={picked === i}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: focus === null || on ? 1 : .35, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18,
                delay: hover === null ? i * .09 : 0 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              onClick={() => {
                setPicked(i); onSelect?.([h.label, h.score]);
              }}
              style={{ ...s.box, left: x * width, top: y * height,
                width: w * width, height: bh * height }}>
              {["tl", "tr", "bl", "br"].map((c) => (
                <i key={c} style={s.corner(c, on)} />
              ))}
              <span style={s.tag(on)}>
                #{i + 1} {h.label} {pct(h.score)}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div style={s.bar}>
        <span role="status" style={s.status(status)}>
          <b style={s.dot(status)} />{label}
        </span>
        <motion.button type="button" whileHover={{ y: -1 }}
          whileTap={{ scale: .94 }} onClick={scan}
          disabled={status === "scanning"} style={s.btn}>
          {status === "error" ? "Retry"
            : status === "idle" ? "Scan" : "Rescan"}
        </motion.button>
      </div>
    </div>
  );
}

const ACCENT = "#06b6d4";
const mono = "ui-monospace, 'SF Mono', monospace";
const s = {
  card: { display: "inline-flex", flexDirection: "column", gap: 12,
    padding: 12, borderRadius: 24, background: "rgba(12,18,28,.72)",
    border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(20px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), 0 1px 2px #0008,"
      + " 0 12px 24px -8px #0009, 0 40px 80px -24px #06b6d440" },
  view: { position: "relative", borderRadius: 14, overflow: "hidden",
    background: "radial-gradient(#0b1520, #05070d)" },
  canvas: { position: "absolute", inset: 0 },
  line: { position: "absolute", left: 0, right: 0, height: 2,
    background: ACCENT, boxShadow: `0 0 16px 4px ${ACCENT}` },
  box: { position: "absolute", padding: 0, border: 0, cursor: "pointer",
    background: "transparent", outline: "none" },
  corner: (c, on) => ({ position: "absolute", width: 12, height: 12,
    borderColor: on ? ACCENT : "rgba(255,255,255,.7)", borderStyle: "solid",
    borderWidth: `${c[0] === "t" ? 2 : 0}px ${c[1] === "r" ? 2 : 0}px `
      + `${c[0] === "b" ? 2 : 0}px ${c[1] === "l" ? 2 : 0}px`,
    [c[0] === "t" ? "top" : "bottom"]: 0,
    [c[1] === "l" ? "left" : "right"]: 0 }),
  tag: (on) => ({ position: "absolute", left: 0, bottom: "100%",
    marginBottom: 4, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap",
    font: `600 10px ${mono}`, letterSpacing: 1, textTransform: "uppercase",
    fontVariantNumeric: "tabular-nums",
    background: on ? ACCENT : "rgba(5,7,13,.8)", color: on ? "#021" : "#fff" }),
  bar: { display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 4px" },
  status: (st) => ({ display: "flex", alignItems: "center", gap: 8,
    font: `600 11px ${mono}`, letterSpacing: 1.5, textTransform: "uppercase",
    color: st === "error" || st === "empty" ? "#94a3b8" : "#e2e8f0" }),
  dot: (st) => ({ width: 8, height: 8, borderRadius: 8,
    background: st === "done" || st === "scanning" ? ACCENT : "#475569",
    boxShadow: st === "done" ? `0 0 10px ${ACCENT}` : "none" }),
  btn: { padding: "10px 22px", borderRadius: 12, border: 0, cursor: "pointer",
    font: "600 13px system-ui", letterSpacing: .5, color: "#021",
    background: `linear-gradient(180deg, #67e8f9, ${ACCENT})`,
    boxShadow: `inset 0 1px 0 #fff8, 0 8px 24px -6px ${ACCENT}` },
};
