# PRD — Contrario
> Product Requirements Document
> *"Three investors. One deck. Zero consensus."*

---

## 1. Product Overview

**Contrario** is an adversarial multi-persona pitch intelligence platform that fires three distinct investor archetypes simultaneously against a founder's pitch deck — then surfaces where they agree and disagree.

Unlike PitchBob, Evalyze, SaaStr AI, and PitchGrade which all give ONE unified AI voice, Contrario's **conflict map** is the product. The disagreement between investor archetypes is the signal founders actually need.

**Built by:** Aniket Aslaliya (aniketaslaliya@gmail.com)  
**Submission for:** Activate AI Fellows Program — Summer 2026  
**Deadline:** May 15, 2026

---

## 2. The Three Personas (Core Engine)

| ID | Name | Archetype | Focus | Tone |
|---|---|---|---|---|
| P1 | Scale Chaser | Growth VC (Peak XV / Sequoia India) | Market size, moat, 10x trajectory | Aggressive, data-driven, impatient with small thinking |
| P2 | Conviction Buyer | First-check Indian Angel (Activate LP style) | Founder grit, India insight, capital efficiency | Warm but sharp, looks for authenticity, India-aware |
| P3 | Reality Check | Skeptical Operator (ex-founder angel) | Unit economics, GTM reality, traction, execution risk | Blunt, practical, "show me the numbers" |

### Response Structure (per persona)
Each persona returns:
1. **Score** — 1-10 rating
2. **5 Specific Feedback Points** — tagged to pitch content
3. **Key Concern** — single biggest worry
4. **Investment Signal** — INVEST / PASS / CONDITIONAL

---

## 3. User Types

### 3.1 Founder (Primary)
- Uploads pitch deck (PDF) or pastes text
- Receives 3-persona parallel analysis with streaming
- Views conflict map to see agreement/disagreement zones
- Tracks deck improvement across versions
- Shares reports with mentors/co-founders

### 3.2 Student Builder
- Same as Founder with lighter onboarding
- No org features, focus on learning
- Encouraged to iterate on feedback

### 3.3 Accelerator Manager
- Organization-level account
- Bulk upload up to 20 decks
- Ranked shortlist dashboard with composite scores
- Custom persona weight configuration
- Export capabilities (CSV, PDF)

### 3.4 Angel Investor
- Quick triage mode (60-second read)
- Investment memo draft generator
- Composite score with invest/pass signal
- Shareable quick-triage link

### 3.5 Mentor/Advisor
- View shared analyses
- Add human annotations on top of AI analysis
- Thread-style discussion per comment
- Founder notification on new comments

---

## 4. Core Features

### 4.1 Input Methods
- **PDF Upload** — Drag-and-drop, max 10MB, server-side text extraction via pdf-parse
- **Text Paste** — Textarea with 100–5000 character limits, helper tooltips
- **Tab toggle** between PDF and text input modes

### 4.2 Analysis Engine (CRITICAL PATH)
- All 3 Claude API calls fire **in parallel** using `Promise.all()`
- **Streaming** — Users see tokens as they arrive per persona
- System prompts live exclusively in `lib/personas.ts`
- Graceful degradation — if one persona fails, others continue
- Guest mode: 1 free analysis before signup prompt
- Target: first token < 3s, full analysis < 30s

### 4.3 Conflict Map (SIGNATURE FEATURE)
- Three persona cards side-by-side (stacked on mobile)
- Each card: persona name, score badge, 5 feedback points, key concern
- **Conflict zones below cards:**
  - 🟢 Green = all 3 agree this is good
  - 🔴 Red = all 3 flag this as a problem
  - 🟡 Yellow = 2 of 3 flag
- Smooth streaming animation, no layout shift

### 4.4 Consensus Red Flags
- Auto-generated after all 3 streams complete
- Max 3 consensus issues with one-line fix suggestions
- Visually distinct (full-width, red-tinted)

### 4.5 India Context Mode
- Toggle that adds India-specific benchmarks
- When ON: CAC in INR, India TAM, UPI/WhatsApp distribution, Tier 2/3 dynamics
- When OFF: global investor lens
- Default ON for Indian founders

---

## 5. Non-Functional Requirements

### 5.1 Performance
- LCP < 1.5s on landing page
- First token < 3s on analysis
- Full analysis < 30s

### 5.2 Design
- Dark premium theme (no white backgrounds on app pages)
- Aesthetic: linear.app meets vercel.com
- Mobile-first responsive design

### 5.3 Security
- PDF parsed server-side only
- Auth via NextAuth.js (Google OAuth + email magic link)
- API keys never exposed to client
- Supabase RLS for data isolation

### 5.4 Scalability
- Edge runtime on Vercel for analysis route
- Guest mode uses localStorage (no DB)
- Authenticated users get Supabase persistence

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Engine | Anthropic Claude claude-sonnet-4-20250514 |
| Styling | Tailwind CSS + custom dark theme |
| Auth | NextAuth.js (Google OAuth + Email magic link) |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage (PDF files) |
| Deploy | Vercel |
| Analytics | Vercel Analytics |

---

## 7. Success Metrics

- **Fellowship demo:** Working end-to-end flow (upload → 3 persona streaming → conflict map)
- **User delight:** "This is the most useful pitch feedback I've ever gotten"
- **Technical quality:** Parallel streaming, dark premium design, clean code
- **Differentiation:** No other tool shows investor disagreement — that's the moat

---

*See [ROADMAP.md](ROADMAP.md) for the 25-module build plan with acceptance criteria.*