import { ENERGY_COMMUNITY_ZIPS } from "./constants.js";

/* ── Input sanitizer ──────────────────────────────────────── */
export function sanitize(str) {
  return String(str || "").replace(/[<>"'&]/g, "").trim().slice(0, 500);
}

/* ── Claude prompt builder ────────────────────────────────── */
function buildPrompt({ zipCode, monthlyBill, squareFootage, homeAge, solarStatus, frustrations }) {
  const inEC = ENERGY_COMMUNITY_ZIPS.has(sanitize(zipCode).trim());
  const frustrationsStr = (Array.isArray(frustrations) ? frustrations : []).map(f => sanitize(f)).join("; ");
  const bill = Math.max(1, Math.min(9999, Number(monthlyBill) || 260));
  const lockedLow  = Math.round(bill * 0.70);
  const lockedHigh = Math.round(bill * 0.75);

  return `You are an energy cost analyst writing a personalized PG&E electricity report for a homeowner in Fresno / San Joaquin Valley, California.

HOMEOWNER INPUTS:
- Zip code: ${sanitize(zipCode)}
- Average summer PG&E bill: $${bill}/month
- Home size: ${sanitize(squareFootage)}
- Home age: ${sanitize(homeAge)}
- Current solar status: ${sanitize(solarStatus)}
- Primary frustrations: ${frustrationsStr}

REFERENCE DATA:
- PG&E average residential rate (2026): ~$0.41/kWh for bundled customers
- PG&E base service charge: $24/month starting March 2026
- PG&E historical rate increase: averaging 6.5% annually over last 5 years
- Fresno average: $3,123/year — highest electricity cost of any US city
- PG&E approved 6 rate hikes in 2024; additional increases proposed through 2030
- NEM 3.0 (effective April 2023): reduced solar export credits by ~75%
- Under NEM 3.0, solar-only systems (without battery) are significantly less financially effective
- Battery attachment rates jumped from 11% to nearly 70% post-NEM 3.0
- Federal 30% residential solar tax credit expired Dec 31, 2025
- In 2026, only lease/PPA structures can access the federal tax credit (Section 48E)
- Energy community designation can add +10% to the tax credit (total up to 40%)
- Common problems: systems undersized by salespeople, not enough battery for peak hours (4–9 PM), true-up surprises
- Properly sized solar + battery with correct financing can lock in monthly payment ~25–30% below current PG&E bill

ENERGY COMMUNITY STATUS FOR THIS HOMEOWNER:
${inEC
    ? `Zip code ${sanitize(zipCode)} IS in the IRS-designated energy community list. Mention this specifically — it means enhanced financing terms can be passed through.`
    : `Zip code ${sanitize(zipCode)} is NOT on the confirmed energy community list. Note that nearby areas may qualify and it's worth a quick check, without overpromising.`
}

WRITING INSTRUCTIONS:
Write a 4-section personalized report. Tone: direct, empathetic, data-driven. Like a smart neighbor who happens to be an energy analyst — not a salesperson. Use second person ("you"/"your"). Reference their specific inputs naturally throughout.

SECTION 1: ## Your PG&E Reality
- Calculate projected annual cost for years 1, 5, 10, and 25 at 6.5% annual increases
- Calculate total 25-year projected spend
- Reference Fresno context (extreme heat, AC as survival, highest electricity cost city in the US)
- If bill is above $300, acknowledge this is significantly above average
- If home is pre-2000, mention older insulation and windows amplify the problem
- Mention the $24/month base service charge that hits everyone regardless of usage

SECTION 2: ## Why Solar Works For Some Fresno Homeowners And Not Others
- Explain NEM 2.0 vs NEM 3.0 split — why neighbors who installed before April 2023 are happy
- Explain why battery is now mandatory (75% export credit reduction, peak hour economics)
- Address the undersizing problem — salespeople designing to win on price, not cover actual usage
- If frustrations include "I have solar but it's not saving what I was told" — address directly
- If frustrations include "I've looked into solar but it's confusing" — validate the confusion
- If frustrations include "The grid feels unreliable" — mention battery provides backup power

SECTION 3: ## What A Properly Designed System Would Look Like For Your Home
- Based on $${bill}/month and ${sanitize(squareFootage)}, estimate rough system size (kW panels, kWh battery)
- Estimate locked monthly payment range (~$${lockedLow}–$${lockedHigh}/month)
- Contrast: PG&E bill goes up every year vs. locked payment stays flat for 25 years
- Mention they own the equipment from day one
${inEC ? "- Mention the energy community designation benefit passes through the financing structure" : ""}
- DO NOT name specific products, companies, or brands
- Use "estimated" and "projected" language throughout

SECTION 4: ## What Happens Next
- Frame as: run actual numbers on their specific roof, usage pattern, and rate plan
- 15-minute conversation with someone who designs based on engineering, not sales quotas
- No obligation, no commitment — just their real numbers
- Make them WANT to talk, not feel pressured

FORMAT:
- Use ## headers exactly as shown above
- Bold key numbers with **text**
- Short paragraphs (2–3 sentences max)
- Total length: 650–900 words
- End with one forward-motion sentence (no exclamation marks)`;
}

/* ── Claude API caller (via server-side Vercel function) ────── */
export async function generateReport(inputs) {
  const prompt = buildPrompt(inputs);

  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`Report generation failed (${res.status})`);
  }

  const data = await res.json();
  return data.report;
}

/* ── Supabase lead submission ─────────────────────────────── */
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || "";

export async function submitLead(payload) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await fetch(`${SB_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey:        SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        Prefer:        "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail — do not surface errors to user
  }
}
