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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
**Priority:** 🔴 P0  
**Hours:** 2  
**Description:** Drag-and-drop PDF upload, server-side text extraction using pdf-parse  
**Acceptance Criteria:**
- [ ] PDF upload UI with drag-and-drop
- [ ] Max file size: 10MB enforced
- [ ] Server action extracts clean text from PDF
- [ ] Extracted text passed to analysis engine
- [ ] Error state for corrupt/unreadable PDFs
- [ ] File stored in Supabase Storage (authenticated users only)

---

### M05 · Text / Idea Paste Input
**Status:** 🔲 Not started  
**Priority:** 🔴 P0  
**Hours:** 1  
**Description:** Alternative to PDF — paste pitch text or raw idea description  
**Acceptance Criteria:**
- [ ] Textarea with character count (min 100, max 5000)
- [ ] "What to include" helper tooltip
- [ ] Tab toggle between PDF upload and text paste
- [ ] Text passed to analysis engine same as PDF path

---

## Phase 2 — Core Engine (Days 2–3) 🔴 MOST CRITICAL

### M06 · Three-Persona Streaming Analysis Engine
**Status:** 🔲 Not started  
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
```
**Acceptance Criteria:**
- [ ] All 3 API calls fire in parallel (check with network tab)
- [ ] Streaming visible token-by-token per persona
- [ ] Each persona response structured: Rating (1-10) + 5 specific points + Key concern
- [ ] Total time to first token < 3 seconds
- [ ] Total analysis complete < 30 seconds
- [ ] Graceful error if one persona fails (other two continue)
- [ ] Guest mode: 1 free analysis, then prompt to sign up

---

### M07 · Conflict Map Output UI
**Status:** 🔲 Not started  
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
- [ ] 3-column layout responsive (stacked on mobile)
- [ ] Each card shows: Persona name, Score badge, 5 feedback points, Key concern
- [ ] Conflict map section below cards
- [ ] Green highlight = all 3 agree this is good
- [ ] Red highlight = all 3 flag this as a problem
- [ ] Yellow = 2 of 3 flag
- [ ] Smooth streaming animation (no layout shift)

---

### M08 · Consensus Red Flags Summary
**Status:** 🔲 Not started  
**Priority:** 🔴 P0  
**Hours:** 1.5  
**Description:** Auto-generated "The 3 things ALL investors flagged" section — the most actionable output  
**Acceptance Criteria:**
- [ ] Appears after all 3 streams complete
- [ ] Shows max 3 consensus issues
- [ ] Each issue has a one-line fix suggestion
- [ ] Visually distinct from persona cards (full-width, red-tinted)

---

## Phase 3 — User Surfaces (Days 3–4)

### M09 · Per-Slide Breakdown
**Status:** 🔲 Not started  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** When PDF is uploaded with detectable slide structure, tag feedback to specific slides  
**Acceptance Criteria:**
- [ ] Slide detection attempts to identify slide breaks in extracted text
- [ ] Each persona comment tagged to a slide number where possible
- [ ] "Slide 4: Market Size" section gets targeted feedback
- [ ] Falls back gracefully if slides can't be detected

---

### M10 · Founder Dashboard — Session History
**Status:** 🔲 Not started  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Authenticated founders see list of past analyses with scores and dates  
**Acceptance Criteria:**
- [ ] Dashboard page at /dashboard
- [ ] Lists all past analyses with: date, deck name, avg score across 3 personas
- [ ] Click to view full past analysis
- [ ] Empty state with CTA to run first analysis
- [ ] Data stored in Supabase

---

### M11 · Deck Improvement Tracker
**Status:** 🔲 Not started  
**Priority:** 🟡 P1  
**Hours:** 2  
**Description:** Compare v1 vs v2 of same pitch — show score delta per persona  
**Acceptance Criteria:**
- [ ] User can mark two analyses as "v1" and "v2" of same deck
- [ ] Delta view shows: score change per persona, new concerns, resolved concerns
- [ ] Visual progress bar per persona
- [ ] "Most improved" highlight

---

### M12 · Shareable Report Link
**Status:** 🔲 Not started  
**Priority:** 🟡 P1  
**Hours:** 1.5  
**Description:** Generate a public URL for any analysis that can be shared with mentors/co-founders  
**Acceptance Criteria:**
- [ ] "Share" button on analysis page
- [ ] Generates unique slug URL (contrario.app/r/[slug])
- [ ] Public view shows full analysis without requiring login
- [ ] Optional: password-protect the link
- [ ] Link has expiry option (7 days / 30 days / permanent)

---

### M13 · PDF Export of Full Report
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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
**Status:** 🔲 Not started  
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