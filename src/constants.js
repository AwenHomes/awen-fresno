/* ── Design tokens — dark editorial theme ─────────────────── */
export const D = {
  bg:          "#0a1a19",
  card:        "#0f2625",
  cardAlt:     "#132e2b",
  border:      "#1e3d3a",
  borderLight: "#2a5450",
  teal:        "#2BBFB3",
  tealBright:  "#3dd9cc",
  tealDim:     "#1d8880",
  gold:        "#F5A623",
  goldDim:     "#c8861a",
  red:         "#ff6b6b",
  redDim:      "#cc4444",
  redBg:       "#2a0f0f",
  text:        "#e2f0ef",
  textSub:     "#8ab5b1",
  textMuted:   "#5a8885",
  white:       "#ffffff",
};

/* ── Energy community zip codes (IRS-designated, Fresno/SJV) ─ */
export const ENERGY_COMMUNITY_ZIPS = new Set([
  "93650","93611","93612","93619","93720","93722","93723","93725",
  "93726","93727","93728","93702","93703","93704","93705","93706",
  "93710","93711","93721","93730","93741","93657","93631","93662",
  "93648","93609","93640","93660","93230","93234","93242","93266",
]);

/* ── PG&E cost math ────────────────────────────────────────── */
const PGE_INCREASE = 0.065;

export function annualCost(monthly, yearsFromNow) {
  return monthly * 12 * Math.pow(1 + PGE_INCREASE, yearsFromNow);
}

export function cumulativeCost(monthly, years) {
  let total = 0;
  for (let y = 0; y < years; y++) total += annualCost(monthly, y);
  return total;
}

export function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ── Form option lists ─────────────────────────────────────── */
export const SQ_FT_OPTS = [
  "Under 1,200 sq ft",
  "1,200–1,800 sq ft",
  "1,800–2,400 sq ft",
  "2,400–3,200 sq ft",
  "3,200+ sq ft",
];

export const HOME_AGE_OPTS = [
  "Built before 1980",
  "1980–2000",
  "2000–2015",
  "After 2015",
];

export const SOLAR_OPTS = [
  "No solar",
  "Yes — with battery",
  "Yes — without battery",
  "Considering it",
];

export const FRUSTRATION_OPTS = [
  "The cost keeps going up",
  "I can't stay comfortable without a huge bill",
  "I've looked into solar but it's confusing",
  "I have solar but it's not saving what I was told",
  "I just want predictable bills",
  "The grid feels unreliable",
];

export const CALENDLY_URL = "https://calendly.com/awenenergy";
