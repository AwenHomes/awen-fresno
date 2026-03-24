// Shared validation and prompt-building for Vercel serverless functions.
// Mirrors the energy community data and prompt logic from the client,
// but runs server-side where it can't be tampered with.

/* ── Energy community zip codes (IRS-designated, Fresno/SJV) ─ */
export const ENERGY_COMMUNITY_ZIPS = new Set([
  "93650","93611","93612","93619","93720","93722","93723","93725",
  "93726","93727","93728","93702","93703","93704","93705","93706",
  "93710","93711","93721","93730","93741","93657","93631","93662",
  "93648","93609","93640","93660","93230","93234","93242","93266",
]);

/* ── Allowed values for select fields ─────────────────────── */
export const VALID_SQ_FT = new Set([
  "Under 1,200 sq ft", "1,200–1,800 sq ft", "1,800–2,400 sq ft",
  "2,400–3,200 sq ft", "3,200+ sq ft",
]);
export const VALID_HOME_AGE = new Set([
  "Built before 1980", "1980–2000", "2000–2015", "After 2015",
]);
export const VALID_SOLAR = new Set([
  "No solar", "Yes — with battery", "Yes — without battery", "Considering it",
]);
export const VALID_FRUSTRATIONS = new Set([
  "The cost keeps going up",
  "I can't stay comfortable without a huge bill",
  "I've looked into solar but it's confusing",
  "I have solar but it's not saving what I was told",
  "I just want predictable bills",
  "The grid feels unreliable",
]);

/* ── Server-side sanitizer ────────────────────────────────── */
export function sanitize(str) {
  return String(str || "").replace(/[<>"'&]/g, "").trim().slice(0, 500);
}

/* ── Input validation ─────────────────────────────────────── */
export function validateInputs(inputs) {
  const errors = [];
  if (!inputs || typeof inputs !== "object") return ["Invalid request body"];

  const { zipCode, monthlyBill, squareFootage, homeAge, solarStatus, frustrations } = inputs;

  if (!zipCode || !/^\d{5}$/.test(String(zipCode).trim()))
    errors.push("Invalid zip code");

  const bill = Number(monthlyBill);
  if (!monthlyBill || isNaN(bill) || bill < 1 || bill > 9999)
    errors.push("Monthly bill must be between $1 and $9,999");

  if (!VALID_SQ_FT.has(squareFootage))
    errors.push("Invalid home size selection");

  if (!VALID_HOME_AGE.has(homeAge))
    errors.push("Invalid home age selection");

  if (!VALID_SOLAR.has(solarStatus))
    errors.push("Invalid solar status selection");

  if (!Array.isArray(frustrations) || frustrations.length === 0 || frustrations.length > 6)
    errors.push("Select 1–6 frustrations");

  if (Array.isArray(frustrations) && frustrations.some(f => !VALID_FRUSTRATIONS.has(f)))
    errors.push("Invalid frustration selection");

  return errors;
}

/* ── Server-side prompt builder ───────────────────────────── */
export function buildPrompt({ zipCode, monthlyBill, squareFootage, homeAge, solarStatus, frustrations }) {
  const zip = sanitize(zipCode).trim();
  const inEC = ENERGY_COMMUNITY_ZIPS.has(zip);
  const frustrationsStr = frustrations.map(f => sanitize(f)).join("; ");
  const bill = Math.max(1, Math.min(9999, Number(monthlyBill) || 260));
  const lockedLow  = Math.round(bill * 0.70);
  const lockedHigh = Math.round(bill * 0.75);

  return `You are an energy cost analyst writing a personalized PG&E electricity report for a homeowner in Fresno / San Joaquin Valley, California.

HOMEOWNER INPUTS:
- Zip code: ${zip}
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
    ? `Zip code ${zip} IS in the IRS-designated energy community list. Mention this specifically — it means enhanced financing terms can be passed through.`
    : `Zip code ${zip} is NOT on the confirmed energy community list. Note that nearby areas may qualify and it's worth a quick check, without overpromising.`
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

/* ── Lead payload validation ──────────────────────────────── */
export function validateLeadPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") return ["Invalid request body"];

  const { name, email, phone, consent_methods } = payload;

  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 200)
    errors.push("Name must be 2–200 characters");

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push("Invalid email address");

  if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 10)
    errors.push("Phone must have at least 10 digits");

  if (!consent_methods || typeof consent_methods !== "string" || consent_methods.trim().length === 0)
    errors.push("At least one consent method is required");

  // Validate consent_methods only contains allowed values
  const allowed = new Set(["call", "text", "email"]);
  const methods = consent_methods ? consent_methods.split(",").map(m => m.trim()) : [];
  if (methods.some(m => !allowed.has(m)))
    errors.push("Invalid consent method");

  return errors;
}
