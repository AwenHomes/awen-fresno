import { promises as dns } from "node:dns";
import { validateLeadPayload, sanitize } from "./_shared.js";
import { getLeadLimiter, applyRateLimit } from "./_ratelimit.js";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://report.awenenergy.com";

export default async function handler(req, res) {
  try {
    // CORS — locked to allowed origin
    const origin = req.headers.origin || "";
    if (origin === ALLOWED_ORIGIN) {
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

    // Rate limiting (3 submissions per 10 min per IP)
    const blocked = await applyRateLimit(req, res, getLeadLimiter());
    if (blocked) return;

    // Validate payload
    const payload = req.body || {};
    const errors = validateLeadPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // MX record check — does the email domain actually accept mail?
    const emailDomain = payload.email.trim().split("@")[1];
    try {
      const mx = await dns.resolveMx(emailDomain);
      if (!mx || mx.length === 0) {
        return res.status(400).json({ error: "Validation failed", details: ["This email domain does not accept mail"] });
      }
    } catch {
      return res.status(400).json({ error: "Validation failed", details: ["This email domain does not appear to exist"] });
    }

    // Build clean lead record
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
      consented_at:        new Date().toISOString(),
      consent_text:        sanitize(payload.consent_text).slice(0, 1000),
      consent_url:         sanitize(payload.consent_url).slice(0, 500),
      user_agent:          sanitize(payload.user_agent).slice(0, 500),
      source:              "fresno-ai-report",
      ai_report_generated: Boolean(payload.ai_report_generated),
    };

    // Insert into Supabase
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;
    if (!sbUrl || !sbKey) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }

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

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: [err.message || "Unknown error"],
    });
  }
}
