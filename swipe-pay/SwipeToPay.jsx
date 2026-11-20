import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const TRACK = 320, HANDLE = 56, MAX = TRACK - HANDLE - 8;

export default function SwipeToPay({ amount = "$24.90", onPay }) {
  const [paid, setPaid] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, MAX / 2], [1, 0]);

  if (paid) return <p role="status" style={s.done}>Payment successful</p>;

  return (
    <div style={s.track}>
      <motion.span style={{ ...s.hint, opacity }}>Swipe to pay {amount}</motion.span>
      <motion.div
        data-testid="handle"
        drag="x"
        dragConstraints={{ left: 0, right: MAX }}
        dragElastic={0}
        dragMomentum={false}
        style={{ ...s.handle, x }}
        onDragEnd={() => {
          if (x.get() >= MAX * 0.9) { setPaid(true); onPay?.(); }
          else x.set(0);
        }}
      >→</motion.div>
    </div>
  );
}

const s = {
  track: { position: "relative", width: TRACK, height: 64, borderRadius: 32, background: "#eef0ff" },
  hint: { position: "absolute", inset: 0, lineHeight: "64px", textAlign: "center", fontFamily: "sans-serif" },
  handle: { position: "absolute", top: 4, left: 4, width: HANDLE, height: HANDLE, borderRadius: "50%",
            background: "#6366f1", color: "#fff", lineHeight: `${HANDLE}px`, textAlign: "center", cursor: "grab" },
  done: { fontFamily: "sans-serif", color: "#6366f1", fontWeight: 600 },
};
