// Vercel Serverless Function — Claude AI Report Generator
// ─────────────────────────────────────────────────────────
// This function moves the Claude API call server-side so the API key
// is never exposed in the browser bundle.
//
// SETUP:
//   1. Add ANTHROPIC_API_KEY to your Vercel project environment variables
//      (Settings → Environment Variables). Do NOT use the VITE_ prefix here.
//   2. Update the client-side generateReport() in src/App.jsx to call
//      /api/generate-report instead of https://api.anthropic.com/v1/messages
//
// Once wired up, remove VITE_ANTHROPIC_API_KEY from .env / Vercel and
// delete the direct browser API call in App.jsx.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: missing API key" });
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
      const errText = await response.text();
      console.error(`Claude API error ${response.status}:`, errText);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const report = data.content?.[0]?.text || "";

    return res.status(200).json({ report });
  } catch (err) {
    console.error("Claude API request failed:", err.message);
    return res.status(502).json({ error: "Failed to generate report" });
  }
}
