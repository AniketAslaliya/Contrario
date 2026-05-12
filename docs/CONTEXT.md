# CONTEXT.md — Contrario
> ⚡ READ THIS FIRST before touching any code.
> This file is updated after every work session. It is the single source of truth for any AI assistant or developer picking up this codebase.

---

## WHAT IS THIS PROJECT?
**Contrario** — adversarial multi-persona pitch intelligence platform.
Tagline: *"Three investors. One deck. Zero consensus."*
Built by Aniket Aslaliya (aniketaslaliya@gmail.com) as the vibe code submission for the **Activate AI Fellows Program — Summer 2026**.
Deadline: **May 15, 2026**

---

## WHY THIS EXISTS
Every pitch feedback tool (PitchBob, Evalyze, SaaStr AI, PitchGrade) gives ONE unified AI voice.
Contrario is different: it fires 3 investor archetypes **simultaneously** and shows where they **conflict**.
The conflict map IS the product. That's the insight no competitor has.

---

## THE THREE PERSONAS (CORE ENGINE)
| ID | Name | Archetype | Focus |
|---|---|---|---|
| P1 | Scale Chaser | Growth VC (Peak XV / Sequoia India) | Market size, moat, 10x |
| P2 | Conviction Buyer | First-check Indian Angel (Activate LP style) | Founder grit, India insight, capital efficiency |
| P3 | Reality Check | Skeptical Operator (ex-founder angel) | Unit economics, GTM, traction, execution risk |

---

## USER TYPES
1. **Founder** — uploads deck, gets 3-persona feedback + conflict map
2. **Student Builder** — same as founder, lighter onboarding
3. **Accelerator Manager** — org account, bulk upload, ranked shortlist
4. **Angel Investor** — quick triage mode, investment memo draft
5. **Mentor/Advisor** — overlay human notes on AI analysis

---

## CURRENT STATUS
| Module | Status | Notes |
|---|---|---|
| PRD | ✅ Done | /docs/PRD.md |
| CONTEXT | ✅ Done | This file |
| README | ✅ Done | /README.md |
| ROADMAP | ✅ Done | /docs/ROADMAP.md |
| Validation Script | ✅ Done | /scripts/validate.js |
| M01 Landing Page | ✅ Done | Hero + demo preview + features + responsive |
| M02 Auth | ✅ Done | NextAuth.js (Google OAuth + Email magic link) |
| M03 Onboarding | ✅ Done | Role picker · Supabase `profiles` upsert · `/dashboard` \| `/analyze` routing · `/settings` role change |
| M04 PDF Upload | ✅ Done | `PdfUpload` · `parse-pdf` route · `extractPitchPdfAction` · Storage optional (auth) · sessionStorage handoff for M06 |
| M05 Text Paste | ✅ Done | `TextInput` · tab toggle · 100–5000 · `sessionStorage` · `title` helper |
| M06 Analysis Engine | ✅ Done | `POST /api/analyze` SSE · Gemini `generateContentStream` in parallel (`Promise.allSettled` in `lib/analyze-sse.ts`) · synthesis pass · guest 1-run |
| M07 Conflict Map UI | ✅ Done | `lib/synthesis/post-analysis` · `ConflictMap` · SSE `synthesis` after streams |
| M08 Red Flags Summary | ✅ Done | `RedFlagsSummary` · max 3 consensus rows with fixes |
| M09 Per-Slide Breakdown | ✅ Done | `lib/slide-split` · optional slide map + **Per slide** persona sections |
| M10 Session History | ✅ Done | Supabase `analyses` · `/dashboard` list · `/dashboard/analysis/[id]` replay |
| M11 Deck Improvement | ✅ Done | `/dashboard/compare` · `lib/deck-compare` · `DeckCompareView` |
| M12 Shareable link | ✅ Done | `shared_reports` · `/r/[slug]` · expiry 7/30/never |

---

## TECH STACK (DECIDED)
- **Framework:** Next.js 14, App Router
- **Styling:** Tailwind CSS + custom warm theme
- **AI:** **`POST /api/analyze`** uses **Google Gemini 2.5 Flash** (`GEMINI_API_KEY`, optional `GEMINI_MODEL`, defaults in `lib/gemini.ts`) — SSE + parallel streams in `lib/analyze-sse.ts`. **Anthropic** remains available via `lib/ai-provider.ts` for other routes/helpers when configured. Vercel: set `X-Accel-Buffering: no` on SSE responses to reduce buffering.
- **PDF Parse:** `pdf-parse` (Node.js, server action)
- **Auth:** NextAuth.js (Google OAuth + Email magic link)
- **DB:** Supabase (Postgres)
- **Storage:** Supabase Storage (PDF files)
- **Deploy:** Vercel (NOT HuggingFace — wrong tool for this stack)
- **Analytics:** Vercel Analytics

---

## ARCHITECTURE DECISIONS (DON'T CHANGE WITHOUT REASON)
1. **Parallel API calls** — All 3 persona prompts fired simultaneously using `Promise.all()`. NEVER chain them.
2. **Streaming** — Use the **active** provider’s streaming API (Gemini or Anthropic). User sees token-by-token output per persona. Same parallel `Promise.all` / `Promise.allSettled` contract.
3. **Node.js runtime** for `/api/analyze` — Persona streaming + PDF deps need Node (not Edge).
4. **PDF parsed server-side** in a Next.js server action — client never sees the raw file after upload.
5. **Auth data in Supabase** — User role lives in `public.profiles` (service-role writes). Analysis history in `public.analyses` (M10). Guest mode stays localStorage for the free-analysis counter.

### Future — user satisfaction signals & trainable models (not shipped yet)
The live product uses a **hosted API** (Gemini today for `/api/analyze`) — weights are **not** updated on each request. A practical path to “learn from users” is **offline**: collect structured satisfaction (e.g. thumbs, section ratings, optional free-text) tied to analysis IDs → export **preference / outcome labels** → periodic **fine-tuning or preference tuning** (DPO / reward modeling) on **open-weight** models, often trained **outside** Vercel (GPU jobs, Hugging Face training pipelines, or Vertex). **Hugging Face** is a strong fit for **open models, datasets, and training jobs**; **Vercel** remains the wrong place to **host** heavy inference/training, not the wrong place to **call** a HF Inference endpoint from a server route if latency and SLAs fit. True online reinforcement from every click is possible in theory but is **infrastructure-heavy**; most teams approximate it with **feedback logging + batched model updates**.

---

## FOLDER STRUCTURE (TARGET)
```
contrario/
├── app/
│   ├── page.tsx              # M01: Landing/Hero
│   ├── auth/                 # M02: Login/Signup
│   ├── onboarding/           # M03: Role selection
│   ├── dashboard/            # M10: Founder dashboard
│   ├── analyze/              # M06: Core analysis page
│   └── api/
│       ├── analyze/          # Parallel AI streams (Gemini SSE)
│       └── parse-pdf/        # PDF extraction
├── components/
│   ├── ui/                   # Shared primitives
│   ├── persona-card/         # M07: Individual persona output
│   ├── conflict-map/         # M07: Conflict visualizer
│   └── upload/               # M04/M05: Input components
├── lib/
│   ├── anthropic.ts          # Claude API client
│   ├── gemini.ts             # Gemini API client
│   ├── ai-provider.ts        # Chooses Gemini vs Anthropic from env
│   ├── personas.ts           # The 3 persona system prompts
│   ├── pdf-parser.ts         # PDF text extraction (server-only)
│   ├── pdf-pipeline.ts       # Validate + Storage + parse
│   ├── pdf-constants.ts      # MAX_PDF_BYTES (client-safe)
│   ├── deck-storage.ts        # Supabase Storage uploads (auth)
│   ├── profile.ts             # profiles table read/write (server)
│   ├── supabase-admin.ts      # Supabase service client (server only)
│   └── user-role.ts           # Shared role enums + routing
├── docs/
│   ├── PRD.md
│   ├── ROADMAP.md
│   └── CONTEXT.md            ← YOU ARE HERE
└── scripts/
    └── validate.js           # Pre-deploy validation
```

---

## CRITICAL SYSTEM PROMPTS LOCATION
All 3 persona prompts live in `/lib/personas.ts`.
**Do not inline prompts in API routes.** Always import from personas.ts.

---

## ENVIRONMENT VARIABLES NEEDED
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=
# ANTHROPIC_MODEL=claude-sonnet-4-20250514
# Optional Gemini: AI_PROVIDER=gemini + GEMINI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_DECK_BUCKET=deck-uploads

# SQL: run once in Supabase SQL editor — supabase/migrations/20260512120000_profiles.sql
```

---

## SESSION LOG
> Add a new entry after every work session.

### Session 001 — May 2026
- **Done:** PRD, CONTEXT, README, ROADMAP (25 modules), validation script
- **Decisions made:** Vercel over HuggingFace, parallel API calls, dark premium design, 5 user types
- **Next session should start with:** M01 (Landing page) + M02 (Auth setup)
- **Blockers:** None

### Session 002 — May 12, 2026
- **Done:** M01 (Landing/Hero page), M02 (Authentication)
- **M01 includes:** Hero with tagline + animated persona demo preview + How It Works + Feature Grid + bottom CTA + dark premium design + mobile responsive + Navbar with glassmorphism + Footer
- **M02 includes:** NextAuth.js setup, Google OAuth provider, Email magic link, auth page UI, verify page, session provider, JWT strategy, /auth route
- **Also done:** Next.js 14 project initialized, Tailwind CSS dark theme configured, folder structure set up, PRD.md written (was duplicate of CONTEXT), .env.example created, placeholder /analyze page
- **Decisions made:** framer-motion + lucide-react added for UI, JWT session strategy over database sessions, auth redirects to /onboarding
- **Next session should start with:** M03 (Onboarding) + M04 (PDF Upload) + M05 (Text Paste) + M06 (Analysis Engine)
- **Blockers:** Need GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_SECRET in .env.local for auth to work end-to-end

### Session 003 — May 12, 2026
- **Done:** M03 (User role onboarding) — `/onboarding` gate after auth, roles persisted via Supabase `profiles`, founder/student/angel → `/analyze`, accelerator/mentor → `/dashboard`, `/settings` to change role. SQL migration checked in under `supabase/migrations/20260512120000_profiles.sql`. M00 validated at 100% (`node scripts/validate.js --module=M00`).
- **Decisions:** Server actions return `{ ok }` plus client-side `router.push` (avoids swallowed `redirect()` from actions). Dashboard is restricted to accelerator + mentor once Supabase is configured.
- **Next session should start with:** M04 PDF upload + text extraction (`parse-pdf` route), then M05 text paste shell so M06 can consume one input pipe.
- **Blockers:** Run the profiles migration in Supabase and set Supabase URL + service role keys in `.env.local` so onboarding save works end-to-end.

### Session 004 — May 12, 2026
- **Done:** Pluggable LLM layer — `lib/gemini.ts`, `lib/anthropic.ts`, `lib/ai-provider.ts` (default **Gemini** for free-tier). `.env.example` documents `AI_PROVIDER`, `GEMINI_*`, optional `DATABASE_URL` notes (Supabase pooler if IPv4), and never committing passwords. `scripts/validate.js` M06 + pre-deploy check the correct API key for the active backend. Installed `@google/generative-ai`.
- **Decisions:** Fellows MVP can ship on Gemini; swap to Claude with `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` when budget allows. **Do not** paste real DB hosts/passwords into committed files — only `.env.local`.
- **Next session should start with:** M04 / M05 input pipeline, then M06 wiring `assertActiveLlmConfigured()` + parallel streams for the chosen provider.
- **Blockers:** User must add `GEMINI_API_KEY` (AI Studio) for local analysis tests when using defaults; optional `npx skills add supabase/agent-skills` is convenience-only.

### Session 006 — May 12, 2026
- **Done:** M05 (text paste — `components/upload/TextInput.tsx`, tab toggle with PDF on `/analyze`, helper `title` + visible checklist). M06 (`POST /api/analyze` SSE, `lib/personas.ts` + `lib/persona-stream.ts` parallel Gemini/Anthropic streaming, `AnalyzeWorkspace` + `PersonaStreamColumn`, guest one-run via `localStorage`). M01 validator fixed for `Zero&nbsp;consensus`; hero adds `Sign up` link to `/auth`. Single env template remains `.env.example` only — `.env.local` gitignored.
- **Decisions:** Serialized SSE writes for thread-safe multiplexing; Anthropic uses MessageStream `text` events; API input min 40 chars (paste tab still 100+ for UX).
- **Next session should start with:** M07 conflict map zones + M08 consensus red flags on top of streaming output.
- **Blockers:** `node scripts/validate.js --module=M06` requires **`GEMINI_API_KEY`** in `.env.local` for the current phase. Set `AI_PROVIDER=anthropic` and **`ANTHROPIC_API_KEY`** only when you run Claude.

### Session 007 — May 12, 2026
- **Done:** M07 + M08 — `synthesizeConflictAndFlags()` runs after `Promise.all` persona streams; SSE events `synthesis` / `synthesisError`; `AnalyzeWorkspace` renders `ConflictMap` + `RedFlagsSummary`; score badges from `extractScoreFromMarkdown`; `docs/ROADMAP.md` updated.
- **Decisions:** Second-pass synthesis uses the same active LLM as M06 (Gemini JSON mode vs Claude); conflict map bullets capped in normalizer.
- **Next session should start with:** M09 per-slide breakdown or M10 dashboard history (per ROADMAP).
- **Blockers:** Add **`GEMINI_API_KEY`** to `.env.local` for the current Gemini-first stack. Use **`ANTHROPIC_API_KEY`** only with **`AI_PROVIDER=anthropic`**.

### Session 008 — May 12, 2026
- **Done:** Validators and docs treat **Gemini as the required LLM for the current phase** (`GEMINI_API_KEY` enforced in `scripts/validate.js` M06 + `--pre-deploy`). Anthropic remains optional unless `AI_PROVIDER=anthropic`. Updated `lib/ai-provider.ts` comment, `.env.example`, `README.md`, `docs/CONTEXT.md`.
- **Next:** Add your Gemini key to `.env.local` — `node scripts/validate.js --module=M06` should hit 100%.

### Session 009 — May 12, 2026
- **Done:** M09 (slide detection + slide map in prompts + optional **Per slide** output) · M10 (`analyses` migration, `lib/analysis-store`, `saveAnalysisAction` for founder/student/angel, dashboard history + detail replay). `PdfUpload` stores `fileName` for titles. `.env.example` cleared of real Gemini key — use `.env.local` only; user should **rotate** any key that was committed.
- **Next:** Run `analyses` migration in Supabase SQL editor; verify history save end-to-end when signed in as founder.

### Session 010 — May 12, 2026
- **Done:** M11 (`lib/deck-compare`, `/dashboard/compare`, `DeckCompareView`, `ComparePicker`, `extractKeyConcernFromMarkdown`) · M12 (`shared_reports` migration, `lib/shared-report-store`, `createShareReportAction`, `ShareReportTools` on analysis detail, public `app/r/[slug]/page.tsx`). Dashboard link to compare when ≥2 saves.
- **Next:** Apply `20260514000000_shared_reports.sql` in Supabase (alongside `analyses` if not yet run).
- **Blockers:** None beyond running SQL migrations.

### Session 011 — May 12, 2026
- **Done:** Default AI backend switched to **Anthropic** (`lib/ai-provider.ts`, `.env.example`, `README`, `scripts/validate.js`). **SSE client** in `AnalyzeWorkspace.tsx` rewritten (line-buffered `data:` JSON, `personaStatus`, `isAnalyzing`, `finished` event). **Persona cards** use `react-markdown` + stream cursor; **ConflictMap** renders synthesis markdown; **RedFlagsSummary** unchanged. **`lib/analyze-sse.ts`** uses explicit `Promise.all` for three personas. Landing **`ConflictMapPreview`** mockup after How It Works. Removed visible **(M__)** module tags from production UI copy. Installed **`react-markdown`** + **`@tailwindcss/typography`**.
- **Prod/Vercel:** Set **`AI_PROVIDER=anthropic`**, **`ANTHROPIC_API_KEY`**, and **`GEMINI_API_KEY`** only if using `AI_PROVIDER=gemini`.
- **Next:** None — ship.

---

## RULES FOR AI ASSISTANTS READING THIS FILE
1. Never regenerate what's already in STATUS as ✅ Done
2. Always update the SESSION LOG at the end of your work
3. Always update the STATUS table when a module changes
4. The conflict map (M07) is the most important UI — never deprioritize it
5. All LLM persona calls must be parallel (`Promise.all` / `Promise.allSettled`) — if you write sequential calls, you're wrong
6. Design must be dark and premium — no white backgrounds on main app pages
7. This is a fellowship submission — every commit message should be clean