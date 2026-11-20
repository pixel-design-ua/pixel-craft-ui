import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function OtpVerification({ length = 4, onVerify }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [status, setStatus] = useState("idle");
  const refs = useRef([]);

  const onChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < length - 1) refs.current[i + 1].focus();
    if (next.every(Boolean)) {
      setStatus("loading");
      setTimeout(() => { setStatus("done"); onVerify?.(next.join("")); }, 1200);
    }
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1].focus();
  };

  if (status !== "idle") return (
    <div style={s.card} role="status">
      {status === "loading" ? "Verifying…" : "Verified Successfully"}
    </div>
  );

  return (
    <div style={s.card}>
      <h2>Verification</h2>
      <p>Enter the {length}-digit code sent to your email.</p>
      <div style={s.row}>
        {otp.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            style={s.box}
            value={d}
            maxLength={1}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            animate={{ scale: d ? [1, 1.15, 1] : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

const s = {
  card: { width: 360, padding: 32, borderRadius: 24, background: "#fff", textAlign: "center", fontFamily: "sans-serif" },
  row: { display: "flex", gap: 12, justifyContent: "center", marginTop: 24 },
  box: { width: 56, height: 56, borderRadius: 14, border: "2px solid #e3e6ec", textAlign: "center", fontSize: 26 },
};
