---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
workflowStatus: complete
completedAt: '2026-04-13'
inputDocuments:
  - _bmad-output/ideas/batch-1-ideas.md
  - _bmad-output/ideas/batch-2-ideas.md
  - _bmad-output/ideas/batch-3-current-events-ideas.md
workflowType: 'prd'
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 3
  projectDocs: 0
classification:
  projectType: web_app
  domain: govtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - Nagrik

**Author:** Harigopal
**Date:** 2026-04-13

---

## Executive Summary

Nagrik is a civic accountability platform that transforms how Indian citizens report local issues and how government authorities are held responsible for resolving them. Citizens photograph any civic problem — garbage, potholes, broken streetlights, open drains — and submit in under 5 seconds. The report is GPS-tagged, AI-categorized, and automatically routed to the responsible ward authority. If unresolved within 48 hours, the issue escalates automatically up the government hierarchy, with each failure recorded publicly against the responsible official's name.

The platform serves two primary users: **citizens** who need a frictionless way to report issues and track resolution, and **government authorities** whose performance becomes publicly visible for the first time. A live civic health heat map colors every ward and city from green (responsive) to red (failing), giving citizens, journalists, and senior officials an instant read on accountability across any geography. A points-based scoring system and weekly leaderboard create competitive pressure among authorities to resolve issues faster.

**Target geography:** India, demo-scoped to Jaipur wards.
**Core problem:** India's civic failure is not a rules problem — it is a visibility problem. Authorities underperform because there are no consequences, no public record, and no escalation path that citizens can trigger. Nagrik closes all three gaps simultaneously.

### What Makes This Special

Most civic complaint systems are black boxes — citizens submit, nothing happens, the report disappears. Nagrik is structurally different in three ways:

1. **Public accountability by design.** Every unresolved issue is visible on the authority's public profile with their name attached. The leaderboard is not optional — it is the engine. Shame and recognition are both built into the product, not bolted on.

2. **Camera-first, zero-friction UX.** The app opens to a camera — identical to Snapchat. One tap to capture, one tap to submit. No forms, no category selection, no typing. AI handles categorization from the photo. This removes the single biggest barrier to civic reporting: effort.

3. **Autonomous escalation.** Citizens never have to follow up. The 48-hour clock runs automatically. If missed, the issue moves up the chain — with the failure logged — without any citizen action required. This is the first civic tool in India that makes the system work for the citizen, not against them.

**Core insight:** When authority performance is persistent, public, and tied to a real identity — behavior changes. The heat map does not just show cleanliness. It shows institutional accountability in real time.

**Why now:** Smartphone penetration in tier-2/3 India has crossed the threshold for mass civic participation. Digital India infrastructure (Aadhaar, UPI, government apps) has normalized digital interaction with public systems. Citizens are ready. The accountability layer does not yet exist.

**Classification:** Web App (Next.js PWA) · GovTech / Civic Tech · Medium complexity · Greenfield
**Tech Stack:** Next.js · Tailwind · shadcn/ui · Framer Motion · Clerk · Supabase · OpenAI API · Leaflet.js · Vercel

---

## Success Criteria

### User Success

**For citizens (demo users):**
- Opens app → camera launches instantly, no loading screen
- Issue submitted in under 10 seconds from open to confirmation
- User can see their report on the map + in "My Reports" within 30 seconds of submission
- User receives visible confirmation that report was routed to a named authority
- Leaderboard and heat map load and are readable within 2 seconds

**For authorities (demo accounts):**
- Authority logs into dashboard and sees pending issue queue immediately
- Can mark issue as resolved + upload proof photo in one flow
- Score updates visibly in real-time after resolution
- Can see their rank on the leaderboard

**The "aha!" moment for judges:** Citizen submits report on mobile → authority dashboard updates in real-time → heat map color shifts → leaderboard reorders. All in one screen demo.

### Business Success

**Hackathon success (April 18):**
- Judges score Nagrik in top 3 overall
- Demo runs without crash through the full 2-minute flow
- At least one judge asks "is this live?" or "can I use this?" — that's the real signal

**Real-world 3-month success:**
- 1 municipal corporation onboarded as pilot partner
- 500+ verified citizen reports submitted
- Average resolution time under 72 hours across all issues
- At least 30% of issues resolved without requiring escalation

**Real-world 12-month success:**
- 5+ cities active
- Government partnership or MoU with 1 state municipal body
- 10,000+ active citizen reporters
- Public press coverage as civic accountability tool

### Technical Success

- Mobile-optimized PWA loads under 3 seconds on 4G
- Camera access + GPS permissions granted on first prompt
- Supabase real-time updates reflect within 1 second on authority dashboard
- OpenAI vision categorization returns result within 3 seconds of photo submission
- Leaflet.js heat map renders with 20+ ward polygons without lag
- Clerk auth flow (citizen + authority login) under 30 seconds end-to-end
- Demo works fully on dummy Jaipur data with zero live API dependencies required

### Measurable Outcomes (Hackathon scope)

| Metric | Target |
|---|---|
| Report submission time | < 10 seconds |
| AI categorization accuracy (demo) | 100% on pre-tested photo set |
| Dashboard real-time update | < 1 second |
| Map render time | < 2 seconds |
| Full demo flow duration | 90–120 seconds |
| Clerk auth setup time | < 30 seconds per user type |

---

## User Journeys

### Journey 1 — Priya, The Frustrated Citizen (Primary — Happy Path)

**Persona:** Priya, 28, school teacher in Vaishali Nagar, Jaipur. Walks the same street daily. 3-month-old garbage pile at the corner — smells, attracts stray dogs, students have to walk around it. Complained to neighbors, posted on local Facebook groups. Nothing happened. She feels invisible.

**Opening scene:** Monday morning. She walks past the garbage again. A neighbor mentions Nagrik.

**Journey:**
1. Opens Nagrik → camera launches immediately, no splash screen, no onboarding wall
2. Points at garbage, taps shutter → photo taken
3. 2-second AI analysis: *"Garbage / Waste Dumping — Moderate"* + GPS tag: *"Ramchandra Marg, Ward 14, Jaipur"*
4. Pre-filled card shown: issue type, location, severity → one tap: **Submit**
5. Confirmation: *"Sent to Ward Officer Suresh Meena. He has 48 hours to resolve this."* — she sees his name, photo, current score: 71/100
6. Switches to map → Ward 14 glows yellow — she sees the pattern
7. Thursday: push notification — *"Issue #JN-0042 resolved by Suresh Meena. View proof."* → before/after photos confirm clean corner
8. First time in years she feels someone listened

**Emotional arc:** Resignation → Skepticism → Surprise → Satisfaction → Trust

**Capabilities revealed:** Camera-first UI · AI categorization · GPS routing · Authority profile display · Real-time map · Resolution notification · Before/after photo proof

---

### Journey 2 — Arvind, The Escalation Path (Primary — Edge Case)

**Persona:** Arvind, 45, small shop owner in Pink City. Pothole outside his shop — cars swerve dangerously. Reported twice through municipality's official portal in the last year. Both times: silence. Skeptical of every new "civic" app.

**Journey:**
1. Reports pothole → AI: *"Road — Pothole — Severe"* → 24-hour SLA (not 48) triggered
2. Routed to Ward Officer Deepak Sharma — score: 43/100, already orange on map
3. 24 hours pass, no action → system auto-fires: Deepak -5 points → score 38 → ward shifts toward red
4. Issue escalates to Deputy Commissioner Anita Rawat — flagged: *"Escalated from Ward 7 — 1 failure logged"*
5. Anita calls Deepak directly. Road crew dispatched within 6 hours
6. Arvind notified: *"Resolved after escalation. Ward Officer penalized."*
7. Arvind opens leaderboard → Ward 7 near bottom → screenshots and posts publicly

**Emotional arc:** Cynicism → Watchful → Surprise → Vindication → Advocacy

**Capabilities revealed:** Severity-based SLAs · Escalation engine · Auto-penalty scoring · Senior authority dashboard · Public leaderboard · Escalation trail visibility

---

### Journey 3 — Suresh, The Responsive Ward Officer (Authority — Success Path)

**Persona:** Suresh Meena, 38, Ward Officer for Ward 14. Manages sanitation, roads, streetlights for 12,000 residents. Complaints arrive scattered — WhatsApp, phone, in-person. No system. No way to show seniors what he's actually resolving.

**Journey:**
1. Registered as verified authority → dashboard goes live
2. Monday morning: queue shows 3 new issues since Sunday
3. Issue #JN-0042: Garbage, Ramchandra Marg, Moderate, 48hr clock running
4. Assigns to sanitation team, marks *"In Progress"* in Nagrik
5. Wednesday: team sends resolved photo → he uploads proof → marks resolved
6. Score: 71 → 73 → ward edges greener on map
7. Friday: ranked 4th in Jaipur for garbage resolution speed → shares with team
8. End of month: senior pulls his Nagrik report card — 23 issues, 20 resolved on time — first time Suresh has data to prove his work

**Emotional arc:** Overwhelmed → Organised → Motivated → Proud → Empowered

**Capabilities revealed:** Authority issue queue · In-progress status · Resolution upload · Real-time score · Leaderboard ranking · Monthly report card

---

### Journey 4 — Anita, The Senior Authority (District Oversight)

**Persona:** Anita Rawat, Deputy Municipal Commissioner, Jaipur. Oversees 32 ward officers. Zero visibility into ward-level performance — only hears about failures when citizens call MLAs.

**Journey:**
1. Admin account activated → district-level dashboard live
2. Monday: heat map shows Ward 7 and Ward 19 in orange — 4 escalations each in past week
3. Clicks Ward 7 → Deepak Sharma profile: score 43, 6 escalations, 60% resolution rate
4. Calls Deepak with data — not complaints, numbers
5. By end of week Deepak improves to 67 → Ward 7 shifts yellow
6. Monthly commissioner meeting: presents Nagrik city-wide leaderboard → 3 lowest-scoring ward officers given improvement targets — data is undeniable

**Emotional arc:** Blind → Informed → Empowered → Decisive → Systematic

**Capabilities revealed:** District heat map · Multi-ward oversight · Officer profile drill-down · Escalation inbox · Aggregate performance reporting

---

### Journey Requirements Summary

| Journey | Capabilities Required |
|---|---|
| Priya (citizen, happy path) | Camera UI · AI categorization · GPS routing · Authority profile · Map · Notifications · Before/after proof |
| Arvind (citizen, escalation) | Severity SLAs · Auto-escalation engine · Penalty scoring · Senior authority dashboard · Public leaderboard |
| Suresh (ward officer) | Issue queue · In-progress status · Resolution upload · Real-time score · Leaderboard · Monthly report |
| Anita (senior authority) | District heat map · Multi-ward dashboard · Officer profile drill-down · Escalation inbox · Aggregate reports |

---

## Domain-Specific Requirements

### Privacy & Data Handling
- Citizen photos and GPS coordinates stored in Supabase with row-level security — only the reporting citizen and the assigned authority can access original report data
- Phone numbers and personal details never displayed publicly — only username/avatar shown on leaderboard
- GPS coordinates rounded to ward-level on public map (no exact addresses shown publicly)
- No PII stored beyond what Clerk auth provides

### Data Integrity (Anti-Abuse)
- OpenAI vision API validates submitted photo contains a real civic issue before accepting report
- Rate limiting: maximum 10 reports per user per 24 hours
- Duplicate detection: same GPS coordinates with 3+ reports within 6 hours → merged into one case with elevated priority
- Authority accounts pre-registered by admin — no self-registration for authorities

### Transparency Standards
- All escalation events logged with timestamps — publicly visible on issue detail page
- Authority scores calculated from verifiable events only (resolution uploads, escalation timestamps) — not manually editable
- Before/after resolution photos are permanent — cannot be deleted once uploaded
- Ward civic health scores calculated from rolling 30-day window

### Accessibility (India-Specific)
- All citizen-facing UI supports Hindi toggle (key labels, status messages, notifications)
- Camera-first UX requires no reading to submit — icons and visual cues carry the interface
- Offline-tolerant: report data queued locally if connectivity drops, auto-retries on reconnect
- Works on mid-range Android browsers (Chrome 90+)

### Trust Signals (Demo)
- Authority profiles show: name, ward, profile photo, score, resolution rate, time on platform
- Verified badge on authority accounts (admin-granted)
- All dummy data uses realistic Jaipur ward names and officer names for demo credibility

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Autonomous Civic Escalation Engine**
Every existing Indian grievance system (CPGRAMS, state portals, LocalCircles) requires citizens to manually follow up when ignored. Nagrik inverts this — escalation runs automatically with zero citizen action after initial submission. The system becomes an advocate on the citizen's behalf.

**2. Accountability by Design — Public Shame as a Product Feature**
Most civic platforms treat transparency as an admin-only dashboard. Nagrik makes authority performance a live public artifact — visible to citizens, seniors, and the press by default. The ward heat map and leaderboard are not bolted onto a complaint system — they *are* the product. Shame and recognition mechanics are structural, not optional.

**3. Camera-First, Zero-Friction Civic UX**
Applying the Snapchat interaction model (open = camera) to civic reporting removes the largest barrier: effort. Existing apps require login → menu → category → description → photo → location → submit. Nagrik: open → tap → done. AI handles all classification from the photo.

**4. AI-Powered Categorization + Routing from Photo**
No existing Indian civic platform uses computer vision to automatically classify and route issues. Citizens currently select from dropdown menus — a friction point that reduces submission rates. OpenAI Vision categorization eliminates this step and enables accurate severity scoring without user input.

**5. Real-Time Civic Health Visualization**
The green-to-red ward heat map updates in real-time as issues are reported and resolved. No Indian municipal platform exposes live governance performance data at ward level to the public. This creates a new category of civic intelligence.

### Market Context & Competitive Landscape

| Solution | What it does | What's missing |
|---|---|---|
| CPGRAMS (India) | Central govt grievance portal | Black box — no public visibility, no escalation, no AI |
| MyGov India | Citizen participation platform | Not accountability enforcement |
| LocalCircles | Community issues discussion | Discussion only, no authority routing |
| Fix My Street (UK) | Street issue reporting | No escalation, no shame mechanism, not India-specific |
| Swachhata App (India) | Sanitation complaints | Single category, no leaderboard, no heat map |

**Nagrik's gap:** Intersection of behavioral design (public accountability) + autonomous systems (escalation) + AI (photo categorization) + real-time visualization — applied to Indian civic governance. No existing solution combines all four.

### Validation Approach

**Hackathon:** Live demo runs citizen → authority → resolution → map update loop in real-time. Judges can submit a test report and watch authority dashboard update within seconds. Heat map color shift visible on-screen.

**Production:** Pilot with one Jaipur ward — track average resolution time before vs. after. Measure escalation rate as proxy for authority responsiveness. Track citizen repeat-usage rate.

### Risk Mitigation

| Innovation Risk | Mitigation |
|---|---|
| AI categorization misclassifies photo | Show AI result to user before submit — one-tap correction available |
| Authorities ignore the app entirely | Senior authority dashboard makes non-use visible to superiors |
| Fake report flooding | Rate limiting (10/day) + AI validity check before accepting |
| Heat map data feels manipulated | All scoring events timestamped and publicly logged — auditable |
| Demo AI call fails at venue | Pre-categorized photo set as fallback — full flow still demonstrated |

---

## Web App Specific Requirements

### Project-Type Overview

Nagrik is a Single Page Application (SPA) built with Next.js App Router — mobile-first PWA that doubles as a desktop dashboard. Two distinct layout modes share the same codebase: a phone-optimized citizen interface (camera-first, bottom nav, large tap targets) and a desktop-optimized authority/admin dashboard (sidebar nav, data tables, charts). Real-time data sync via Supabase is central to the product experience.

### Browser Matrix

| Browser | Min Version | Priority |
|---|---|---|
| Chrome Android | 90+ | P0 — primary citizen device |
| Chrome Desktop | 90+ | P0 — authority dashboard |
| Safari iOS | 14+ | P1 — secondary citizen device |
| Firefox | 88+ | P2 |
| Samsung Internet | 14+ | P1 — common on budget Android |

### Responsive Design

- **Mobile (< 768px):** Camera-first full-screen on open. Bottom nav (4 tabs: Report, Map, Leaderboard, Profile). Touch targets minimum 48×48px. No hover states.
- **Desktop (≥ 1024px):** Sidebar navigation. Dashboard grid. Data tables for issue queue. Full-screen Leaflet map with side panel.
- **Tablet (768–1023px):** Desktop layout, touch-optimized.
- shadcn/ui throughout — rounded corners, modern aesthetic, zero government styling.
- Framer Motion for: page transitions, card entry animations, score counter increments, heat map color transitions.

### Performance Targets

All performance targets are specified as measurable NFRs (NFR1–NFR7) in the Non-Functional Requirements section.

### Real-Time Architecture

Supabase real-time subscriptions:
- `issues:ward_id=eq.{wardId}` — authority receives new reports for their ward
- `authorities:id=eq.{authorityId}` — authority score updates live
- `wards:city=eq.jaipur` — heat map color recalculation triggers

Real-time used for: new issue appearing in authority queue · score counter animation on resolution/escalation · ward color shift on map · citizen "My Reports" status updates.

### SEO Strategy

- Public pages (heat map, leaderboard, authority profiles): Next.js SSR — server-rendered and indexable
- Citizen submission + authority dashboard: client-only behind Clerk auth — not indexed
- OG tags on Jaipur map page for shareability

### Accessibility

- Target: WCAG 2.1 AA for core citizen flows
- Hindi toggle on all citizen-facing UI
- All icons have text labels — no icon-only buttons
- Color never sole indicator of status — tooltips and text badges accompany all color states
- Focus states visible on all interactive elements

### Implementation Considerations

- Next.js App Router: server components for SSR pages, client components for real-time
- No native device APIs beyond camera (getUserMedia) and GPS (Geolocation API) — both in mobile browsers
- PWA manifest configured for "Add to Home Screen" on Android Chrome
- Next.js Image component for all uploads — auto WebP, lazy loading
- All API keys via `.env.local` — never exposed client-side except Clerk/Supabase public keys

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — complete end-to-end demonstration of the core accountability loop. Every feature included serves the 90-second demo flow. Every deferred feature is explicitly documented, not forgotten.

**Demo-first principle:** Build the happy path to perfection. One flawless demo beats ten half-built features.

**Resource requirements:**

| Role | Person | Focus |
|---|---|---|
| Builder (AI-powered) | Harigopal | Next.js app, Supabase schema, API integrations |
| Designer | Teammate 1 | shadcn customization, dummy data, Figma |
| Researcher / Pitcher | Teammate 2 | Jaipur ward data, authority profiles, pitch deck, demo script |

### MVP Feature Set (Phase 1 — Hackathon Build)

**Core journeys supported:** Priya (citizen happy path) + Suresh (authority resolution)

| # | Feature | Priority |
|---|---|---|
| 1 | Camera-first mobile UI (open = camera) | P0 |
| 2 | Photo capture + GPS tag | P0 |
| 3 | OpenAI Vision categorization | P0 |
| 4 | Issue submission → Supabase write | P0 |
| 5 | Auto-routing to ward authority (dummy accounts) | P0 |
| 6 | Authority dashboard — pending issue queue | P0 |
| 7 | Mark resolved + upload proof photo | P0 |
| 8 | Real-time score update (Supabase realtime) | P0 |
| 9 | Leaflet heat map — Jaipur wards, green to red | P0 |
| 10 | Ward color update when score changes | P0 |
| 11 | Weekly leaderboard by issue category | P1 |
| 12 | Clerk auth — citizen + authority roles | P0 |
| 13 | 20+ pre-loaded dummy reports (Jaipur) | P0 |
| 14 | Authority public profile (name, score, rate) | P0 |

**Explicitly deferred from MVP:** 48-hour escalation timer · My Reports page · Hindi toggle · Voice report · Duplicate detection · Before/after AI verification

### Post-MVP Features

**Phase 2 — Growth (1–3 months):**
- Real authority registration + admin verification
- 48-hour escalation engine with SMS/WhatsApp notifications
- Citizen push notifications + My Reports tracking
- Duplicate report detection and merging
- Multi-city support (Jodhpur, Udaipur)
- Hindi language toggle full implementation
- PWA offline report queue

**Phase 3 — Expansion (3–12 months):**
- AI resolution verifier (before/after comparison)
- Pattern analyzer — proactive weekly authority alerts
- Monthly ward report card PDF
- Open data API for journalists/researchers
- Government partnership onboarding
- CPGRAMS integration
- National multi-state rollout infrastructure

### Risk Mitigation Strategy

**Technical risks:**

| Risk | Mitigation |
|---|---|
| OpenAI API slow/fails at venue | Pre-cache categorization for demo photos. Fallback: pre-categorized result |
| Supabase realtime not updating | Test on venue WiFi Day 3. Fallback: manual refresh |
| Leaflet ward polygons missing | Source Jaipur GeoJSON Day 1, store locally |
| Clerk auth breaks on demo device | Pre-login all demo accounts, keep sessions active |
| Camera permission denied | Test Day 3. Fallback: file upload button |

**Market risks:**

| Risk | Mitigation |
|---|---|
| Judges unfamiliar with civic tech | Open with Priya's story — emotion before technology |
| Another team builds similar | Lead with live heat map — most visual differentiator |
| Judges question technical depth | Three layers: OpenAI Vision + Supabase realtime + Leaflet 20+ polygons |

**Resource risks:**

| Risk | Mitigation |
|---|---|
| Builder falls behind | Day 1 = P0 only. Day 2 = P1. Day 3 = polish. No new features after Day 2 |
| Design not ready | shadcn defaults Day 1–2. Polish is Day 3 only |
| Demo breaks at venue | 90-second screen recording ready as fallback |

---

## Functional Requirements

### Issue Reporting

- **FR1:** Citizen can capture a photo of a civic issue directly within the app without switching to an external camera app
- **FR2:** Citizen can submit an issue report with a single tap after photo capture
- **FR3:** Citizen can view the AI-assigned category and severity of their report before final submission
- **FR4:** Citizen can correct the AI-assigned category if incorrect before submitting
- **FR5:** Citizen can track the real-time status of their submitted reports
- **FR6:** Citizen can receive a notification when their reported issue changes status or is resolved

### AI & Intelligent Routing

- **FR7:** System can automatically capture GPS coordinates from the device at the moment of photo capture
- **FR8:** System can analyze a submitted photo and classify the civic issue type (garbage, pothole, drainage, streetlight, other)
- **FR9:** System can assign a severity level (minor, moderate, critical) to each issue based on photo analysis
- **FR10:** System can identify the responsible ward authority based on GPS coordinates of the reported issue
- **FR11:** System can deliver an immediate notification to the assigned authority upon issue submission
- **FR12:** System can validate that a submitted photo contains a genuine civic issue before accepting the report
- **FR13:** System can merge multiple reports of the same issue in the same location into a single case with elevated priority

### Authority Resolution

- **FR14:** Authority can view all pending issues assigned to their ward in a real-time queue
- **FR15:** Authority can view full issue details: photo, GPS location, AI-assigned category, severity, and submission timestamp
- **FR16:** Authority can update an issue status (Pending → In Progress → Resolved)
- **FR17:** Authority can upload a resolution photo as proof that the issue has been addressed
- **FR18:** Authority can view their current performance score, resolution rate, and weekly rank

### Accountability Engine

- **FR19:** System can automatically calculate and update authority performance scores based on resolution and escalation events
- **FR20:** System can automatically escalate an unresolved issue to the next authority tier when the SLA window expires
- **FR21:** System can apply a point penalty to an authority whose issue is escalated due to inaction
- **FR22:** System can apply a point bonus to an authority who resolves an issue ahead of the SLA deadline
- **FR23:** System can record all escalation events with timestamps in a publicly visible and permanent audit trail
- **FR24:** System can prevent manual modification of authority scores — scores change only via verified system events
- **FR25:** System can enforce different SLA windows based on issue severity (critical = shorter window)

### Civic Intelligence

- **FR26:** Any visitor can view a real-time heat map displaying the civic health score of each ward in Jaipur
- **FR27:** Any visitor can drill into a specific ward to view recent issues, resolution rate, and assigned authority profile
- **FR28:** System can update ward color on the heat map in real-time when the ward's aggregate score crosses a color threshold
- **FR29:** Any visitor can view a weekly leaderboard ranking authorities by resolution performance
- **FR30:** Any visitor can filter the leaderboard by issue category
- **FR31:** Any visitor can view an authority's public profile including name, ward, photo, score, resolution rate, and escalation history
- **FR32:** Any visitor can view the full public audit trail of any individual issue including all status changes and escalation events

### User & Access Management

- **FR33:** Citizen can create an account and authenticate using email or social login
- **FR34:** Authority can authenticate into a dedicated dashboard with role-specific capabilities separate from the citizen interface
- **FR35:** Admin can create, verify, and manage authority accounts and assign them to specific wards
- **FR36:** System can restrict issue resolution and proof upload capabilities to verified authority accounts only
- **FR37:** System can display a verified badge on authenticated authority public profiles

### Data & Transparency

- **FR38:** System can store citizen report data with access restricted to the submitting citizen and the assigned authority
- **FR39:** System can enforce a submission rate limit per citizen account to prevent spam
- **FR40:** System can store before/after resolution photos permanently with no deletion capability after upload
- **FR41:** System can pre-load demonstration data including Jaipur ward reports, authority accounts, and scores for hackathon demo
- **FR42:** System can calculate ward civic health scores from a rolling 30-day event window

---

## Non-Functional Requirements

### Performance

- **NFR1:** App must launch and display camera viewfinder within 500ms of opening on Chrome Android 90+
- **NFR2:** Issue submission round-trip (photo upload → OpenAI categorization → Supabase write → confirmation) must complete within 3 seconds on 4G
- **NFR3:** Leaflet heat map must render all Jaipur ward polygons and color overlays within 2 seconds of page load
- **NFR4:** Supabase real-time events must appear on subscribed dashboards within 1 second of the database write
- **NFR5:** Leaderboard must load within 1 second — scores are pre-computed, not calculated at query time
- **NFR6:** First Contentful Paint must be under 1.5 seconds on 4G
- **NFR7:** JavaScript bundle must not exceed 200kb gzipped

### Security

- **NFR8:** All data in transit must be encrypted via HTTPS/TLS
- **NFR9:** Citizen report photos and GPS coordinates stored with Supabase Row-Level Security — accessible only to submitting citizen and assigned ward authority
- **NFR10:** Authority dashboard routes protected behind Clerk authentication — unauthenticated users redirected to login
- **NFR11:** OpenAI API key must never be exposed client-side — all OpenAI calls route through Next.js server actions
- **NFR12:** Rate limiting of 10 reports per citizen per 24 hours enforced server-side
- **NFR13:** Authority score records write-protected from direct user modification — scores update only via server-side event handlers

### Reliability

- **NFR14:** App must function fully on pre-loaded dummy data with no dependency on live external APIs — all demo flows survivable if OpenAI or Supabase real-time is unavailable
- **NFR15:** Report submission must queue locally if network is lost mid-submission and auto-retry on reconnect
- **NFR16:** All Jaipur ward GeoJSON must be bundled locally — heat map renders without external map tile API
- **NFR17:** A pre-recorded 90-second demo video must exist as venue fallback if live app fails during judging

### Accessibility

- **NFR18:** All citizen-facing interactive elements must have minimum touch target size of 48×48px
- **NFR19:** App must not rely on color alone to communicate status — every color state has accompanying text label or icon
- **NFR20:** Core citizen flows must be navigable without reading — icons and visual affordances carry primary meaning
- **NFR21:** Camera permission prompt, submission confirmation, and status notifications must display in both English and Hindi
- **NFR22:** Authority dashboard must be fully keyboard-navigable on desktop
- **NFR23:** App must be functional on Samsung Internet 14+ and Chrome Android 90+

### Integration

- **NFR24:** OpenAI Vision API calls must include 5-second timeout — on timeout, fall back to "Other" category and allow citizen correction
- **NFR25:** Supabase client must implement automatic reconnection — real-time subscriptions resume within 3 seconds of network restoration
- **NFR26:** Clerk authentication sessions must persist across page refreshes within a 7-day window
- **NFR27:** Leaflet.js must load from locally bundled source — no CDN dependency
- **NFR28:** All Vercel deployments via CI/CD push — no manual file uploads

### Scalability

- **NFR29:** Supabase schema must support at least 10 cities and 500 wards without schema changes — city and ward are parameters
- **NFR30:** Leaderboard query must remain under 500ms with up to 1,000 authority records
- **NFR31:** Real-time subscriptions must support at least 50 concurrent authority dashboard connections without degradation
