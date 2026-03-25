// Diagnostic endpoint — visit /api/health in your browser to check what's working.

export default async function handler(req, res) {
  const checks = {};

  // 1. Is the Anthropic API key set?
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  const apiKeySource = process.env.ANTHROPIC_API_KEY ? "ANTHROPIC_API_KEY" : process.env.VITE_ANTHROPIC_API_KEY ? "VITE_ANTHROPIC_API_KEY" : null;
  checks.ANTHROPIC_API_KEY = apiKey
    ? `SET via ${apiKeySource} (starts with "${apiKey.slice(0, 7)}...")`
    : "MISSING — add ANTHROPIC_API_KEY to Vercel environment variables";

  // 2. Can we reach the Anthropic API?
  try {
    const testRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "missing",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16,
        messages: [{ role: "user", content: "Say OK" }],
      }),
    });

    if (testRes.ok) {
      checks.ANTHROPIC_API_TEST = "SUCCESS — API key works and model is valid";
    } else {
      const errText = await testRes.text().catch(() => "");
      checks.ANTHROPIC_API_TEST = `FAILED (status ${testRes.status}) — ${errText.slice(0, 300)}`;
    }
  } catch (err) {
    checks.ANTHROPIC_API_TEST = `NETWORK ERROR — ${err.message}`;
  }

  // 3. Supabase configured?
  const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;
  checks.SUPABASE_URL = sbUrl ? "SET" : "MISSING";
  checks.SUPABASE_KEY = sbKey ? "SET" : "MISSING";

  // 4. Upstash configured?
  checks.UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET (rate limiting disabled — this is OK)";
  checks.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ? "SET" : "NOT SET (rate limiting disabled — this is OK)";

  // 5. ALLOWED_ORIGIN
  checks.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "NOT SET (all origins allowed — this is OK for now)";

  // 6. Deploy version marker
  checks.DEPLOY_TIMESTAMP = new Date().toISOString();

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    status: "Health check complete — review each item below",
    checks,
  });
}
