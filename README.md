# Awen Energy — Fresno PG&E Cost Report (Lead Magnet)

Fresno-specific landing page calibrated to PG&E cost pain, NEM 3.0 education, and system design quality. Captures leads to Supabase + redirects to Calendly.

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
VITE_SUPABASE_URL=https://kvzurzcgndrooxhfkdbv.supabase.co
VITE_SUPABASE_KEY=your_anon_key_here
```

If you skip this step, the app still works but leads won't be captured.

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

If you haven't already created the leads table, run this in Supabase SQL Editor:

```sql
-- Only needed if you haven't created it already
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

-- If you already have the table, add the new compliance columns:
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_text text;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_url text;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_agent text;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow browser (anon key) to insert rows only
CREATE POLICY "Allow anon inserts" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);
```

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # builds to /dist
npm run preview   # preview the build locally
```

## What's Included
- `src/App.jsx` — Full React app (PG&E projections, NEM 3.0 education, lead capture, TCPA)
- `vercel.json` — SPA routing config
- Supabase lead capture wired via environment variables
- Awen Energy branding (teal/gold/dark editorial)
- Fresno-specific data and messaging
