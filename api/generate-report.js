import { validateInputs, buildPrompt } from "./_shared.js";

export default async function handler(req, res) {
  try {
    // CORS — allow all origins for now (tighten later)
    const origin = req.headers.origin || "";
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

    // Validate inputs
    const { inputs } = req.body || {};
    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }

    // Build prompt server-side
    const prompt = buildPrompt(inputs);

    // Check API key — accept either name (VITE_ prefix was used in older setup)
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Anthropic API key not found. Please set ANTHROPIC_API_KEY in Vercel environment variables." });
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      return res.status(502).json({
        error: `Anthropic API returned ${response.status}`,
        details: [errBody.slice(0, 300)],
      });
    }

    const data = await response.json();
    const report = data.content?.[0]?.text || "";
    return res.status(200).json({ report });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: [err.message || "Unknown error"],
    });
  }
}
