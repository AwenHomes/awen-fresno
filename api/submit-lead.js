// Vercel Serverless Function — Lead Submission with Validation
// ─────────────────────────────────────────────────────────────
// Validates lead data server-side before inserting into Supabase.
// Rate-limited to prevent spam submissions.
//
// SETUP:
//   1. SUPABASE_URL — Vercel env var (no VITE_ prefix, server-side only)
//   2. SUPABASE_SERVICE_KEY — Vercel env var (service role key for server-side inserts)
//   3. UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — for rate limiting

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { validateLeadPayload, sanitize } from "./_shared.js";

/* ── Rate limiter (3 lead submissions per 10 minutes per IP) ─ */
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    analytics: true,
    prefix: "awen:lead",
  });
}

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

export default async function handler(req, res) {
  // CORS
  if (ALLOWED_ORIGIN) {
    const origin = req.headers.origin || "";
    if (origin && origin !== ALLOWED_ORIGIN) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Rate limiting ──────────────────────────────────────────
  if (ratelimit) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers["x-real-ip"]
      || "unknown";
    const { success, remaining, reset } = await ratelimit.limit(ip);

    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(reset));

    if (!success) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }
  }

  // ── Validate payload ───────────────────────────────────────
  const payload = req.body || {};
  const errors = validateLeadPayload(payload);

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // ── Sanitize and build clean lead record ───────────────────
  const lead = {
    name:                sanitize(payload.name),
    email:               sanitize(payload.email).toLowerCase(),
    phone:               sanitize(payload.phone),
    state:               "California",
    city:                "Fresno",
    zip_code:            sanitize(payload.zip_code),
    monthly_bill:        Math.max(1, Math.min(9999, Number(payload.monthly_bill) || 0)),
    home_sqft:           sanitize(payload.home_sqft),
    home_age:            sanitize(payload.home_age),
    solar_status:        sanitize(payload.solar_status),
    frustrations:        sanitize(payload.frustrations),
    consent_methods:     sanitize(payload.consent_methods),
    consented_at:        new Date().toISOString(), // Server-generated timestamp
    consent_text:        sanitize(payload.consent_text).slice(0, 1000),
    consent_url:         sanitize(payload.consent_url).slice(0, 500),
    user_agent:          sanitize(payload.user_agent).slice(0, 500),
    source:              "fresno-ai-report",
    ai_report_generated: Boolean(payload.ai_report_generated),
  };

  // ── Insert into Supabase ───────────────────────────────────
  const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  if (!sbUrl || !sbKey) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const sbRes = await fetch(`${sbUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });

    if (!sbRes.ok) {
      return res.status(502).json({ error: "Failed to save lead" });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: "Failed to save lead" });
  }
}
