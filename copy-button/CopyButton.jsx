import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CopyButton({ text, onCopy, resetMs = 1800 }) {
  const [state, setState] = useState("idle"); // idle | copied | error
  const timer = useRef();

  const copy = async () => {
    let ok = true;
    try { await navigator.clipboard.writeText(text); } catch { ok = false; }
    setState(ok ? "copied" : "error");
    onCopy?.(ok);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), resetMs);
  };

  const label = { idle: "Copy", copied: "Copied!", error: "Copy failed" }[state];
  return (
    <motion.button style={{ ...s.btn, ...s[state] }} onClick={copy} whileTap={{ scale: 0.94 }} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={state} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.15 }}>
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

const s = {
  btn: { minWidth: 140, padding: "12px 20px", borderRadius: 14, border: "none", font: "600 18px sans-serif", cursor: "pointer", overflow: "hidden" },
  idle: { background: "#f59e0b", color: "#fff" },
  copied: { background: "#10b981", color: "#fff" },
  error: { background: "#ef4444", color: "#fff" },
};
