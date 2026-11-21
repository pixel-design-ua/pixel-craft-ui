import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// focus mode: picked note in the middle, its links on a ring, the rest pushed out
export function focusLayout(nodes, edges, id, c = CENTER, r = 118) {
  const near = edges.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
  return Object.fromEntries(nodes.map((n) => {
    if (n.id === id) return [n.id, { x: c.x, y: c.y, ring: 0 }];
    const i = near.indexOf(n.id);
    const a = i >= 0 ? (i / near.length) * 2 * Math.PI - Math.PI / 2
      : Math.atan2(n.y - c.y, n.x - c.x);
    const d = i >= 0 ? r : r * 2.4;
    return [n.id, { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d * 0.9, ring: i >= 0 ? 1 : 2 }];
  }));
}

export default function GraphSearch({ nodes = NODES, edges = EDGES, onChange, accent = "#10b981" }) {
  const [query, setQuery] = useState(""), [focus, setFocus] = useState(null);
  const [hover, setHover] = useState(null);
  const q = query.trim().toLowerCase();
  const hits = q ? nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id) : [];
  const pos = useMemo(() => focus ? focusLayout(nodes, edges, focus)
    : Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y, ring: 0 }])), [nodes, edges, focus]);
  const linked = focus ? nodes.filter((n) => pos[n.id].ring === 1) : [];
  const label = (id) => nodes.find((n) => n.id === id)?.label;
  const pick = (id) => { const next = id === focus ? null : id; setFocus(next); onChange?.(next); };
  const onKey = (e) => {
    if (e.key === "Enter" && hits.length) pick(hits[0]);
    if (e.key === "Escape") { setQuery(""); if (focus) pick(focus); }
  };
  const status = focus ? `${label(focus)} · ${linked.length} links`
    : q ? (hits.length ? `${hits.length} match${hits.length > 1 ? "es" : ""}` : "No notes match")
    : `${nodes.length} notes`;
  const spring = { type: "spring", stiffness: 260, damping: 20 };

  return (
    <div style={s.wrap}>
      <div style={s.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7f8ea3" strokeWidth="2.4" aria-hidden>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
        </svg>
        <input aria-label="Search notes" placeholder="Search notes…" value={query} style={s.input}
          onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} />
        <span role="status" aria-live="polite"
          style={{ ...s.chip, ...(q && !hits.length && !focus && s.chipErr), ...((focus || hits.length) && { color: accent }) }}>
          {status}
        </span>
      </div>
      <svg width="100%" height="100%" style={s.svg} aria-hidden>
        {edges.map(([a, b]) => {
          const on = focus && (a === focus || b === focus);
          const faded = focus ? !on : q && !hits.includes(a) && !hits.includes(b);
          return (
            <motion.line key={a + b} data-link={on || undefined} transition={spring}
              animate={{ x1: pos[a].x, y1: pos[a].y, x2: pos[b].x, y2: pos[b].y,
                stroke: on ? accent : hover === a || hover === b ? "#5b6b82" : "#2b3646",
                strokeWidth: on ? 2.5 : 1.5, opacity: faded ? 0.15 : 1 }} />
          );
        })}
      </svg>
      {nodes.map((n) => {
        const p = pos[n.id], hit = hits.includes(n.id), me = n.id === focus;
        const dim = focus ? p.ring === 2 : q && !hit; // focus mode wins over the search filter
        return (
          <motion.button key={n.id} aria-pressed={me} onClick={() => pick(n.id)}
            onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
            style={{ ...s.node, x: "-50%", y: "-50%", ...((hit || me) && { border: `1px solid ${accent}`, boxShadow: `0 0 18px ${accent}66` }) }}
            initial={false} transition={spring}
            animate={{ left: p.x, top: p.y, opacity: dim ? 0.18 : 1,
              scale: me ? 1.2 : hover === n.id ? 1.08 : p.ring === 2 ? 0.8 : 1 }}>
            <i style={{ ...s.dot, background: hit || me || p.ring === 1 ? accent : "#4a5568" }} />{n.label}
          </motion.button>
        );
      })}
      <AnimatePresence>
        {focus && (
          <motion.ul key="list" aria-label="Linked notes" style={s.list} transition={spring}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}>
            <li style={s.head}>LINKED TO {label(focus).toUpperCase()}</li>
            {linked.map((n, i) => (
              <motion.li key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.08 * i }}>
                <button aria-label={`Open ${n.label}`} style={s.row} onClick={() => pick(n.id)}>
                  <i style={{ ...s.dot, background: accent }} />{n.label}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const CENTER = { x: 165, y: 260 };
const NODES = [
  ["ideas", "Ideas", 70, 110], ["research", "Research", 190, 95], ["roadmap", "Roadmap", 320, 105],
  ["sprint", "Sprint", 405, 160], ["copy", "Copy", 300, 175], ["design", "Design", 140, 200],
  ["tokens", "Design Tokens", 200, 290], ["brand", "Brand", 60, 260], ["users", "Users", 100, 380],
  ["feedback", "Feedback", 230, 400], ["metrics", "Metrics", 350, 300], ["launch", "Launch", 390, 410],
].map(([id, label, x, y]) => ({ id, label, x, y }));
const EDGES = [["design", "ideas"], ["design", "research"], ["design", "tokens"], ["design", "brand"],
  ["design", "users"], ["ideas", "research"], ["research", "roadmap"], ["roadmap", "sprint"], ["tokens", "copy"],
  ["brand", "copy"], ["copy", "roadmap"], ["sprint", "metrics"], ["users", "feedback"], ["feedback", "metrics"],
  ["metrics", "launch"]];

const s = {
  wrap: { position: "relative", width: 470, height: 450, borderRadius: 28, overflow: "hidden", color: "#e6edf5",
    font: "600 12px system-ui, sans-serif", background: "radial-gradient(circle at 15% 0%, #0d3b30, transparent 55%), "
      + "radial-gradient(circle at 100% 100%, #1d1940, transparent 60%), #070a10" },
  search: { position: "absolute", left: 14, right: 14, top: 12, zIndex: 3, display: "flex", alignItems: "center", gap: 8,
    padding: "6px 8px 6px 12px", borderRadius: 14, background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(16px)" },
  input: { flex: 1, minWidth: 0, background: "none", border: 0, outline: "none", color: "inherit", font: "inherit", fontSize: 13 },
  chip: { padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.06)", color: "#7f8ea3",
    fontSize: 11, letterSpacing: 0.5, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" },
  chipErr: { color: "#fda4af", background: "rgba(244,63,94,.12)" },
  svg: { position: "absolute", inset: 0 },
  node: { position: "absolute", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999,
    cursor: "pointer", font: "inherit", color: "inherit", whiteSpace: "nowrap", background: "rgba(16,22,32,.8)",
    border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 8px 20px -8px #000" },
  dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", flex: "none" },
  list: { position: "absolute", right: 14, top: 64, width: 136, margin: 0, padding: 10, listStyle: "none", zIndex: 2,
    borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(16px)" },
  head: { padding: "2px 6px 8px", fontSize: 9, letterSpacing: 1.5, color: "#7f8ea3" },
  row: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 6px", border: 0, borderRadius: 10,
    background: "none", color: "inherit", font: "inherit", cursor: "pointer", textAlign: "left" },
};
