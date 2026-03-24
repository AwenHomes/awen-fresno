import { useState, useEffect } from "react";
import { D, annualCost, cumulativeCost, fmt } from "../constants.js";

const BARS = [
  { label: "This Year (Year 1)",  yearsFrom: 0,  delay: 0.05 },
  { label: "Year 5 annual cost",  yearsFrom: 5,  delay: 0.25 },
  { label: "Year 10 annual cost", yearsFrom: 10, delay: 0.45 },
  { label: "Year 25 annual cost", yearsFrom: 25, delay: 0.65 },
];

export function CostProjectionChart({ monthlyBill }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const annual25 = annualCost(monthlyBill, 25);
  const total25  = cumulativeCost(monthlyBill, 25);

  return (
    <div>
      {/* 25-year "stomach drop" number */}
      <div style={{
        background: D.redBg,
        border: `1px solid ${D.redDim}`,
        borderRadius: 12, padding: "20px 24px",
        marginBottom: 28, textAlign: "center",
      }}>
        <p style={{
          color: D.red, fontSize: 11, fontWeight: 700,
          letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8,
        }}>
          Your Estimated 25-Year PG&amp;E Total
        </p>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(38px, 9vw, 54px)",
          color: D.red, lineHeight: 1, fontWeight: 400,
        }}>
          {fmt(total25)}
        </p>
        <p style={{ color: D.textSub, fontSize: 13, marginTop: 10 }}>
          At PG&amp;E's historical 6.5% annual rate increase
        </p>
      </div>

      {/* Annual cost bars */}
      {BARS.map(({ label, yearsFrom, delay }) => {
        const val    = annualCost(monthlyBill, yearsFrom);
        const pct    = (val / annual25) * 100;
        const isLast = yearsFrom === 25;
        return (
          <div key={yearsFrom} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "baseline" }}>
              <span style={{ fontSize: 12, color: D.textSub, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isLast ? D.red : D.text }}>
                {fmt(val)}/yr
              </span>
            </div>
            <div style={{ background: D.border, borderRadius: 4, height: 9, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: isLast
                  ? `linear-gradient(90deg, ${D.red}, ${D.redDim})`
                  : `linear-gradient(90deg, ${D.teal}, ${D.tealDim})`,
                width: animated ? `${pct}%` : "0%",
                transition: `width 1.3s cubic-bezier(.4,0,.2,1) ${delay}s`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
