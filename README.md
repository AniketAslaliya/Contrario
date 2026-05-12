# Contrario
### *Three investors. One deck. Zero consensus.*

> The world's first adversarial multi-persona pitch intelligence platform — built for Indian founders who deserve brutal, honest, multi-lens feedback before they walk into a room.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Status](https://img.shields.io/badge/status-active--development-brightgreen)
![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%7C%20AI%20%7C%20Supabase-blueviolet)

---

## The Problem

Every AI pitch feedback tool in existence gives you **one voice**. One AI. One opinion. One generic checklist.

Real investors don't agree. A growth VC, a first-check Indian angel, and a skeptical ex-founder will tear your deck apart in completely different ways — and that **conflict** is the signal you actually need.

## The Solution

Contrario fires **three investor archetypes simultaneously** against your pitch deck and shows you exactly where they agree (your critical fixes) and where they diverge (your positioning choices).

| Persona | Archetype | What They Care About |
|---|---|---|
| 🔴 The Scale Chaser | Growth VC (Peak XV style) | Market size, moat, 10x trajectory |
| 🟡 The Conviction Buyer | First-check Indian Angel | Founder grit, India insight, capital efficiency |
| 🟢 The Reality Check | Skeptical Operator | Unit economics, GTM reality, traction |

---

## Features

- **Parallel streaming analysis** — all 3 personas respond simultaneously, no waiting
- **Conflict map** — visual overlay showing where investors agree and clash
- **PDF upload or text paste** — works with decks or raw ideas
- **Multi-user platform** — Founders, Students, Accelerators, Angels, Mentors
- **Session history** — track how your deck improves across versions
- **Shareable reports** — send a link, not a PDF
- **India Context Mode** — benchmarks tuned for Indian market dynamics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Engine | **Gemini** (default for `/api/analyze` — `GEMINI_API_KEY`) and/or **Anthropic** via `lib/ai-provider.ts` and `.env.example` |
| Styling | Tailwind CSS |
| Auth | NextAuth.js |
| Database | Supabase |
| Deploy | Vercel |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/AniketAslaliya/Contrario
cd Contrario

# Install dependencies
npm install

# Set up environment variables
# Copy the single env template (never commit secrets)
cp .env.example .env.local
# Fill in your keys (see docs/CONTEXT.md for full list)

# Run development server
npm run dev

# Run validation script before deploying
node scripts/validate.js
```

---

## Deploy to Vercel

1. Push this repo to GitHub (see remote in `git remote -v`).
2. In Vercel: **Import** the repo, framework **Next.js**, build `npm run build`, output `.next`.
3. Add **Environment variables** for Production / Preview (match `.env.example`):
   - `NEXTAUTH_SECRET` (**required**). `NEXTAUTH_URL` — set to your real origin (`https://<project>.vercel.app` or custom domain, no trailing slash). If you **omit** `NEXTAUTH_URL` on Vercel, the app derives it from `VERCEL_URL` at build/runtime (see `next.config.mjs`). **Custom domains:** set `NEXTAUTH_URL` explicitly to `https://your-custom-domain.com`.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (email magic link: enable **Email** in Supabase Auth; add redirect `https://<your-domain>/auth/callback`)
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (only if you want “Sign in with Google”)
   - `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` (default `claude-sonnet-4-20250514`); optional `AI_PROVIDER=gemini` + `GEMINI_API_KEY` + `GEMINI_MODEL` if you use Google instead of the default Anthropic backend
   - Optional: `NEXT_PUBLIC_SUPABASE_DECK_BUCKET`, `CONTRARIO_API_KEY`, `CONTRARIO_ADMIN_EMAILS`
   - Optional: `PDF_UPLOAD_MAX_BYTES` — lower than the default ~10MB cap when your host limits request size (Vercel ~4.5MB); see `.env.example`
4. Deploy. Long-running **`/api/analyze`** relies on exported `maxDuration` in route handlers; use a Vercel plan that supports the duration you need.

### Vercel troubleshooting (when the site loads but auth breaks)

Production was returning **`{"message":"There is a problem with the server configuration..."}`** from **`/api/auth/providers`** when **`NEXTAUTH_SECRET`** was missing in Vercel. NextAuth needs this on every deploy:

1. **`NEXTAUTH_SECRET`** — generate locally with `openssl rand -base64 32` (or any long random string), add under Vercel → Project → Settings → Environment Variables for **Production** (and Preview if you use it), then **Redeploy**.
2. **`NEXTAUTH_URL`** — must match the deployment origin (no trailing slash). Wrong origin breaks OAuth callbacks and cookies. On Vercel you can rely on automatic `https://$VERCEL_URL` when this var is unset (`next.config.mjs`); use an explicit value for a **custom domain**.
3. **Email magic link** — if `/auth` shows a warning about Supabase keys, set **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** on Vercel, plus **`SUPABASE_SERVICE_ROLE_KEY`** (required for verifying the magic-link token server-side). In Supabase → Authentication → URL Configuration, add **`https://<your-domain>/auth/callback`** (and **`http://localhost:3000/auth/callback`** for local dev) to **Redirect URLs**. **Important:** Request the link and open it **on the same browser/device** — PKCE stores a verifier when you submit your email.
4. After changing env vars, trigger a **new deployment** so the runtime picks them up.
5. **Google shows `401 invalid_client` / “The OAuth client was not found”** — Google does not recognize the **Client ID** sent in the sign-in request. Fix it in **Google Cloud Console** (the same project where the OAuth consent screen lives): **APIs & Services → Credentials → Create credentials → OAuth client ID → Application type: Web application**. Copy the **Client ID** and **Client secret** into **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`** in **Vercel** (and `.env.local` for local dev)—**not** from the Supabase Auth “Google” panel unless that value is **identical** to the Web client ID from Google Cloud (usually it is not). Use a **Web client**, not Android/iOS only. Remove accidental spaces in env values (or redeploy after the trimmed-env fix). **Redeploy** after editing env vars. Confirm **Authorized redirect URIs** include `https://<your-production-host>/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.

### Live deploy (CLI-linked project)

If you use `npx vercel link`, production is often **`https://<your-project>.vercel.app`**. You may **omit** `NEXTAUTH_URL` in Vercel so it defaults to `https://$VERCEL_URL` from `next.config.mjs`; with a **custom domain**, set **`NEXTAUTH_URL`** to `https://your-domain.com` explicitly. For Google OAuth, add **`https://<deployment-host>/api/auth/callback/google`** in **Google Cloud → OAuth redirect URIs** (and **`http://localhost:3000/api/auth/callback/google`** for local dev). Email magic links use Supabase **`https://<host>/auth/callback`** (see above).

### Supabase database security (not a bug)

Contrario talks to Postgres **only from the server** via **`SUPABASE_SERVICE_ROLE_KEY`**. That role **bypasses RLS**. Tables have **RLS enabled and no policies**, so requests using the **anon** or **authenticated** (user JWT) keys get **no access** by default — which is what you want if the browser never queries these tables directly.

The Supabase linter may report [RLS enabled, no policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) as **INFO**. That matches this pattern. If you later read/write from the browser with the user’s JWT, you must add explicit RLS policies.

### Supabase (cloud migrations)

Migrations live under `supabase/migrations/` and must be applied once to **your hosted** Supabase Postgres. **Do not paste your DB password into chat.**

**Easiest from your laptop (recommended):**

1. In Supabase → **Project Settings → Database**, copy the **URI** connection string (replace `[YOUR-PASSWORD]` with your DB password — often the one you chose at project creation, not the anon key).
2. Add one line to **`.env.local`** (already gitignored):

   ```bash
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   ```

   If Supabase warns about IPv4, use the **Session pooler** URI from the same Connect screen instead.

3. From the **repository root** (`Contrario/`, not `scripts/`):

   ```bash
   npm run db:migrate
   ```

**`getaddrinfo ENOTFOUND`** on `db.*.supabase.co`: that hostname is often **IPv6-only**. If your network has no IPv6 (or DNS fails), use Supabase Dashboard → **Connect** → **Session pooler** URI instead (host like `aws-0-<region>.pooler.supabase.com`, port **6543**, user **`postgres.<project-ref>`**). Put that full URI in `DATABASE_URL`.

That runs each `*.sql` file in **`supabase/migrations/`** in sorted (chronological) order. Partial reruns may error if objects already exist; the SQL uses `IF NOT EXISTS` where possible.

**Alternative (browser only):** Supabase Dashboard → **SQL Editor**, paste each file in order:

1. `20260512120000_profiles.sql`
2. `20260513200000_analyses.sql`
3. `20260514000000_shared_reports.sql`
4. `20260515000000_m14_m25_platform.sql`
5. `20260515100000_analyses_starred.sql`
6. `20260516100000_org_fk_indexes.sql`
7. `20260517100000_profiles_onboarding_deck.sql` — **`display_name`** and last-uploaded-deck columns on `profiles`. **Apply this in production** for preferred-name greetings and the “last PDF” workspace card. The app tolerates missing columns (onboarding still saves role), but profile extras stay disabled until this migration runs.

**Optional:** [Supabase CLI](https://supabase.com/docs/guides/cli) with a linked project or `--db-url` (same credential rules — keep it local).

---

## Project Structure

```
contrario/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Core logic (Anthropic/Gemini, personas, PDF parser)
├── docs/             # PRD, ROADMAP, CONTEXT (read these first)
└── scripts/          # Validation and utility scripts
```

---

## Documentation

| File | Purpose |
|---|---|
| [`docs/CONTEXT.md`](docs/CONTEXT.md) | 🧠 START HERE — living context for all AI assistants |
| [`docs/PRD.md`](docs/PRD.md) | Full product requirements |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | 25-module build roadmap |

---

## Roadmap (25 Modules)

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full breakdown. Current priority:

- [x] M00: Foundation docs
- [x] M01: Landing page
- [x] M02: Auth
- [x] M03: User role onboarding (Supabase profiles)
- [x] M04: PDF upload + server-side text extraction
- [x] M05: Text paste + analyze tabs
- [x] M06: Streaming analysis API
- [x] M07: Conflict map UI
- [x] M08: Consensus red flags
- [x] M09: Per-slide breakdown
- [x] M10: Dashboard session history
- [x] M11: Deck improvement tracker
- [x] M12: Shareable report link
- [x] M13–M25: PDF export, org/shortlist/batch, persona weights UI, India context, memo & triage, mentor notes & notifications, admin snapshot, waitlist/API docs, SSE `lib/analyze-sse` (`node scripts/validate.js` verifies wiring)

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for full acceptance criteria.

---

## Built By

**Aniket Aslaliya** — Technical PM & AI Builder  
Google Cloud Gen AI Hackathon Winner 2025 | 2nd Runner-up Meta Hackathon 2026  
[aniketaslaliya.dev](https://aniketaslaliya.dev) · [LinkedIn](https://linkedin.com/in/aniket-aslaliya) · [GitHub](https://github.com/AniketAslaliya)
