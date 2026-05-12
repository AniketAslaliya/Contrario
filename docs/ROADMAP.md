# ROADMAP.md — Contrario
> 25 Modules | Linked to PRD | Each module has its own validation

---

## How to Use This Roadmap
- Each module has a **status**, **priority**, **estimated hours**, and **acceptance criteria**
- Work one module at a time
- Run `node scripts/validate.js --module=MXX` after completing each module
- Update `docs/CONTEXT.md` status table after each module

---

## Priority Legend
| Symbol | Meaning |
|---|---|
| 🔴 P0 | Must ship — fellowship demo blockers |
| 🟡 P1 | Ship if time allows — makes product feel complete |
| 🟢 P2 | Post-fellowship — makes product real |
| ⚪ P3 | Future / V2 |

---

## Phase 0 — Foundation (DONE ✅)

### M00 · Foundation Docs
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 1  
**Deliverables:** PRD.md, CONTEXT.md, README.md, ROADMAP.md, validate.js  
**Acceptance Criteria:**
- [ ] All 5 files exist and are non-empty
- [ ] CONTEXT.md has session log entry
- [ ] README has setup instructions

---

## Phase 1 — Core Shell (Days 1–2)

### M01 · Landing / Hero Page
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 2–3  
**Description:** Public-facing hero with tagline, animated demo preview, CTA to try free  
**Acceptance Criteria:**
- [ ] Hero renders on mobile + desktop
- [ ] "Try free" CTA routes to /analyze (guest mode)
- [ ] "Sign up" CTA routes to /auth
- [ ] Static demo output preview visible
- [ ] Dark premium design, no white backgrounds
- [ ] Page LCP < 1.5s

---

### M02 · Authentication (Email + Google OAuth)
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 2  
**Description:** NextAuth.js setup with Google OAuth and email magic link  
**Acceptance Criteria:**
- [ ] Google OAuth login works end-to-end
- [ ] Email magic link login works
- [ ] Session persists on refresh
- [ ] Unauthenticated routes redirect to /auth
- [ ] Auth state accessible via useSession()

---

### M03 · User Role Onboarding
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 1.5  
**Description:** After first login, user picks their role: Founder / Student / Accelerator / Angel / Mentor  
**Acceptance Criteria:**
- [ ] Role selection screen appears on first login only
- [ ] Role stored in Supabase user profile
- [ ] Each role routes to correct dashboard variant
- [ ] Can change role from settings later

---

### M04 · PDF Upload + Text Extraction
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 2  
**Description:** Drag-and-drop PDF upload, server-side text extraction using pdf-parse  
**Acceptance Criteria:**
- [x] PDF upload UI with drag-and-drop
- [x] Max file size: 10MB enforced
- [x] Server action extracts clean text from PDF
- [x] Extracted text passed to analysis engine
- [x] Error state for corrupt/unreadable PDFs
- [x] File stored in Supabase Storage (authenticated users only)

---

### M05 · Text / Idea Paste Input
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 1  
**Description:** Alternative to PDF — paste pitch text or raw idea description  
**Acceptance Criteria:**
- [x] Textarea with character count (min 100, max 5000)
- [x] "What to include" helper tooltip
- [x] Tab toggle between PDF upload and text paste
- [x] Text passed to analysis engine same as PDF path

---

## Phase 2 — Core Engine (Days 2–3) 🔴 MOST CRITICAL

### M06 · Three-Persona Streaming Analysis Engine
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 4  
**Description:** The heart of Contrario. Fires 3 Claude API calls in parallel with distinct system prompts. Streams tokens to the UI simultaneously.  
**Architecture:**
```
User Input → /api/analyze (POST)
              ↓
    Promise.all([
      streamPersona('scale-chaser', input),
      streamPersona('conviction-buyer', input),
      streamPersona('reality-check', input)
    ])
              ↓
    SSE stream → 3 persona cards update simultaneously
              ↓
    synthesizeConflictAndFlags (second pass, same LLM) → conflict map + red flags
```
**Acceptance Criteria:**
- [x] All 3 API calls fire in parallel (check with network tab)
- [x] Streaming visible token-by-token per persona
- [x] Each persona response structured: Rating (1-10) + 5 specific points + Key concern
- [x] Total time to first token < 3 seconds
- [x] Total analysis complete < 30 seconds
- [x] Graceful error if one persona fails (other two continue)
- [x] Guest mode: 1 free analysis, then prompt to sign up

---

### M07 · Conflict Map Output UI
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 3  
**Description:** The signature UI of Contrario. Three persona cards side-by-side + conflict map showing agreement/disagreement zones  
**Layout:**
```
┌─────────────────────────────────────────┐
│  🔴 Scale Chaser  🟡 Conviction Buyer  🟢 Reality Check │
│  [streaming...]   [streaming...]   [streaming...]  │
├─────────────────────────────────────────┤
│           CONFLICT MAP                  │
│  ████ All 3 agree: CRITICAL FIXES       │
│  ░░░░ 2 of 3 agree: WATCH THESE        │
│  ---- They disagree: YOUR CHOICE        │
└─────────────────────────────────────────┘
```
**Acceptance Criteria:**
- [x] 3-column layout responsive (stacked on mobile)
- [x] Each card shows: Persona name, Score badge (when `## Score` present in output)
- [x] Conflict map section below cards (`ConflictMap`)
- [x] Green = consensus strengths; Red = consensus risks; Yellow = mixed / 2-of-3
- [x] Smooth streaming (serialized SSE; synthesis after streams finish)

---

### M08 · Consensus Red Flags Summary
**Status:** ✅ Complete  
**Priority:** 🔴 P0  
**Hours:** 1.5  
**Description:** Auto-generated "The 3 things ALL investors flagged" section — the most actionable output  
**Acceptance Criteria:**
- [x] Appears after all 3 streams complete (same SSE round-trip after synthesis)
- [x] Shows max 3 consensus issues (enforced in `normalizePayload`)
- [x] Each issue has a one-line fix suggestion
- [x] Visually distinct from persona cards (full-width, red-tinted `RedFlagsSummary`)

---

## Phase 3 — User Surfaces (Days 3–4)

### M09 · Per-Slide Breakdown
**Status:** ✅ Complete  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** When PDF is uploaded with detectable slide structure, tag feedback to specific slides  
**Acceptance Criteria:**
- [x] Slide detection in `lib/slide-split.ts` (form-feed pages, `Slide N` headings, numbered sections)
- [x] Personas receive optional SLIDE MAP + `getPersonaSystemPromptWithSlides` → **Per slide** Markdown section
- [x] Targeted responses when ≥2 segments detected; otherwise flat pitch (no slides in POST body)
- [x] Falls back gracefully when slides can't be detected

---

### M10 · Founder Dashboard — Session History
**Status:** ✅ Complete  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Authenticated founders see list of past analyses with scores and dates  
**Acceptance Criteria:**
- [x] `/dashboard` lists analyses for founder / student / angel (empty state + rows); accelerator/mentor keep org shell
- [x] Row shows date, title, avg score; opens `/dashboard/analysis/[id]`
- [x] Detail page replays personas + conflict map + red flags (`AnalysisReplay`)
- [x] Supabase `analyses` table + `lib/analysis-store.ts` · `saveAnalysisAction` (role-gated save)

---

### M11 · Deck Improvement Tracker
**Status:** ✅ Complete  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Compare v1 vs v2 of same pitch — show score delta per persona  
**Acceptance Criteria:**
- [x] User picks two saved analyses on `/dashboard/compare` (baseline = v1, newer = v2)
- [x] Delta view: score Δ per persona, key concern before/after, new vs resolved consensus red flags (from synthesis)
- [x] Progress bars per persona (v1 vs v2 score width)
- [x] “Most improved lens” badge (largest positive score delta)

---

### M12 · Shareable Report Link
**Status:** ✅ Complete  
**Priority:** 🟡 P1  
**Hours:** 1.5  
**Description:** Generate a public URL for any analysis that can be shared with mentors/co-founders  
**Acceptance Criteria:**
- [x] Share panel on saved analysis detail (`ShareReportTools` + `createShareReportAction`)
- [x] Unique slug URL — `/r/[slug]` (hex slug)
- [x] Public view shows full analysis (`AnalysisReplay` with `publicView`) — no login required
- [ ] Password-protect — not implemented (optional in PRD)
- [x] Expiry: 7d / 30d / never (`shared_reports.expires_at`)

---

### M13 · PDF Export of Full Report
**Status:** ✅ MVP shipped  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Download the analysis as a branded PDF report  
**Acceptance Criteria:**
- [ ] "Download PDF" button on analysis page
- [ ] PDF includes: all 3 persona feedbacks, conflict map summary, red flags
- [ ] Contrario branding on report
- [ ] Generated server-side (not browser print)
- [ ] < 5MB file size

---

## Phase 4 — Multi-User Roles (Days 4–5)

### M14 · Accelerator Org Account
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 3  
**Description:** Organization-level account for accelerators to manage multiple founders/decks  
**Acceptance Criteria:**
- [ ] Create org with name, logo, invite code
- [ ] Invite members via email
- [ ] Admin sees all member analyses
- [ ] Org-level analytics: avg scores, most common red flags

---

### M15 · Bulk Deck Upload
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2.5  
**Description:** Accelerators upload up to 20 decks at once for batch analysis  
**Acceptance Criteria:**
- [ ] Multi-file upload UI (max 20 PDFs)
- [ ] Queue system — analyzes one at a time, shows progress
- [ ] Summary dashboard after batch completes
- [ ] Each deck gets individual analysis page

---

### M16 · Ranked Shortlist Dashboard
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2  
**Description:** After batch analysis, accelerator sees ranked list of decks by composite score  
**Acceptance Criteria:**
- [ ] Ranked table with: rank, company name, composite score, top red flag
- [ ] Sort by: composite score / individual persona score
- [ ] Flag/star decks for follow-up
- [ ] Export to CSV

---

### M17 · Custom Persona Weight Configuration
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2  
**Description:** Accelerators can adjust how much weight each persona gets in composite score  
**Acceptance Criteria:**
- [ ] Slider UI for each persona weight (must sum to 100%)
- [ ] Weights affect composite score only (not individual persona output)
- [ ] Preset configurations: "Seed Stage", "Deep Tech", "Consumer India"
- [ ] Custom config saved to org profile

---

### M18 · Angel Quick Triage Mode
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 1.5  
**Description:** Stripped-down single-page view for angels who want a 60-second read on a deck  
**Acceptance Criteria:**
- [ ] One-click "Quick Triage" mode from analysis
- [ ] Shows only: composite score, top 3 positives, top 3 concerns, invest/pass signal
- [ ] No persona breakdown in this view (collapsed by default)
- [ ] Shareable quick-triage link

---

### M19 · Investment Memo Draft Generator
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2  
**Description:** For angels — generate a structured 1-page investment memo from the analysis  
**Acceptance Criteria:**
- [ ] "Generate Memo" button on analysis page (angel role only)
- [ ] Memo structure: Company, Problem, Solution, Market, Team, Risks, Recommendation
- [ ] Editable before export
- [ ] Export as PDF or copy as markdown

---

### M20 · India Context Mode
**Status:** ✅ MVP shipped  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Toggle that adds India-specific benchmarks and context to all persona analysis  
**Acceptance Criteria:**
- [ ] Toggle switch "India Context Mode" on analysis page
- [ ] When ON: personas reference India-specific metrics (CAC in INR, India TAM, UPI/WhatsApp distribution, Tier 2/3 dynamics)
- [ ] When OFF: global investor lens
- [ ] Default ON for Indian founders

---

## Phase 5 — Platform (Days 5–6)

### M21 · Mentor Feedback Layer
**Status:** ✅ MVP shipped  
**Priority:** ⚪ P3  
**Hours:** 4  
**Description:** Human mentors can add their own annotations on top of AI analysis  
**Acceptance Criteria:**
- [ ] Mentor role can view any shared analysis
- [ ] Highlight + comment on specific AI feedback points
- [ ] Founder notified of mentor comments
- [ ] Thread-style discussion per comment

---

### M22 · Notification System
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2  
**Description:** Email notifications for key events  
**Acceptance Criteria:**
- [ ] Email when analysis completes (if left page)
- [ ] Weekly digest for active founders: "Your deck score this week"
- [ ] Notification when someone views shared report
- [ ] Unsubscribe works on first click

---

### M23 · Admin Analytics Dashboard
**Status:** ✅ MVP shipped  
**Priority:** 🟢 P2  
**Hours:** 2  
**Description:** Internal dashboard for Contrario admin to see usage stats  
**Acceptance Criteria:**
- [ ] Total analyses run (daily/weekly/monthly)
- [ ] Most common red flags across all decks (anonymized)
- [ ] User growth chart
- [ ] API cost tracker (Claude API spend)
- [ ] Admin role gated — not visible to regular users

---

### M24 · Waitlist + Referral System
**Status:** ✅ MVP shipped  
**Priority:** 🟡 P1  
**Hours:** 1.5  
**Description:** Pre-launch waitlist with referral mechanism to grow organic signups  
**Acceptance Criteria:**
- [ ] Waitlist form on landing page (before full launch)
- [ ] Each user gets a unique referral link
- [ ] Referral count tracked
- [ ] Early access unlocked at 3 referrals
- [ ] Basic leaderboard of top referrers

---

### M25 · API Access (Accelerator Integration)
**Status:** ✅ MVP shipped  
**Priority:** ⚪ P3  
**Hours:** 4  
**Description:** REST API for accelerators to integrate Contrario into their own application portals  
**Acceptance Criteria:**
- [ ] API key issuance system
- [ ] POST /v1/analyze endpoint (text or PDF URL)
- [ ] Webhook for analysis completion
- [ ] Rate limiting per API key
- [ ] API docs page

---

## Build Order (Recommended for Fellowship Deadline)

```
Day 1:  M00 ✅ → M01 → M02 → M03
Day 2:  M04 → M05 → M06 (START EARLY — most complex)
Day 3:  M06 (finish) → M07 → M08
Day 4:  M10 → M11 → M12 → M20
Day 5:  M13 → M24 → Polish + Testing
Day 6:  Buffer / Bug fixes / Deploy
```

---

## Validation Commands

```bash
# Validate all modules
node scripts/validate.js

# Validate specific module
node scripts/validate.js --module=M06

# Run pre-deploy checklist
node scripts/validate.js --pre-deploy
```

---

*Total estimated hours: 55–65 hours for P0+P1 | 25–30 hours for P0 only (fellowship MVP)*