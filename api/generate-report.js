// Vercel Serverless Function — Claude AI Report Generator
// ─────────────────────────────────────────────────────────
// This function keeps the Anthropic API key server-side so it is
// never exposed in the browser bundle.
//
// SETUP:
//   1. Add ANTHROPIC_API_KEY to Vercel project environment variables
//      (Settings → Environment Variables). Do NOT use the VITE_ prefix.
//   2. Remove VITE_ANTHROPIC_API_KEY from .env / Vercel if present.

const MAX_PROMPT_LENGTH = 8000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

export default async function handler(req, res) {
  // CORS: restrict to our own domain in production
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

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  // Reject prompts that are too long (possible abuse)
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Prompt exceeds maximum length" });
  }

  // Basic content validation: prompt must contain expected markers from buildPrompt()
  if (!prompt.includes("HOMEOWNER INPUTS:") || !prompt.includes("WRITING INSTRUCTIONS:")) {
    return res.status(400).json({ error: "Invalid prompt format" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

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
