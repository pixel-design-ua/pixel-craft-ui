import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const LAMP = [24, 108], MIN = 20, MAX = 80, TOL = 4;          // scene units 180×320, bearings in degrees
const ROCKS = [[110, 190, 0.3], [75, 225, 0.55], [130, 250, 0.8]].map(([x, y, at]) =>
  ({ x, y, at, bearing: (Math.atan2(y - LAMP[1], x - LAMP[0]) * 180) / Math.PI }));
const KEYS = { ArrowRight: 2, ArrowUp: 2, ArrowLeft: -2, ArrowDown: -2, PageUp: 10, PageDown: -10 };
const START = [136, 312], HARBOUR = [60, 146];

export default function BeaconDial({ onResult, sailMs = 12000, width = 270, height = 480 }) {
  const [deg, setDeg] = useState(MIN);
  const [marks, setMarks] = useState([false, false, false]);
  const [result, setResult] = useState(null);
  const [p, setP] = useState(0);
  const live = useRef({ marks, result }), cv = useRef(null), dial = useRef(null);
  live.current = { marks, result };

  const aim = (v) => {
    const d = Math.round(Math.min(MAX, Math.max(MIN, v)));
    setDeg(d);
    if (!live.current.result) setMarks((m) => m.map((x, i) => x || Math.abs(d - ROCKS[i].bearing) <= TOL));
  };
  const onKey = (e) => {
    const next = KEYS[e.key] ? deg + KEYS[e.key] : e.key === "Home" ? MIN : e.key === "End" ? MAX : null;
    if (next !== null) { e.preventDefault(); aim(next); }
  };
  const fromPointer = (e) => {                                 // knob angle −120°…+120° maps to MIN…MAX
    const r = dial.current.getBoundingClientRect();
    const a = (Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)) * 180) / Math.PI;
    aim(MIN + ((Math.min(120, Math.max(-120, a)) + 120) / 240) * (MAX - MIN));
  };

  useEffect(() => {                                            // the boat sails; an unmarked rock wrecks it
    const t0 = performance.now(); let raf;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / sailMs), { marks: m } = live.current;
      const hit = ROCKS.findIndex((r, i) => k >= r.at && !m[i]);
      const res = hit >= 0 ? "wrecked" : k >= 1 ? "safe" : null;
      setP(k);
      if (res) { setResult(res); onResult?.(res); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sailMs]);

  useEffect(() => draw(cv.current, deg, marks, p, result), [deg, marks, p, result]);

  const rot = -120 + ((deg - MIN) / (MAX - MIN)) * 240;
  return (
    <div style={{ ...s.card, width, height }}>
      <canvas ref={cv} width={180} height={320} style={s.canvas} />
      <ul aria-label="Rocks" style={s.rocks}>
        {marks.map((m, i) => <li key={i}>Rock {i + 1}: {m ? "marked" : "hidden"}</li>)}
      </ul>
      <div role="status" style={{ ...s.status, color: result === "wrecked" ? "#ec342c" : "#f2e9d3" }}>
        {result === "safe" ? "BOAT IN HARBOUR" : result === "wrecked" ? "WRECKED ON AN UNMARKED ROCK" : "SAILING"}</div>
      <div ref={dial} style={s.dialWrap} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => e.buttons && fromPointer(e)}>
        <motion.div role="slider" tabIndex={0} aria-label="Lamp bearing" aria-valuemin={MIN} aria-valuemax={MAX}
          aria-valuenow={deg} aria-valuetext={`${deg}°`} onKeyDown={onKey} style={s.knob} initial={false}
          animate={{ rotate: rot }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
          whileFocus={{ boxShadow: "0 0 0 3px rgba(236,52,44,.6)" }}><i style={s.notch} /></motion.div>
      </div>
      <b style={s.led}>{String(deg).padStart(3, "0")}°</b>
    </div>
  );
}

function draw(canvas, deg, marks, p, result) {
  const g = canvas.getContext("2d"), a = (deg * Math.PI) / 180, [lx, ly] = LAMP;
  g.fillStyle = "#050304"; g.fillRect(0, 0, 180, 320);
  const bx = START[0] + (HARBOUR[0] - START[0]) * p, by = START[1] + (HARBOUR[1] - START[1]) * p;
  const inBeam = (x, y) => Math.abs(Math.atan2(y - ly, x - lx) - a) < 0.1;
  g.fillStyle = "rgba(242,233,211,.22)";                       // the beam: a wedge from the lamp
  g.beginPath(); g.moveTo(lx, ly); g.arc(lx, ly, 260, a - 0.1, a + 0.1); g.fill();
  ROCKS.forEach((r, i) => {
    g.fillStyle = inBeam(r.x, r.y) ? "#f2e9d3" : marks[i] ? "#4a443e" : "#050304";
    g.beginPath(); g.arc(r.x, r.y, 9, 0, 7); g.fill();
    if (marks[i]) { g.strokeStyle = "#ec342c"; g.setLineDash([3, 3]); g.beginPath(); g.arc(r.x, r.y, 14, 0, 7); g.stroke(); }
  });
  g.fillStyle = inBeam(bx, by) ? "#f2e9d3" : "#050304"; g.fillRect(bx - 5, by - 2, 10, 4);
  g.fillStyle = "#ec342c"; g.fillRect(bx - 1, by - 9, 2, 2);  // lantern stays visible when the beam is off
  if (result === "wrecked") { g.strokeStyle = "#ec342c"; g.beginPath(); g.moveTo(bx - 8, by - 8); g.lineTo(bx + 8, by + 8); g.moveTo(bx + 8, by - 8); g.lineTo(bx - 8, by + 8); g.stroke(); }
}

const s = {
  card: { position: "relative", overflow: "hidden", borderRadius: 4, background: "#050304", color: "#f2e9d3",
    fontFamily: "'Courier New', monospace", boxShadow: "0 30px 80px -20px rgba(0,0,0,.9)" },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated" },
  rocks: { position: "absolute", left: 12, top: 12, margin: 0, padding: 0, listStyle: "none", fontSize: 10, opacity: 0.6 },
  status: { position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontSize: 11, letterSpacing: 3 },
  dialWrap: { position: "absolute", left: "50%", bottom: 40, width: 96, height: 96, marginLeft: -48, touchAction: "none" },
  knob: { width: 96, height: 96, borderRadius: "50%", background: "#15110f", border: "2px solid #f2e9d3", outline: "none",
    boxSizing: "border-box", position: "relative", cursor: "grab" },
  notch: { position: "absolute", left: 45, top: 6, width: 4, height: 22, background: "#ec342c" },
  led: { position: "absolute", left: 12, bottom: 70, fontSize: 24, fontVariantNumeric: "tabular-nums" },
};
