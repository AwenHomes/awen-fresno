import { useState, useRef } from "react";
import { D } from "../constants.js";
import { sanitize, submitLead } from "../api.js";
import { CostProjectionChart } from "./CostChart.jsx";

/* ── Inline bold parser ───────────────────────────────────── */
function parseBold(text) {
  return String(text).split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: D.gold, fontWeight: 700 }}>{part}</strong>
      : part
  );
}

/* ── Markdown → React renderer ───────────────────────────── */
export function MarkdownReport({ content }) {
  if (!content) return null;
  const lines    = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(20px, 4vw, 26px)", color: D.teal,
          marginTop: 44, marginBottom: 14, lineHeight: 1.25,
          paddingBottom: 10, borderBottom: `1px solid ${D.border}`,
        }}>
          {parseBold(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(14px, 3vw, 17px)", color: D.gold,
          fontWeight: 700, marginTop: 22, marginBottom: 8,
        }}>
          {parseBold(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        items.push(
          <li key={i} style={{ marginBottom: 8, lineHeight: 1.65, color: D.text }}>
            {parseBold(lines[i].trim().slice(2))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul${i}`} style={{ paddingLeft: 20, margin: "10px 0 16px", listStyleType: "disc" }}>
          {items}
        </ul>
      );
      continue;
    } else if (line.length > 0) {
      elements.push(
        <p key={i} style={{ color: D.text, lineHeight: 1.8, marginBottom: 14, fontSize: "clamp(15px, 2.5vw, 16.5px)" }}>
          {parseBold(line)}
        </p>
      );
    }
    i++;
  }

  return <div style={{ paddingTop: 4 }}>{elements}</div>;
}

/* ── TCPA disclosure text ─────────────────────────────────── */
const TCPA_INTRO = "By checking the applicable boxes below, I provide my prior express written consent to allow Awen Energy LLC to contact me at the phone number and/or email address I provided above for marketing purposes regarding solar energy products and services, using the specific methods I select. Awen Energy LLC may use automated telephone dialing systems, prerecorded or artificial voice messages, and/or automated text messages (SMS/MMS). I understand that:";

/* ── Lead capture form ────────────────────────────────────── */
export function LeadCaptureForm({ inputs, onSubmit }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cCall, setCCall] = useState(false);
  const [cText, setCText] = useState(false);
  const [cMail, setCMail] = useState(false);
  const [errs,  setErrs]  = useState({});
  const [busy,  setBusy]  = useState(false);
  const lastRef = useRef(0);

  function validate() {
    const e = {};
    if (!name.trim() || name.trim().length < 2)     e.name  = "Enter your first and last name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  e.email = "Enter a valid email address";
    if (phone.replace(/\D/g, "").length < 10)        e.phone = "Enter a valid 10-digit US phone number";
    if (!cCall && !cText && !cMail)                  e.consent = "Please select at least one contact method to proceed";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || busy) return;
    if (Date.now() - lastRef.current < 10000) return;
    lastRef.current = Date.now();
    setBusy(true);

    const methods = [cCall && "call", cText && "text", cMail && "email"].filter(Boolean).join(", ");
    await submitLead({
      name:                sanitize(name),
      email:               sanitize(email).toLowerCase(),
      phone:               sanitize(phone),
      state:               "California",
      city:                "Fresno",
      zip_code:            String(inputs.zipCode || ""),
      monthly_bill:        inputs.monthlyBill,
      home_sqft:           inputs.squareFootage || "",
      home_age:            inputs.homeAge || "",
      solar_status:        inputs.solarStatus || "",
      frustrations:        Array.isArray(inputs.frustrations) ? inputs.frustrations.join("; ") : "",
      consent_methods:     methods,
      consented_at:        new Date().toISOString(),
      consent_text:        TCPA_INTRO,
      consent_url:         window.location.href,
      user_agent:          navigator.userAgent,
      source:              "fresno-ai-report",
      ai_report_generated: true,
    });

    setBusy(false);
    onSubmit();
  }

  const inp = { width: "100%", background: D.bg, borderRadius: 10, padding: "12px 14px", fontSize: 16, color: D.white, fontFamily: "'Outfit', sans-serif" };
  const lbl = { display: "block", color: D.textSub, fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 7 };
  const clr = (err) => ({ ...inp, border: `1px solid ${err ? D.red : D.border}` });

  function ChkRow({ id, label, checked, setChecked }) {
    return (
      <label style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={checked}
          onChange={e => { setChecked(e.target.checked); setErrs(p => ({ ...p, consent: undefined })); }}
          style={{ marginTop: 3, width: 18, height: 18, accentColor: D.teal, flexShrink: 0, cursor: "pointer" }}
        />
        <span style={{ color: D.textSub, fontSize: 13, lineHeight: 1.6 }}>{label}</span>
      </label>
    );
  }

  return (
    <div style={{ background: D.card, border: `1px solid ${D.borderLight}`, borderRadius: 16, padding: "32px 28px", marginTop: 52 }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(20px, 4vw, 26px)", color: D.white, marginBottom: 10 }}>
        Want us to run the real numbers for your home?
      </h2>
      <p style={{ color: D.textSub, fontSize: 15, marginBottom: 28, lineHeight: 1.65 }}>
        The report above is based on general data for your area. A 15-minute conversation lets us pull
        your actual roof measurements, usage history, and specific PG&amp;E rate plan — and show you
        exactly what the numbers look like for your house, not a Fresno average.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>FULL NAME</label>
        <input type="text" value={name} placeholder="First and last name" style={clr(errs.name)}
          onChange={e => { setName(e.target.value); setErrs(p => ({ ...p, name: undefined })); }} />
        {errs.name && <p style={{ color: D.red, fontSize: 12, marginTop: 5 }}>{errs.name}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>EMAIL ADDRESS</label>
        <input type="email" value={email} placeholder="you@example.com" style={clr(errs.email)}
          onChange={e => { setEmail(e.target.value); setErrs(p => ({ ...p, email: undefined })); }} />
        {errs.email && <p style={{ color: D.red, fontSize: 12, marginTop: 5 }}>{errs.email}</p>}
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={lbl}>PHONE NUMBER</label>
        <input type="tel" value={phone} placeholder="(559) 555-1234" style={clr(errs.phone)}
          onChange={e => { setPhone(e.target.value); setErrs(p => ({ ...p, phone: undefined })); }} />
        {errs.phone && <p style={{ color: D.red, fontSize: 12, marginTop: 5 }}>{errs.phone}</p>}
      </div>

      {/* TCPA block */}
      <div style={{ background: D.bg, border: `1px solid ${D.border}`, borderRadius: 10, padding: "20px", marginBottom: 20 }}>
        <p style={{ color: D.textSub, fontSize: 12, lineHeight: 1.75, marginBottom: 16 }}>{TCPA_INTRO}</p>
        <ul style={{ color: D.textMuted, fontSize: 12, lineHeight: 1.7, marginBottom: 16, paddingLeft: 18 }}>
          <li>My consent is not a condition of any purchase</li>
          <li>Message frequency varies; standard message and data rates may apply</li>
          <li>To stop texts at any time, reply <strong>STOP</strong></li>
          <li>To unsubscribe from email, use the unsubscribe link in any message</li>
          <li>To revoke phone call consent, email <a href="mailto:privacy@awenenergy.com">privacy@awenenergy.com</a></li>
          <li>Opt-out requests are honored within <strong>10 business days</strong></li>
        </ul>

        <p style={{ color: D.white, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          How may Awen Energy LLC contact you?
        </p>
        <ChkRow id="call" label="Phone calls — including calls using an automated dialing system or prerecorded messages" checked={cCall} setChecked={setCCall} />
        <ChkRow id="text" label="Text messages / SMS — including automated text messages" checked={cText} setChecked={setCText} />
        <ChkRow id="mail" label="Email messages" checked={cMail} setChecked={setCMail} />
        {errs.consent && <p style={{ color: D.red, fontSize: 12, marginTop: 4 }}>{errs.consent}</p>}

        <p style={{ color: D.white, fontSize: 13, fontWeight: 700, marginTop: 14 }}>
          Consent is not a condition of any purchase.
        </p>
      </div>

      <p style={{ color: D.textMuted, fontSize: 11, lineHeight: 1.8, marginBottom: 20 }}>
        Your information will not be sold, shared with, or used by any other company.
        We honor the Federal Do Not Call Registry and the California State Do Not Call List.
        By submitting, you acknowledge our{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>,{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>, and{" "}
        <a href="/do-not-sell" target="_blank" rel="noopener noreferrer">Do Not Sell or Share My Personal Information</a>.
      </p>

      <button
        className="btn-primary" onClick={handleSubmit} disabled={busy}
        style={{
          width: "100%",
          background: busy ? D.border : `linear-gradient(135deg, ${D.gold}, ${D.goldDim})`,
          color: busy ? D.textMuted : D.bg,
          border: "none", borderRadius: 12, padding: "16px",
          fontSize: 17, fontWeight: 700, cursor: busy ? "default" : "pointer",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: busy ? "none" : `0 6px 24px ${D.gold}33`,
        }}
      >
        {busy ? "Submitting..." : "Schedule My Free 15-Minute Call →"}
      </button>
    </div>
  );
}

/* ── Report page ──────────────────────────────────────────── */
export function StepReport({ inputs, reportText, onLeadSubmit }) {
  const { monthlyBill, zipCode } = inputs;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-block", background: `${D.teal}1a`,
          border: `1px solid ${D.teal}44`, borderRadius: 20,
          padding: "5px 16px", marginBottom: 18,
        }}>
          <span style={{ color: D.teal, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Your Personalized PG&amp;E Reality Report
          </span>
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px, 5vw, 34px)", color: D.white, lineHeight: 1.2, marginBottom: 12 }}>
          Based on your ${monthlyBill}/month bill in zip code {zipCode}
        </h1>
        <p style={{ color: D.textMuted, fontSize: 13 }}>AI-generated · PG&amp;E rate data · {dateStr}</p>
      </div>

      <div className="fade-up fade-d1" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: "28px", marginBottom: 28 }}>
        <p style={{ color: D.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 22 }}>
          Cost Projection at 6.5% Annual Rate Increase
        </p>
        <CostProjectionChart monthlyBill={monthlyBill} />
      </div>

      <div className="fade-up fade-d2" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: "28px 28px 36px" }}>
        <p style={{ color: D.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
          Your Full Report
        </p>
        <MarkdownReport content={reportText} />
      </div>

      <div className="fade-up fade-d3">
        <LeadCaptureForm inputs={inputs} onSubmit={onLeadSubmit} />
      </div>
    </div>
  );
}
