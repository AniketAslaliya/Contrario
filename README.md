# Contrario
### *Three investors. One deck. Zero consensus.*

> The world's first adversarial multi-persona pitch intelligence platform — built for Indian founders who deserve brutal, honest, multi-lens feedback before they walk into a room.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Status](https://img.shields.io/badge/status-active--development-brightgreen)
![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%7C%20Gemini%20%7C%20Supabase-blueviolet)

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
| AI Engine | **Gemini** (`GEMINI_API_KEY` required for current phase); Anthropic optional via `AI_PROVIDER=anthropic` |
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

## Project Structure

```
contrario/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Core logic (Gemini/Anthropic, personas, PDF parser)
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

---

## Built By

**Aniket Aslaliya** — Technical PM & AI Builder  
Google Cloud Gen AI Hackathon Winner 2025 | 2nd Runner-up Meta Hackathon 2026  
[aniketaslaliya.dev](https://aniketaslaliya.dev) · [LinkedIn](https://linkedin.com/in/aniket-aslaliya) · [GitHub](https://github.com/AniketAslaliya)

---

*Built as a vibe code submission for the Activate AI Fellows Program — Summer 2026*