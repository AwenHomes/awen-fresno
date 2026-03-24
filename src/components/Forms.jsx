import { useState } from "react";
import { D, SQ_FT_OPTS, HOME_AGE_OPTS, SOLAR_OPTS, FRUSTRATION_OPTS } from "../constants.js";

/* ── Shared radio-style button ────────────────────────────── */
function RadioOption({ label, selected, onClick }) {
  return (
    <button
      className="opt-btn"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", textAlign: "left",
        background: selected ? `${D.teal}1a` : D.card,
        border: `1px solid ${selected ? D.teal : D.border}`,
        borderRadius: 10, padding: "12px 16px",
        color: selected ? D.white : D.textSub,
        fontSize: 15, cursor: "pointer",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? D.teal : D.borderLight}`,
        background: selected ? D.teal : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <span style={{ width: 7, height: 7, borderRadius: "50%", background: D.bg, display: "block" }} />}
      </span>
      {label}
    </button>
  );
}

/* ── Step badge ───────────────────────────────────────────── */
function StepBadge({ n, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{
        background: D.teal, color: D.bg, borderRadius: "50%",
        width: 26, height: 26, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0,
      }}>{n}</div>
      <span style={{ color: D.textMuted, fontSize: 13 }}>Step {n} of {total}</span>
    </div>
  );
}

/* ── STEP: Intro ──────────────────────────────────────────── */
export function StepIntro({ onStart }) {
  return (
    <div>
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{
          display: "inline-block", background: `${D.red}22`,
          border: `1px solid ${D.red}55`, borderRadius: 20,
          padding: "5px 16px", marginBottom: 22,
        }}>
          <span style={{ color: D.red, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Fresno Homeowners
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(28px, 7vw, 46px)",
          color: D.white, lineHeight: 1.15,
          marginBottom: 20, letterSpacing: "-0.5px",
        }}>
          What PG&E Is Really Going<br />To Cost You Over 25 Years
        </h1>

        <p style={{
          color: D.textSub, fontSize: "clamp(15px, 3vw, 17px)",
          lineHeight: 1.75, maxWidth: 520, margin: "0 auto 32px",
        }}>
          Fresno has the <strong style={{ color: D.gold }}>highest electricity costs of any US city</strong>.
          Enter your info and get a free AI-generated report on your actual situation —
          before anyone asks for your name.
        </p>

        <button
          className="btn-primary"
          onClick={onStart}
          style={{
            background: `linear-gradient(135deg, ${D.teal}, ${D.tealDim})`,
            color: D.white, border: "none", borderRadius: 12,
            padding: "16px 40px", fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            boxShadow: `0 8px 32px ${D.teal}44`,
          }}
        >
          See My Free Report →
        </button>
        <p style={{ color: D.textMuted, fontSize: 12, marginTop: 12 }}>No email required to see your report</p>
      </div>

      {/* Stats */}
      <div className="fade-up fade-d2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
        {[
          { num: "$3,123", label: "Fresno average annual electricity bill", color: D.red },
          { num: "6.5%",   label: "PG&E average annual rate increase",       color: D.gold },
          { num: "6",      label: "Rate hikes PG&E approved in 2024 alone",  color: D.red },
        ].map(({ num, label, color }) => (
          <div key={num} style={{
            background: D.card, border: `1px solid ${D.border}`,
            borderRadius: 12, padding: "18px 14px", textAlign: "center",
          }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px, 5vw, 32px)", color, marginBottom: 6 }}>{num}</div>
            <div style={{ fontSize: 11, color: D.textMuted, lineHeight: 1.4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* What you get */}
      <div className="fade-up fade-d3" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: "24px 24px 20px" }}>
        <p style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 16 }}>
          Your free report includes
        </p>
        {[
          "Your 25-year projected PG&E cost — the number nobody shows you",
          "Why your neighbor's solar experience was different from what you've heard",
          "What a properly designed system would look like for your specific home",
          "Personalized by AI based on your zip code, bill, and situation",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
            <span style={{ color: D.teal, fontSize: 16, flexShrink: 0, lineHeight: "22px" }}>✓</span>
            <span style={{ color: D.textSub, fontSize: 14, lineHeight: 1.55 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── STEP: Form 1 — zip + bill ────────────────────────────── */
export function StepForm1({ onNext, initialValues }) {
  const [zip,  setZip]  = useState(initialValues.zipCode || "");
  const [bill, setBill] = useState(initialValues.monthlyBill ? String(initialValues.monthlyBill) : "");
  const [errs, setErrs] = useState({});

  function validate() {
    const e = {};
    if (!/^\d{5}$/.test(zip.trim())) e.zip = "Enter a valid 5-digit zip code";
    const b = parseFloat(bill);
    if (!bill || isNaN(b) || b < 1 || b > 9999) e.bill = "Enter your average monthly bill (e.g. 260)";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  const base = {
    width: "100%", background: D.card, borderRadius: 10,
    color: D.white, fontFamily: "'Outfit', sans-serif",
  };

  return (
    <div className="fade-up">
      <StepBadge n={1} total={2} />
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px, 5vw, 30px)", color: D.white, lineHeight: 1.25, marginBottom: 8 }}>
        Let's start with the basics
      </h2>
      <p style={{ color: D.textSub, fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
        Your zip code and bill amount let us pull the right PG&amp;E rate data and energy community status for your area.
      </p>

      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", color: D.textSub, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your zip code</label>
        <input
          type="text" inputMode="numeric" maxLength={5}
          value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="e.g. 93720"
          style={{ ...base, border: `1px solid ${errs.zip ? D.red : D.border}`, padding: "14px 16px", fontSize: 20, letterSpacing: "3px" }}
        />
        {errs.zip && <p style={{ color: D.red, fontSize: 12, marginTop: 6 }}>{errs.zip}</p>}
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "block", color: D.textSub, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Average summer monthly PG&amp;E bill</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: D.textMuted, fontSize: 22, fontWeight: 600, pointerEvents: "none" }}>$</span>
          <input
            type="number" min="1" max="9999"
            value={bill} onChange={e => setBill(e.target.value)}
            placeholder="260"
            style={{ ...base, border: `1px solid ${errs.bill ? D.red : D.border}`, padding: "14px 72px 14px 36px", fontSize: 26, fontWeight: 700 }}
          />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: D.textMuted, fontSize: 14, pointerEvents: "none" }}>/month</span>
        </div>
        {errs.bill && <p style={{ color: D.red, fontSize: 12, marginTop: 6 }}>{errs.bill}</p>}
        <p style={{ color: D.textMuted, fontSize: 12, marginTop: 8 }}>Use your highest summer month. Fresno average is $260/month.</p>
      </div>

      <button
        className="btn-primary"
        onClick={() => { if (validate()) onNext({ zipCode: zip.trim(), monthlyBill: parseFloat(bill) }); }}
        style={{
          width: "100%", background: `linear-gradient(135deg, ${D.teal}, ${D.tealDim})`,
          color: D.white, border: "none", borderRadius: 12,
          padding: "16px", fontSize: 17, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          boxShadow: `0 6px 24px ${D.teal}33`,
        }}
      >
        Continue →
      </button>
    </div>
  );
}

/* ── STEP: Form 2 — home details + frustrations ───────────── */
export function StepForm2({ onNext, onBack, initialValues }) {
  const [sqft,   setSqft]   = useState(initialValues.squareFootage || "");
  const [age,    setAge]    = useState(initialValues.homeAge || "");
  const [solar,  setSolar]  = useState(initialValues.solarStatus || "");
  const [frList, setFrList] = useState(initialValues.frustrations || []);
  const [errs,   setErrs]   = useState({});

  function toggle(item) {
    setFrList(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  }

  function validate() {
    const e = {};
    if (!sqft)           e.sqft = "Please select your home size";
    if (!age)            e.age  = "Please select when your home was built";
    if (!solar)          e.solar = "Please select your solar status";
    if (!frList.length)  e.fr   = "Please select at least one";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  const secLbl = { display: "block", color: D.textSub, fontSize: 13, fontWeight: 700, marginBottom: 10, marginTop: 28 };
  const errTxt = { color: D.red, fontSize: 12, marginBottom: 8, display: "block" };

  return (
    <div className="fade-up">
      <StepBadge n={2} total={2} />
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px, 5vw, 30px)", color: D.white, lineHeight: 1.25, marginBottom: 8 }}>
        A few more details about your home
      </h2>
      <p style={{ color: D.textSub, fontSize: 15, lineHeight: 1.65, marginBottom: 4 }}>
        This is what makes your report specific to you — not just a generic calculator output.
      </p>

      <label style={secLbl}>Home size</label>
      {errs.sqft && <span style={errTxt}>{errs.sqft}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SQ_FT_OPTS.map(o => <RadioOption key={o} label={o} selected={sqft === o} onClick={() => setSqft(o)} />)}
      </div>

      <label style={secLbl}>When was your home built?</label>
      {errs.age && <span style={errTxt}>{errs.age}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {HOME_AGE_OPTS.map(o => <RadioOption key={o} label={o} selected={age === o} onClick={() => setAge(o)} />)}
      </div>

      <label style={secLbl}>Do you currently have solar?</label>
      {errs.solar && <span style={errTxt}>{errs.solar}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SOLAR_OPTS.map(o => <RadioOption key={o} label={o} selected={solar === o} onClick={() => setSolar(o)} />)}
      </div>

      <label style={secLbl}>What frustrates you most about your electricity situation?</label>
      <p style={{ color: D.textMuted, fontSize: 12, marginBottom: 10 }}>Select all that apply</p>
      {errs.fr && <span style={errTxt}>{errs.fr}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FRUSTRATION_OPTS.map(o => {
          const sel = frList.includes(o);
          return (
            <button
              key={o} className="opt-btn" onClick={() => toggle(o)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", textAlign: "left",
                background: sel ? `${D.gold}18` : D.card,
                border: `1px solid ${sel ? D.gold : D.border}`,
                borderRadius: 10, padding: "12px 16px",
                color: sel ? D.white : D.textSub,
                fontSize: 15, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${sel ? D.gold : D.borderLight}`,
                background: sel ? D.gold : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {sel && <span style={{ color: D.bg, fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {o}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
        <button
          onClick={onBack}
          style={{
            flex: "0 0 auto", padding: "14px 20px",
            background: "transparent", border: `1px solid ${D.border}`,
            borderRadius: 12, color: D.textSub, fontSize: 15,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          }}
        >← Back</button>
        <button
          className="btn-primary"
          onClick={() => { if (validate()) onNext({ squareFootage: sqft, homeAge: age, solarStatus: solar, frustrations: frList }); }}
          style={{
            flex: 1, background: `linear-gradient(135deg, ${D.teal}, ${D.tealDim})`,
            color: D.white, border: "none", borderRadius: 12,
            padding: "14px", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            boxShadow: `0 6px 24px ${D.teal}33`,
          }}
        >
          Generate My Report →
        </button>
      </div>
    </div>
  );
}
