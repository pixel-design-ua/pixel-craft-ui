import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NeonTabs({ tabs = DEFAULT, onChange, accent = "#06b6d4" }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const select = (i) => {
    const n = (i + tabs.length) % tabs.length; // arrows wrap around
    setActive(n);
    refs.current[n]?.focus();
    onChange?.(tabs[n].id);
  };

  const onKeyDown = (e) => {
    const go = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    select(go);
  };

  return (
    <div style={s.wrap}>
      <div role="tablist" style={s.bar} onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => (refs.current[i] = el)} role="tab" id={`tab-${t.id}`}
            aria-selected={i === active} aria-controls={`panel-${t.id}`} tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)} style={{ ...s.tab, color: i === active ? "#fff" : "#7d8aa5" }}>
            {i === active && (
              <motion.span layoutId="glow" style={{ ...s.glow, boxShadow: `0 0 24px ${accent}88`, borderColor: accent }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            )}
            <span style={{ position: "relative" }}>{t.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tabs[active].id} role="tabpanel" id={`panel-${tabs[active].id}`}
          aria-labelledby={`tab-${tabs[active].id}`} style={s.panel}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}>
          {tabs[active].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const DEFAULT = [
  { id: "overview", label: "Overview", content: "Everything at a glance." },
  { id: "analytics", label: "Analytics", content: "Traffic is up 24% this week." },
  { id: "alerts", label: "Alerts", content: "No new alerts. All systems normal." },
];

const s = {
  wrap: { width: 420, fontFamily: "sans-serif" },
  bar: { display: "flex", gap: 4, padding: 6, borderRadius: 18, background: "#0b1020", border: "1px solid rgba(255,255,255,.08)" },
  tab: { position: "relative", flex: 1, padding: "12px 0", border: 0, background: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", borderRadius: 13, outline: "none" },
  glow: { position: "absolute", inset: 0, borderRadius: 13, border: "1px solid", background: "rgba(255,255,255,.06)" },
  panel: { marginTop: 16, padding: 24, borderRadius: 18, background: "#0b1020", color: "#c9d1e0", border: "1px solid rgba(255,255,255,.08)" },
};
