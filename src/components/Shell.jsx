import { D } from "../constants.js";

/* ── Logo mark ────────────────────────────────────────────── */
export function LogoMark({ size = 1 }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
      <div style={{ position: "relative", display: "inline-block", paddingTop: 8 * size }}>
        <div style={{ position: "absolute", top: 0, left: Math.round(5 * size), display: "flex", gap: Math.round(5 * size) }}>
          <div style={{ width: Math.round(4 * size), height: Math.round(4 * size), borderRadius: "50%", background: D.teal }} />
          <div style={{ width: Math.round(4 * size), height: Math.round(4 * size), borderRadius: "50%", background: D.teal }} />
        </div>
        <span style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: Math.round(30 * size), fontWeight: 700,
          color: D.teal, lineHeight: 1, letterSpacing: "-0.5px", display: "block",
        }}>Awen</span>
      </div>
      <span style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: Math.round(9.5 * size), fontWeight: 800,
        color: D.gold, letterSpacing: `${Math.round(3.5 * size)}px`,
        textTransform: "uppercase", marginTop: Math.round(2 * size), display: "block",
      }}>ENERGY</span>
    </div>
  );
}

/* ── Global CSS injected once ─────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${D.bg}; margin: 0; -webkit-font-smoothing: antialiased; }
  input, textarea, select { font-family: 'Outfit', sans-serif; }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${D.teal} !important;
    box-shadow: 0 0 0 3px ${D.teal}33 !important;
  }
  ::selection { background: ${D.teal}; color: #fff; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up      { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) forwards; }
  .fade-d1      { animation-delay: .10s; opacity: 0; }
  .fade-d2      { animation-delay: .20s; opacity: 0; }
  .fade-d3      { animation-delay: .30s; opacity: 0; }
  .fade-d4      { animation-delay: .40s; opacity: 0; }
  .btn-primary  { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; }
  .btn-primary:hover { transform: translateY(-2px); }
  .opt-btn      { transition: background .15s ease, border-color .15s ease, color .15s ease; }
  a { color: ${D.teal}; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${D.bg}; }
  ::-webkit-scrollbar-thumb { background: ${D.border}; border-radius: 3px; }
`;

/* ── Main page shell ──────────────────────────────────────── */
export function Shell({ topRef, children }) {
  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.text, fontFamily: "'Outfit', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&family=Dancing+Script:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{GLOBAL_CSS}</style>
      <div ref={topRef} style={{ position: "absolute", top: 0 }} />

      <nav style={{
        padding: "13px 24px", display: "flex", alignItems: "center",
        background: D.card, borderBottom: `1px solid ${D.border}`,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,.5)",
      }}>
        <a href="/" style={{ textDecoration: "none" }}><LogoMark size={0.85} /></a>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: D.textMuted, letterSpacing: "1.2px", fontWeight: 600, textTransform: "uppercase" }}>
          Fresno · San Joaquin Valley
        </span>
      </nav>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "44px 20px 100px" }}>
        {children}
      </main>

      <footer style={{ background: D.card, borderTop: `1px solid ${D.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { href: "/privacy",    label: "Privacy Policy" },
            { href: "/terms",      label: "Terms of Service" },
            { href: "/do-not-sell",label: "Do Not Sell or Share My Personal Information" },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{ fontSize: 11, color: D.textSub, textDecoration: "none", fontWeight: 500 }}>{label}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: D.textMuted, lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
          © {new Date().getFullYear()} Awen Energy LLC. Projections are estimates based on publicly available PG&E
          rate data and historical rate increase trends. Actual future rates may vary. This tool is for educational
          purposes and does not constitute financial advice. Solar savings depend on system size, design, orientation,
          usage, and financing terms.
        </p>
      </footer>
    </div>
  );
}

/* ── Legal page shell ─────────────────────────────────────── */
export function LegalShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.text, fontFamily: "'Outfit', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&family=Dancing+Script:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${D.bg}; margin: 0; -webkit-font-smoothing: antialiased; } a { color: ${D.teal}; }`}</style>

      <nav style={{ padding: "13px 24px", display: "flex", alignItems: "center", background: D.card, borderBottom: `1px solid ${D.border}` }}>
        <a href="/" style={{ textDecoration: "none" }}><LogoMark size={0.85} /></a>
      </nav>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "44px 20px 80px" }}>
        <a href="/" style={{ fontSize: 13, color: D.textSub, textDecoration: "none", display: "inline-block", marginBottom: 28 }}>← Back to report</a>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 5vw, 34px)", marginBottom: 32, color: D.white }}>{title}</h1>
        <div style={{ fontSize: 14, color: D.textSub, lineHeight: 1.85 }}>{children}</div>
      </main>

      <footer style={{ background: D.card, borderTop: `1px solid ${D.border}`, padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: D.textMuted }}>© {new Date().getFullYear()} Awen Energy LLC</p>
      </footer>
    </div>
  );
}
