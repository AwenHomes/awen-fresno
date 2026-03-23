import { useState, useEffect, useRef } from "react";

/* ── Brand tokens ────────────────────────────────────────── */
const C = {
  teal:     "#2BBFB3",
  tealDk:   "#1a9e93",
  tealDeep: "#0d5c57",
  gold:     "#F5A623",
  goldDk:   "#d4881a",
  dark:     "#0a1a19",
  darkCard: "#0f2625",
  darkMid:  "#163432",
  white:    "#f0fffe",
  offWhite: "#c8e8e5",
  textMid:  "#8fb5b2",
  red:      "#e74c3c",
  redSoft:  "#ff6b6b",
};

/* ── Supabase config ─────────────────────────────────────── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";

/* ── TCPA consent disclosure text (stored with each lead) ── */
const TCPA_DISCLOSURE = 'By checking this box and clicking "Get My Free Personalized Report," I provide my prior express written consent to allow Awen Energy LLC to contact me at the phone number I provided above, including by automated telephone dialing system, prerecorded voice, or artificial voice message, and by text message (SMS/MMS), for marketing purposes regarding solar energy products and services. I understand that my consent is not a condition of purchasing any goods or services. Message and data rates may apply. I may revoke my consent at any time.';

/* ── PG&E rate model ─────────────────────────────────────── */
const PGE_ANNUAL_INCREASE = 0.065; // 6.5% avg — conservative per CPUC data
const PGE_FIXED_CHARGE    = 24;    // monthly base service charge starting Mar 2026
const FRESNO_AVG_MONTHLY  = 260;   // ~$3,123/yr per CashNetUSA/EIA

function projectCosts(monthlyBill, years) {
  let total = 0;
  for (let y = 1; y <= years; y++) {
    const annualBill = (monthlyBill * Math.pow(1 + PGE_ANNUAL_INCREASE, y)) * 12;
    total += annualBill;
  }
  return Math.round(total);
}

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ── Legal page shell ───────────────────────────────────── */
function LegalShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.white, fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${C.dark}; margin: 0; }`}</style>
      <nav style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.darkMid}` }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: C.white }}>
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill={C.tealDeep}/>
            <path d="M18 8C12 8 8 12 8 18C8 24 12 28 18 28C24 28 28 24 28 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M18 8C22 10 26 14 26 18" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="18" cy="18" r="3" fill={C.gold}/>
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: ".5px", lineHeight: 1 }}>Awen</div>
            <div style={{ fontWeight: 600, fontSize: 9, color: C.gold, letterSpacing: "2px", textTransform: "uppercase" }}>ENERGY</div>
          </div>
        </a>
      </nav>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, marginBottom: 32 }}>{title}</h1>
        <div style={{ fontSize: 14, color: C.offWhite, lineHeight: 1.8 }}>{children}</div>
      </main>
      <footer style={{ borderTop: `1px solid ${C.darkMid}`, padding: "24px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: C.textMid }}>© {new Date().getFullYear()} Awen Energy LLC</p>
      </footer>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <LegalShell title="Privacy Policy">
      <p style={{ marginBottom: 16 }}><strong>Effective Date:</strong> March 2026</p>
      <p style={{ marginBottom: 16 }}>Awen Energy LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you visit our website or submit a lead form.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Information We Collect</h3>
      <p style={{ marginBottom: 16 }}>When you use our cost report tool and submit the lead capture form, we collect: your name, email address, phone number, estimated monthly electricity bill, city, state, the date and time you provided consent, the URL of the page where consent was given, and your browser user agent string.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>How We Use Your Information</h3>
      <p style={{ marginBottom: 16 }}>We use the information you provide to: (a) prepare and deliver your personalized PG&E cost comparison report; (b) contact you by phone, text, or email about solar energy products and services as authorized by your consent; (c) improve our website and services; and (d) comply with legal obligations including TCPA consent recordkeeping requirements.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Sharing of Information</h3>
      <p style={{ marginBottom: 16 }}>We do not sell your personal information. We may share your information with service providers who assist us in delivering our services (such as our CRM and scheduling platforms), and as required by law.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Your California Privacy Rights (CCPA/CPRA)</h3>
      <p style={{ marginBottom: 16 }}>If you are a California resident, you have the right to: (a) know what personal information we collect about you; (b) request deletion of your personal information; (c) request correction of inaccurate personal information; (d) opt out of the sale or sharing of your personal information; and (e) not be discriminated against for exercising your privacy rights. To exercise any of these rights, contact us at privacy@awenenergy.com.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Data Retention</h3>
      <p style={{ marginBottom: 16 }}>We retain your personal information for as long as necessary to fulfill the purposes described in this policy, and for a minimum of 5 years for TCPA consent records.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Contact Us</h3>
      <p style={{ marginBottom: 16 }}>Awen Energy LLC<br />Email: privacy@awenenergy.com</p>
    </LegalShell>
  );
}

function TermsOfService() {
  return (
    <LegalShell title="Terms of Service">
      <p style={{ marginBottom: 16 }}><strong>Effective Date:</strong> March 2026</p>
      <p style={{ marginBottom: 16 }}>By using this website, you agree to these Terms of Service. If you do not agree, please do not use our website.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Use of This Website</h3>
      <p style={{ marginBottom: 16 }}>This website provides educational cost projection tools and lead capture services for solar energy consultations. The projections displayed are estimates based on publicly available PG&E rate data and historical trends. They do not constitute financial advice, guarantees, or binding offers.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Consent to Communications</h3>
      <p style={{ marginBottom: 16 }}>By submitting the lead form and checking the consent box, you provide your prior express written consent under the Telephone Consumer Protection Act (TCPA) for Awen Energy LLC to contact you at the phone number you provided using automated telephone dialing systems, prerecorded or artificial voice messages, and text messages (SMS/MMS) for marketing purposes. You may revoke this consent at any time by contacting us or replying STOP to any text message.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Limitation of Liability</h3>
      <p style={{ marginBottom: 16 }}>Awen Energy LLC shall not be liable for any damages arising from your use of this website or reliance on the projections provided. Solar savings depend on system size, design, orientation, usage patterns, and financing terms.</p>

      <h3 style={{ color: C.teal, marginTop: 24, marginBottom: 12 }}>Contact Us</h3>
      <p style={{ marginBottom: 16 }}>Awen Energy LLC<br />Email: info@awenenergy.com</p>
    </LegalShell>
  );
}

function DoNotSell() {
  return (
    <LegalShell title="Do Not Sell or Share My Personal Information">
      <p style={{ marginBottom: 16 }}>Under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), California residents have the right to opt out of the sale or sharing of their personal information.</p>
      <p style={{ marginBottom: 16 }}><strong>Awen Energy LLC does not sell your personal information.</strong> We do not share your personal information with third parties for cross-context behavioral advertising purposes.</p>
      <p style={{ marginBottom: 16 }}>If you would like to submit a request regarding your personal data, or if you have questions about our data practices, please contact us at:</p>
      <p style={{ marginBottom: 16 }}>Email: privacy@awenenergy.com</p>
      <p style={{ marginBottom: 16 }}>We honor Global Privacy Control (GPC) browser signals as valid opt-out requests.</p>
    </LegalShell>
  );
}

/* ── Main App ────────────────────────────────────────────── */
export default function App() {
  const path = window.location.pathname;
  if (path === "/privacy") return <PrivacyPolicy />;
  if (path === "/terms") return <TermsOfService />;
  if (path === "/do-not-sell") return <DoNotSell />;
  const [step, setStep]     = useState(0);
  const [bill, setBill]     = useState("");
  const [anim, setAnim]     = useState(false);
  const [form, setForm]     = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent]         = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    setAnim(true);
    const t = setTimeout(() => setAnim(false), 600);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const monthly   = parseFloat(bill) || FRESNO_AVG_MONTHLY;
  const cost5yr   = projectCosts(monthly, 5);
  const cost10yr  = projectCosts(monthly, 10);
  const cost25yr  = projectCosts(monthly, 25);
  const locked    = Math.round(monthly * 0.72);  // ~28% less with properly designed solar+battery
  const locked25  = locked * 12 * 25;
  const savings25 = cost25yr - locked25;

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Valid email required";
    if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone.trim())) e.phone = "Valid phone required";
    if (!consent) e.consent = "Consent is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            apikey:          SUPABASE_KEY,
            Authorization:   `Bearer ${SUPABASE_KEY}`,
            Prefer:          "return=minimal",
          },
          body: JSON.stringify({
            name:         form.name.trim(),
            email:        form.email.trim().toLowerCase(),
            phone:        form.phone.trim(),
            state:        "California",
            city:         "Fresno",
            monthly_bill: monthly,
            source:       "fresno-pge-report",
            consented_at: consentTimestamp,
            consent_text: TCPA_DISCLOSURE,
            consent_url:  window.location.href,
            user_agent:   navigator.userAgent,
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          console.error("Lead capture failed:", res.status, body);
        }
      } catch (err) {
        console.error("Lead capture error:", err);
      }
    }

    setSubmitted(true);
    setSubmitting(false);
    setStep(5);
    setTimeout(() => {
      window.open("https://www.calendly.com/sustainablelifebydesign", "_blank");
    }, 3000);
  };

  /* ── Bar chart helper ── */
  const Bar = ({ label, value, max, color, delay = 0 }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.offWhite, letterSpacing: ".5px" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 10, background: C.darkMid, borderRadius: 5, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: anim && step === 2 ? 0 : `${(value / max) * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius: 5,
            transition: `width 1.2s cubic-bezier(.4,0,.2,1) ${delay}s`,
          }}
        />
      </div>
    </div>
  );

  /* ── Shared layout ── */
  const Shell = ({ children }) => (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.white, fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.dark}; margin: 0; -webkit-font-smoothing: antialiased; }
        input:focus { outline: 2px solid ${C.teal}; outline-offset: 2px; }
        ::selection { background: ${C.teal}; color: ${C.dark}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .fade-up { animation: fadeUp .7s cubic-bezier(.4,0,.2,1) forwards; }
        .fade-up-d1 { animation-delay: .15s; opacity: 0; }
        .fade-up-d2 { animation-delay: .3s; opacity: 0; }
        .fade-up-d3 { animation-delay: .45s; opacity: 0; }
        .fade-up-d4 { animation-delay: .6s; opacity: 0; }
      `}</style>
      <div ref={topRef} />

      {/* Nav */}
      <nav style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.darkMid}` }}>
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill={C.tealDeep}/>
          <path d="M18 8C12 8 8 12 8 18C8 24 12 28 18 28C24 28 28 24 28 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M18 8C22 10 26 14 26 18" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="18" cy="18" r="3" fill={C.gold}/>
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: ".5px", lineHeight: 1 }}>Awen</div>
          <div style={{ fontWeight: 600, fontSize: 9, color: C.gold, letterSpacing: "2px", textTransform: "uppercase" }}>ENERGY</div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.textMid, letterSpacing: ".5px" }}>FRESNO / SAN JOAQUIN VALLEY</span>
      </nav>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.darkMid}`, padding: "24px 28px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <a href="/privacy" style={{ fontSize: 11, color: C.teal, textDecoration: "none" }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: 11, color: C.teal, textDecoration: "none" }}>Terms of Service</a>
          <a href="/do-not-sell" style={{ fontSize: 11, color: C.teal, textDecoration: "none" }}>Do Not Sell or Share My Personal Information</a>
        </div>
        <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.8, maxWidth: 540, margin: "0 auto" }}>
          © {new Date().getFullYear()} Awen Energy LLC. Projections are estimates based on publicly available PG&E rate data and historical rate increase trends.
          Actual future rates may vary. This tool is for educational purposes and does not constitute financial advice.
          Solar savings depend on system size, design, orientation, usage, and financing terms.
        </p>
      </footer>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     STEP 0 — LANDING / HOOK
  ════════════════════════════════════════════════════════ */
  if (step === 0) return (
    <Shell>
      <div className="fade-up" style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "3px", color: C.gold, textTransform: "uppercase", marginBottom: 20 }}>
          PG&E COST REPORT
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px, 7vw, 48px)", lineHeight: 1.15, marginBottom: 24, color: C.white }}>
          Fresno pays more for electricity than{" "}
          <span style={{ color: C.redSoft }}>any city in America.</span>
        </h1>
        <p className="fade-up fade-up-d1" style={{ fontSize: 17, lineHeight: 1.7, color: C.offWhite, marginBottom: 16 }}>
          The average Fresno household spends <strong style={{ color: C.gold }}>$3,123 per year</strong> on
          electricity — more than Los Angeles, more than New York, more than Miami.
        </p>
        <p className="fade-up fade-up-d2" style={{ fontSize: 17, lineHeight: 1.7, color: C.offWhite, marginBottom: 16 }}>
          PG&E approved six rate hikes in 2024 alone. Another increase is on the table through 2030.
          The new $24/month fixed charge hits every customer — even those with solar.
        </p>
        <p className="fade-up fade-up-d2" style={{ fontSize: 17, lineHeight: 1.7, color: C.offWhite, marginBottom: 32 }}>
          This free report shows you exactly what PG&E is projected to cost your household over
          the next 5, 10, and 25 years — and what a properly designed solar + battery system could lock in instead.
        </p>
      </div>

      {/* Stat cards */}
      <div className="fade-up fade-up-d3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 40 }}>
        {[
          { label: "Avg. Fresno annual bill", value: "$3,123", sub: "Highest in the U.S." },
          { label: "PG&E rate hikes in 2024", value: "6", sub: "With more proposed" },
          { label: "Avg. rate increase / year", value: "6.5%", sub: "Last 5 years" },
          { label: "New monthly fixed charge", value: "$24", sub: "Even with solar" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.darkCard, border: `1px solid ${C.darkMid}`, borderRadius: 12, padding: "20px 16px",
          }}>
            <div style={{ fontSize: 11, color: C.textMid, letterSpacing: ".5px", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.gold, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.redSoft }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <button
        className="fade-up fade-up-d4"
        onClick={() => setStep(1)}
        style={{
          width: "100%", padding: "18px 24px", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
          background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: C.dark, border: "none",
          borderRadius: 10, cursor: "pointer", letterSpacing: ".5px",
          transition: "transform .2s, box-shadow .2s",
        }}
        onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 32px ${C.teal}44`; }}
        onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
      >
        See What PG&E Is Costing You →
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: C.textMid, marginTop: 12 }}>
        Takes 60 seconds · Nothing to buy · Completely free
      </p>
    </Shell>
  );

  /* ════════════════════════════════════════════════════════
     STEP 1 — BILL INPUT
  ════════════════════════════════════════════════════════ */
  if (step === 1) return (
    <Shell>
      <div className="fade-up">
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "3px", color: C.teal, textTransform: "uppercase", marginBottom: 16 }}>
          STEP 1 OF 3
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, lineHeight: 1.2, marginBottom: 16 }}>
          What does PG&E charge you in a typical summer month?
        </h2>
        <p style={{ fontSize: 15, color: C.offWhite, lineHeight: 1.7, marginBottom: 32 }}>
          Enter your average monthly bill from June through September. If you're not sure, we'll use the Fresno
          average of $260/month — but your actual number gives you a more accurate projection.
        </p>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            fontSize: 28, fontWeight: 700, color: C.textMid, pointerEvents: "none",
          }}>$</span>
          <input
            type="number"
            inputMode="numeric"
            value={bill}
            onChange={e => setBill(e.target.value)}
            placeholder={String(FRESNO_AVG_MONTHLY)}
            style={{
              width: "100%", padding: "20px 20px 20px 44px", fontSize: 28, fontWeight: 700,
              fontFamily: "'Outfit', sans-serif", background: C.darkCard, border: `2px solid ${C.darkMid}`,
              borderRadius: 12, color: C.white,
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: C.textMid, marginBottom: 36 }}>
          The average Fresno PG&E summer bill is around $260/month. Many homeowners report $400–$800+.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setStep(0)}
            style={{
              padding: "16px 24px", fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              background: "transparent", color: C.textMid, border: `1px solid ${C.darkMid}`,
              borderRadius: 10, cursor: "pointer",
            }}
          >← Back</button>
          <button
            onClick={() => setStep(2)}
            style={{
              flex: 1, padding: "16px 24px", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: C.dark, border: "none",
              borderRadius: 10, cursor: "pointer", letterSpacing: ".5px",
            }}
          >See My Projection →</button>
        </div>
      </div>
    </Shell>
  );

  /* ════════════════════════════════════════════════════════
     STEP 2 — PROJECTION REPORT
  ════════════════════════════════════════════════════════ */
  if (step === 2) return (
    <Shell>
      <div className="fade-up">
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "3px", color: C.teal, textTransform: "uppercase", marginBottom: 16 }}>
          YOUR PG&E PROJECTION
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, lineHeight: 1.2, marginBottom: 8 }}>
          If PG&E rates continue at their current pace:
        </h2>
        <p style={{ fontSize: 14, color: C.textMid, marginBottom: 32 }}>
          Based on {fmt(monthly)}/month and PG&E's average 6.5% annual rate increase
        </p>

        {/* Projection bars */}
        <div style={{ background: C.darkCard, borderRadius: 14, padding: "28px 24px", marginBottom: 24, border: `1px solid ${C.darkMid}` }}>
          <Bar label="Next 5 years" value={cost5yr} max={cost25yr} color={C.gold} delay={0.1} />
          <Bar label="Next 10 years" value={cost10yr} max={cost25yr} color="#e8913a" delay={0.3} />
          <Bar label="Next 25 years" value={cost25yr} max={cost25yr} color={C.redSoft} delay={0.5} />
        </div>

        {/* Key stat callout */}
        <div className="fade-up fade-up-d2" style={{
          background: `linear-gradient(135deg, ${C.tealDeep}, ${C.darkCard})`,
          borderRadius: 14, padding: "28px 24px", marginBottom: 24,
          border: `1px solid ${C.teal}33`,
        }}>
          <div style={{ fontSize: 12, color: C.teal, letterSpacing: "2px", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
            THE REAL NUMBER
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, color: C.white, marginBottom: 8 }}>
            {fmt(cost25yr)}
          </div>
          <p style={{ fontSize: 14, color: C.offWhite, lineHeight: 1.6 }}>
            That's what you're projected to send PG&E over the next 25 years at current rate
            trends — with no equity, no ownership, and no protection from future increases.
          </p>
        </div>

        {/* vs locked rate */}
        <div className="fade-up fade-up-d3" style={{
          background: C.darkCard, borderRadius: 14, padding: "28px 24px", marginBottom: 32,
          border: `1px solid ${C.darkMid}`,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: C.redSoft, letterSpacing: "1px", fontWeight: 600, marginBottom: 6 }}>PG&E (25 YRS)</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.redSoft }}>{fmt(cost25yr)}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>Goes up every year</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.teal, letterSpacing: "1px", fontWeight: 600, marginBottom: 6 }}>LOCKED RATE (25 YRS)</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.teal }}>{fmt(locked25)}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>Fixed, predictable, yours</div>
            </div>
          </div>
          <div style={{
            marginTop: 20, padding: "14px 16px", background: `${C.teal}15`, borderRadius: 8,
            border: `1px solid ${C.teal}22`, textAlign: "center",
          }}>
            <span style={{ fontSize: 14, color: C.teal, fontWeight: 700 }}>
              Potential savings: {fmt(savings25)} over 25 years
            </span>
          </div>
        </div>

        <button
          onClick={() => setStep(3)}
          style={{
            width: "100%", padding: "18px 24px", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: C.dark, border: "none",
            borderRadius: 10, cursor: "pointer", letterSpacing: ".5px",
          }}
        >But Wait — Why Does Solar Work For Some And Not Others? →</button>
      </div>
    </Shell>
  );

  /* ════════════════════════════════════════════════════════
     STEP 3 — THE SOLAR REALITY CHECK
  ════════════════════════════════════════════════════════ */
  if (step === 3) return (
    <Shell>
      <div className="fade-up">
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "3px", color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
          STEP 2 OF 3
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, lineHeight: 1.2, marginBottom: 20 }}>
          Why some Fresno homeowners love solar — and others feel <span style={{ color: C.redSoft }}>burned.</span>
        </h2>
        <p style={{ fontSize: 15, color: C.offWhite, lineHeight: 1.8, marginBottom: 28 }}>
          We hear it constantly: one neighbor hasn't paid PG&E in years, while another installed solar
          and is still getting $300+ bills. The difference almost always comes down to three things.
        </p>

        {/* Issue cards */}
        {[
          {
            num: "01",
            title: "The rules changed — most people don't know how",
            body: "In April 2023, California switched to NEM 3.0. Under the old rules, PG&E credited solar exports at near-retail rates. Under the new rules, that credit dropped by about 75%. If your system was designed before this change — or designed without accounting for it — the math doesn't work anymore.",
          },
          {
            num: "02",
            title: "Battery storage is now mandatory for the economics to work",
            body: "Under NEM 3.0, a solar-only system sends power to PG&E during the day for 5–8 cents and buys it back at 40+ cents during evening peak hours. Battery storage lets you keep your own power and use it when PG&E charges the most. Without it, you're subsidizing the grid instead of saving money.",
          },
          {
            num: "03",
            title: "Most systems were designed by salespeople, not engineers",
            body: "The most common problem we see: systems that are undersized because the installer quoted the cheapest option to win the deal. Not enough panels to cover actual usage. Not enough battery to get through peak hours. The homeowner doesn't find out until their first true-up bill arrives — a year too late.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`fade-up fade-up-d${i + 1}`}
            style={{
              background: C.darkCard, borderRadius: 14, padding: "24px 24px", marginBottom: 16,
              border: `1px solid ${C.darkMid}`, borderLeft: `3px solid ${C.gold}`,
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.gold,
                opacity: .4, lineHeight: 1, minWidth: 32,
              }}>{item.num}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 14, color: C.offWhite, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="fade-up fade-up-d4" style={{
          background: `linear-gradient(135deg, ${C.tealDeep}cc, ${C.darkCard})`,
          borderRadius: 14, padding: "24px", marginTop: 28, marginBottom: 32,
          border: `1px solid ${C.teal}33`,
        }}>
          <p style={{ fontSize: 15, color: C.offWhite, lineHeight: 1.8, fontStyle: "italic" }}>
            "The difference between a good and bad solar experience isn't solar itself —
            it's whether the system was designed to actually solve your problem,
            or designed to close a sale."
          </p>
        </div>

        <button
          onClick={() => setStep(4)}
          style={{
            width: "100%", padding: "18px 24px", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: C.dark, border: "none",
            borderRadius: 10, cursor: "pointer", letterSpacing: ".5px",
          }}
        >See What A Properly Designed System Looks Like →</button>
      </div>
    </Shell>
  );

  /* ════════════════════════════════════════════════════════
     STEP 4 — LEAD CAPTURE
  ════════════════════════════════════════════════════════ */
  if (step === 4) return (
    <Shell>
      <div className="fade-up">
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "3px", color: C.teal, textTransform: "uppercase", marginBottom: 16 }}>
          STEP 3 OF 3
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, lineHeight: 1.2, marginBottom: 16 }}>
          Get your personalized numbers.
        </h2>
        <p style={{ fontSize: 15, color: C.offWhite, lineHeight: 1.8, marginBottom: 12 }}>
          We'll analyze your specific situation — your roof, your usage, your PG&E rate plan — and show you
          what a properly designed solar + battery system would actually cost month-to-month vs. what you're paying now.
        </p>

        <div style={{
          background: C.darkCard, borderRadius: 14, padding: "24px", marginBottom: 28,
          border: `1px solid ${C.darkMid}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.teal, marginBottom: 16 }}>WHAT YOU'LL GET:</div>
          {[
            "System sized to your actual annual usage — not the cheapest quote",
            "Battery capacity calculated for PG&E peak hours (4–9 PM)",
            "Locked-in monthly payment comparison vs. your PG&E trajectory",
            "No true-up surprises — your payment is predictable from day one",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.teal, fontSize: 16, lineHeight: "22px" }}>✓</span>
              <span style={{ fontSize: 14, color: C.offWhite, lineHeight: "22px" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {[
            { key: "name", label: "Full name", type: "text", placeholder: "Your name" },
            { key: "email", label: "Email", type: "email", placeholder: "you@email.com" },
            { key: "phone", label: "Phone", type: "tel", placeholder: "(559) 000-0000" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, color: C.textMid, marginBottom: 6, fontWeight: 600, letterSpacing: ".5px" }}>
                {f.label.toUpperCase()}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: undefined })); }}
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 15, fontFamily: "'Outfit', sans-serif",
                  background: C.darkCard, border: `1px solid ${errors[f.key] ? C.red : C.darkMid}`,
                  borderRadius: 10, color: C.white,
                }}
              />
              {errors[f.key] && <span style={{ fontSize: 12, color: C.red, marginTop: 4, display: "block" }}>{errors[f.key]}</span>}
            </div>
          ))}
        </div>

        {/* TCPA consent */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 24 }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => {
              setConsent(e.target.checked);
              setConsentTimestamp(e.target.checked ? new Date().toISOString() : null);
              if (e.target.checked) setErrors(p => ({ ...p, consent: undefined }));
            }}
            style={{ marginTop: 3, accentColor: C.teal, width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>
            By checking this box and clicking &quot;Get My Free Personalized Report,&quot; I provide my prior express written
            consent to allow Awen Energy LLC to contact me at the phone number I provided above, including by automated
            telephone dialing system, prerecorded voice, or artificial voice message, and by text message (SMS/MMS), for
            marketing purposes regarding solar energy products and services. I understand that my consent is not a condition
            of purchasing any goods or services. Message and data rates may apply. I may revoke my consent at any time.
            <br />
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.teal }}>Privacy Policy</a>
            {" · "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: C.teal }}>Terms of Service</a>
          </span>
        </div>
        {errors.consent && <span style={{ fontSize: 12, color: C.red, display: "block", marginBottom: 16, marginTop: -16 }}>{errors.consent}</span>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%", padding: "18px 24px", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
            background: submitting ? C.textMid : `linear-gradient(135deg, ${C.gold}, ${C.goldDk})`,
            color: C.dark, border: "none", borderRadius: 10, cursor: submitting ? "wait" : "pointer",
            letterSpacing: ".5px",
          }}
        >
          {submitting ? "Submitting..." : "Get My Free Personalized Report →"}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textMid, marginTop: 12 }}>
          No spam. No obligation. Just your numbers.
        </p>
      </div>
    </Shell>
  );

  /* ════════════════════════════════════════════════════════
     STEP 5 — THANK YOU
  ════════════════════════════════════════════════════════ */
  if (step === 5) return (
    <Shell>
      <div className="fade-up" style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: `${C.teal}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", border: `2px solid ${C.teal}`,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, marginBottom: 16 }}>
          You're all set, {form.name.split(" ")[0] || "there"}.
        </h2>
        <p style={{ fontSize: 16, color: C.offWhite, lineHeight: 1.7, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
          We're preparing your personalized PG&E cost comparison now. A booking page is opening so
          you can pick a 15-minute window to walk through your numbers with someone who actually
          understands system design — not a sales script.
        </p>
        <p style={{ fontSize: 14, color: C.textMid, marginBottom: 32 }}>
          If the booking page didn't open,{" "}
          <a href="https://www.calendly.com/sustainablelifebydesign" target="_blank" rel="noopener noreferrer" style={{ color: C.teal }}>
            click here
          </a>.
        </p>

        <div style={{
          background: C.darkCard, borderRadius: 14, padding: "24px", maxWidth: 400, margin: "0 auto",
          border: `1px solid ${C.darkMid}`,
        }}>
          <div style={{ fontSize: 12, color: C.teal, letterSpacing: "1px", fontWeight: 600, marginBottom: 12 }}>YOUR SNAPSHOT</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid }}>Current PG&E (monthly)</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.redSoft }}>{fmt(monthly)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid }}>Projected 25-yr PG&E cost</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.redSoft }}>{fmt(cost25yr)}</span>
          </div>
          <div style={{ height: 1, background: C.darkMid, margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid }}>Est. locked rate (monthly)</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>~{fmt(locked)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.textMid }}>Potential 25-yr savings</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{fmt(savings25)}</span>
          </div>
        </div>
      </div>
    </Shell>
  );

  return <Shell><p>Loading...</p></Shell>;
}
