import { useState, useEffect } from "react";
import { D } from "../constants.js";

const MSGS = [
  "Analyzing PG&E rate data for your area...",
  "Calculating 25-year cost projections...",
  "Checking energy community status for your zip code...",
  "Reviewing NEM 3.0 impact on your situation...",
  "Building your personalized report...",
];

export function LoadingScreen() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MSGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      {/* Spinner */}
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        border: `3px solid ${D.border}`,
        borderTopColor: D.teal,
        animation: "spin 1s linear infinite",
        margin: "0 auto 44px",
      }} />

      <h2 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "clamp(22px, 5vw, 28px)",
        color: D.white, marginBottom: 18, lineHeight: 1.3,
      }}>
        Generating Your Report
      </h2>

      <p style={{ color: D.teal, fontSize: 15, minHeight: 22 }}>
        {MSGS[idx]}
      </p>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36 }}>
        {MSGS.map((_, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i === idx ? D.teal : D.border,
            transition: "background .3s ease",
          }} />
        ))}
      </div>

      <p style={{ color: D.textMuted, fontSize: 12, marginTop: 36 }}>
        This typically takes 20–30 seconds
      </p>
    </div>
  );
}
