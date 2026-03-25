// Vercel Serverless Function — Claude AI Report Generator
// ─────────────────────────────────────────────────────────
// Accepts structured homeowner inputs, validates them server-side,
// builds the prompt server-side (preventing prompt injection),
// and calls the Anthropic API with the key that never leaves the server.

import { validateInputs, buildPrompt } from "./_shared.js";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "")
  .split(",").map(s => s.trim()).filter(Boolean);

function isOriginAllowed(origin) {
  if (!ALLOWED_ORIGINS.length) return true;
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

/* ── Lazy-load rate limiter (avoids crash if packages unavailable) ── */
let _ratelimit = undefined; // undefined = not yet initialized
async function getRatelimit() {
  if (_ratelimit !== undefined) return _ratelimit;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    _ratelimit = null;
    return null;
  }
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "awen:report",
    });
  } catch {
    _ratelimit = null; // Rate limiting unavailable — continue without it
  }
  return _ratelimit;
}

export default async function handler(req, res) {
  // Top-level try/catch so we always return JSON, never an HTML crash page
  try {
    // CORS
    const origin = req.headers.origin || "";
    if (!isOriginAllowed(origin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
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
    const ratelimit = await getRatelimit();
    if (ratelimit) {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
        || req.headers["x-real-ip"]
        || "unknown";
      const { success, remaining, reset } = await ratelimit.limit(ip);
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String(reset));
      if (!success) {
        return res.status(429).json({
          error: "Too many requests. Please wait a few minutes before generating another report.",
        });
      }
    }

    // ── Input validation ───────────────────────────────────────
    const { inputs } = req.body || {};
    const validationErrors = validateInputs(inputs);

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }

    // ── Build prompt server-side ───────────────────────────────
    const prompt = buildPrompt(inputs);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel environment variables" });
    }

    // ── Call Anthropic API ─────────────────────────────────────
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      return res.status(502).json({
        error: `Anthropic API returned ${response.status}`,
        details: [errBody.slice(0, 200)],
      });
    }

    const data = await response.json();
    const report = data.content?.[0]?.text || "";

    return res.status(200).json({ report });

  } catch (err) {
    // Catch-all: return JSON with the actual error so the client can display it
    return res.status(500).json({
      error: "Internal server error",
      details: [err.message || "Unknown error"],
    });
  }
}
