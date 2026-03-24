import { useEffect } from "react";
import { D, CALENDLY_URL, cumulativeCost, fmt } from "../constants.js";

export function StepThankYou({ monthlyBill }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const total25  = Math.round(cumulativeCost(monthlyBill, 25));
  const locked   = Math.round(monthlyBill * 0.72);
  const locked25 = locked * 12 * 25;

  return (
    <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px 40px" }}>
      {/* Check icon */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: `${D.teal}22`, border: `2px solid ${D.teal}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 28px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={D.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px, 5vw, 32px)", color: D.white, marginBottom: 16 }}>
        You're all set.
      </h2>
      <p style={{ color: D.textSub, fontSize: 16, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 12px" }}>
        Opening your scheduling page now. Pick a 15-minute window that works for you —
        no pitch, just your actual numbers.
      </p>
      <p style={{ color: D.textMuted, fontSize: 13, marginBottom: 44 }}>
        If it didn't open automatically,{" "}
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">click here</a>.
      </p>

      {/* Snapshot card */}
      <div style={{
        background: D.card, border: `1px solid ${D.border}`,
        borderTop: `3px solid ${D.teal}`, borderRadius: 14,
        padding: "24px", maxWidth: 380, margin: "0 auto",
      }}>
        <p style={{ color: D.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 18 }}>
          Your Snapshot
        </p>
        {[
          { label: "Current PG&E (monthly)",     value: fmt(monthlyBill),  color: D.red  },
          { label: "Projected 25-yr PG&E total", value: fmt(total25),      color: D.red,  divider: true },
          { label: "Est. locked rate (monthly)", value: `~${fmt(locked)}`, color: D.teal },
          { label: "Est. 25-yr locked total",    value: fmt(locked25),     color: D.teal },
        ].map(({ label, value, color, divider }, i) => (
          <div key={i}>
            {divider && <div style={{ height: 1, background: D.border, margin: "14px 0" }} />}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: divider ? 0 : 12 }}>
              <span style={{ fontSize: 13, color: D.textMuted }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
