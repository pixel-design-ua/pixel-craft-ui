import { useState } from "react";
import { motion } from "framer-motion";

const DATA = [["Jan", 180], ["Feb", 240], ["Mar", 310], ["Apr", 420], ["May", 380], ["Jun", 260]];

export default function HoverBars({ data = DATA, unit = "k", onSelect }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map(([, v]) => v), 1);
  const move = (e, i, d) => { e.preventDefault(); e.currentTarget.parentElement.children[i + d]?.focus(); };

  return (
    <div role="group" aria-label="Bar chart" style={s.chart} onMouseLeave={() => setActive(null)}>
      {data.map((d, i) => (
        <button key={d[0]} aria-label={`${d[0]}: ${d[1]}${unit}`} style={s.col}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
          onClick={() => onSelect?.(d)}
          onKeyDown={(e) => e.key === "ArrowRight" ? move(e, i, 1) : e.key === "ArrowLeft" ? move(e, i, -1) : null}>
          <span style={s.track}>
            <motion.span initial={{ height: 0 }} animate={{ height: `${(d[1] / max) * 100}%` }}
              style={{ ...s.bar, background: active === i ? "#f43f5e" : "#dfe3ec" }}>
              {active === i && <span role="tooltip" style={s.tip}>{d[0]} · {d[1]}{unit}</span>}
            </motion.span>
          </span>
          <span style={s.label}>{d[0]}</span>
        </button>
      ))}
    </div>
  );
}

const s = {
  chart: { display: "flex", gap: 10, height: 240, paddingTop: 36, fontFamily: "sans-serif" },
  col: { width: 40, display: "flex", flexDirection: "column", alignItems: "center", border: 0, background: "none",
         padding: 0, cursor: "pointer", outlineOffset: 4 },
  track: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar: { position: "relative", width: "100%", borderRadius: 10, transition: "background .15s" },
  tip: { position: "absolute", bottom: "100%", left: "50%", transform: "translate(-50%,-6px)", whiteSpace: "nowrap",
         padding: "4px 10px", borderRadius: 8, background: "#1c2230", color: "#fff", fontSize: 13, pointerEvents: "none" },
  label: { fontSize: 12, color: "#8a8f98", marginTop: 6 },
};
