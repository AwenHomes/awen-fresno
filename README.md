# Awen Energy — AI-Powered PG&E Reality Report

AI-generated personalized energy report for Fresno / San Joaquin Valley homeowners. Uses Claude (Sonnet) to produce a 4-section narrative report tailored to the homeowner's zip code, bill, home details, and frustrations — before asking for contact info. Captures leads to Supabase + redirects to Calendly.

## Deploy to Vercel

### Option 1: GitHub → Vercel (Recommended)
1. Push this folder to a new GitHub repo (e.g. `awen-fresno`)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub
3. Add environment variables (see below)
4. Click **Deploy** — Vercel auto-detects Vite
5. Every `git push` auto-deploys going forward

### Option 2: Drag & Drop
1. Run `npm install && npm run build` locally
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Drag the `dist/` folder in
4. Live URL appears instantly

## Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**:

```
ANTHROPIC_API_KEY=<your Anthropic API key>
VITE_SUPABASE_URL=<your Supabase project URL>
VITE_SUPABASE_KEY=<your Supabase anon key>
```

Optionally, to restrict the API endpoint to your domain only:
```
ALLOWED_ORIGIN=https://report.awenenergy.com
```

See `.env.example` for a template. **Never commit real credentials to version control.**

> **Security note:** `ANTHROPIC_API_KEY` is used **server-side only** via the Vercel serverless function at `api/generate-report.js`. It is never exposed to the browser. Do NOT prefix it with `VITE_` — that would embed it in the client bundle.

If you skip Supabase setup, the app still works but leads won't be captured.

## Set Up Subdomain: report.awenenergy.com

### Step 1 — Add custom domain in Vercel
1. Go to your Vercel project → **Settings** → **Domains**
2. Type `report.awenenergy.com` and click **Add**
3. Vercel will show you a CNAME record to create

### Step 2 — Add DNS record in Squarespace
1. Log in to Squarespace → go to **Settings** → **Domains**
2. Click on `awenenergy.com` → **DNS Settings** (or **Advanced Settings**)
3. Click **Add Record** and create:
   - **Type**: CNAME
   - **Host / Name**: `report`
   - **Value / Points to**: `cname.vercel-dns.com.`
   - **TTL**: leave default (or 3600)
4. Save the record

### Step 3 — Verify in Vercel
1. Go back to Vercel → **Settings** → **Domains**
2. Vercel will detect the CNAME and verify automatically
3. SSL certificate is provisioned automatically (may take a few minutes)
4. `report.awenenergy.com` is now live

### Alternative: fresno.awenenergy.com
If you prefer `fresno.awenenergy.com`, just replace `report` with `fresno` in both Vercel and Squarespace DNS settings. This leaves `report.awenenergy.com` available for the broader AI data center tool later.

## Supabase Table Setup

### Fresh install — run this in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  phone text,
  state text,
  city text,
  monthly_bill numeric,
  source text,
  consented_at timestamptz,
  consent_text text,
  consent_url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow browser (anon key) to insert rows only
CREATE POLICY "Allow anon inserts" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);
```

### Existing table — run these migrations to add new columns:

```sql
-- New input fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_sqft text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_age text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS solar_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS frustrations text;

-- AI report tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_report_generated boolean DEFAULT false;

-- TCPA: which contact methods the homeowner consented to
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_methods text;
```

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # builds to /dist
npm run preview   # preview the build locally
```

## What's Included

```
src/
  constants.js              — Colors (D), energy community zips, PG&E math, form options
  api.js                    — Claude prompt builder, API caller, Supabase submitter
  App.jsx                   — Lean router (intro → form1 → form2 → loading → report → thankyou)
  components/
    Shell.jsx               — LogoMark, Shell (dark), LegalShell
    Legal.jsx               — PrivacyPolicy, TermsOfService, DoNotSell
    LoadingScreen.jsx       — Spinner + cycling status messages
    CostChart.jsx           — Animated bar chart (CSS transitions, no library)
    Forms.jsx               — StepIntro, StepForm1, StepForm2 with radio/checkbox selectors
    Report.jsx              — MarkdownReport renderer, LeadCaptureForm (full TCPA), StepReport
    ThankYou.jsx            — Confirmation + auto-redirect to Calendly
api/
  generate-report.js        — Vercel serverless function (API key stays server-side)
vercel.json                 — SPA routing + security headers (CSP, HSTS, X-Frame-Options)
```

### TCPA Compliance
All 14 compliance requirements are implemented:
- Separate unchecked checkboxes for phone, text/SMS, and email
- "Consent is not a condition of any purchase" in bold
- Automated technology disclosure
- STOP/unsubscribe/email revocation instructions
- 10 business day honoring commitment
- Federal DNC + California State DNC disclosure
- "Your information will not be sold, shared with, or used by any other company"
- Consent timestamp + methods stored in Supabase
- Links to Privacy Policy, Terms of Service, Do Not Sell or Share
