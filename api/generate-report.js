// Vercel Serverless Function — Claude AI Report Generator
// ─────────────────────────────────────────────────────────
// Accepts structured homeowner inputs, validates them server-side,
// builds the prompt server-side (preventing prompt injection),
// and calls the Anthropic API with the key that never leaves the server.
//
// Rate limiting via Upstash Redis prevents abuse / credit burn.
//
// SETUP:
//   1. ANTHROPIC_API_KEY — Vercel env var (required)
//   2. UPSTASH_REDIS_REST_URL — from Upstash dashboard (required for rate limiting)
//   3. UPSTASH_REDIS_REST_TOKEN — from Upstash dashboard (required for rate limiting)
//   4. ALLOWED_ORIGIN — e.g. https://report.awenenergy.com (optional, recommended)

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { validateInputs, buildPrompt } from "./_shared.js";

/* ── Rate limiter (5 requests per 10 minutes per IP) ──────── */
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
    prefix: "awen:report",
  });
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "")
  .split(",").map(s => s.trim()).filter(Boolean);

function isOriginAllowed(origin) {
  if (!ALLOWED_ORIGINS.length) return true; // No restriction configured
  if (!origin) return true; // Same-origin requests (no Origin header)
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

export default async function handler(req, res) {
  // CORS: restrict to configured domains in production
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
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  // ── Call Anthropic API ─────────────────────────────────────
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const report = data.content?.[0]?.text || "";

    return res.status(200).json({ report });
  } catch {
    return res.status(502).json({ error: "Failed to generate report" });
  }
}
