/* ── Input sanitizer (client-side, defense-in-depth) ──────── */
export function sanitize(str) {
  return String(str || "").replace(/[<>"'&]/g, "").trim().slice(0, 500);
}

/* ── Claude report generator (via server-side Vercel function) ─
   Sends structured inputs to the server, which validates them,
   builds the prompt server-side, and calls the Anthropic API.
   The prompt is never built or sent from the browser.
──────────────────────────────────────────────────────────────── */
export async function generateReport(inputs) {
  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs }),
  });

  if (res.status === 429) {
    throw new Error("You've generated several reports recently. Please wait a few minutes and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail = data.details ? ` (${data.details.join(", ")})` : "";
    throw new Error((data.error || `Report generation failed (${res.status})`) + detail);
  }

  const data = await res.json();
  return data.report;
}

/* ── Lead submission (via server-side Vercel function) ─────── */
export async function submitLead(payload) {
  try {
    const res = await fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      // Silently handle rate limit — lead form still proceeds
      return;
    }

    // Silent fail for other errors — don't block the user flow
  } catch {
    // Network error — silent fail
  }
}
