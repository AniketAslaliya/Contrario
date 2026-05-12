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
| M03 Onboarding | 🔲 Not started | |
| M04 PDF Upload | 🔲 Not started | |
| M05 Text Paste | 🔲 Not started | |
| M06 Analysis Engine | 🔲 Not started | CORE — parallel Claude API calls |
| M07 Conflict Map UI | 🔲 Not started | CORE — most important UI |

---

## TECH STACK (DECIDED)
- **Framework:** Next.js 14, App Router
- **Styling:** Tailwind CSS + custom dark theme
- **AI:** Anthropic API — `claude-sonnet-4-20250514`
- **PDF Parse:** `pdf-parse` (Node.js, server action)
- **Auth:** NextAuth.js (Google OAuth + Email magic link)
- **DB:** Supabase (Postgres)
- **Storage:** Supabase Storage (PDF files)
- **Deploy:** Vercel (NOT HuggingFace — wrong tool for this stack)
- **Analytics:** Vercel Analytics

---

## ARCHITECTURE DECISIONS (DON'T CHANGE WITHOUT REASON)
1. **Parallel API calls** — All 3 persona prompts fired simultaneously using `Promise.all()`. NEVER chain them.
2. **Streaming** — Use Anthropic streaming API. User sees token-by-token output per persona.
3. **Edge runtime** on Vercel for analysis route — lowest latency.
4. **PDF parsed server-side** in a Next.js server action — client never sees the raw file after upload.
5. **No database for MVP** — session data stored in Supabase only after auth. Guest mode uses localStorage.

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
│       ├── analyze/          # Parallel Claude calls
│       └── parse-pdf/        # PDF extraction
├── components/
│   ├── ui/                   # Shared primitives
│   ├── persona-card/         # M07: Individual persona output
│   ├── conflict-map/         # M07: Conflict visualizer
│   └── upload/               # M04/M05: Input components
├── lib/
│   ├── anthropic.ts          # Claude API client
│   ├── personas.ts           # The 3 persona system prompts
│   ├── pdf-parser.ts         # PDF extraction utility
│   └── supabase.ts           # DB client
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
ANTHROPIC_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
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

---

## RULES FOR AI ASSISTANTS READING THIS FILE
1. Never regenerate what's already in STATUS as ✅ Done
2. Always update the SESSION LOG at the end of your work
3. Always update the STATUS table when a module changes
4. The conflict map (M07) is the most important UI — never deprioritize it
5. All Claude API calls must be parallel — if you write sequential calls, you're wrong
6. Design must be dark and premium — no white backgrounds on main app pages
7. This is a fellowship submission — every commit message should be clean