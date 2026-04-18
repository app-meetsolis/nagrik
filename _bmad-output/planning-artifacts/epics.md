---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowStatus: in_progress
---

# Nagrik - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Nagrik, decomposing requirements from the PRD and Architecture into implementable stories. Scope: **hackathon MVP only (P0 + P1 features)**. Target build window: **2 days (April 15–16)**. April 17 = polish + pitch. All deferred Phase 2+ features are explicitly excluded.

## Requirements Inventory

### Functional Requirements

FR1: Citizen can capture a photo of a civic issue directly within the app without switching to an external camera app
FR2: Citizen can submit an issue report with a single tap after photo capture
FR3: Citizen can view the AI-assigned category and severity of their report before final submission
FR4: Citizen can correct the AI-assigned category if incorrect before submitting
FR5: Citizen can track the real-time status of their submitted reports
FR6: Citizen can receive a notification when their reported issue changes status or is resolved
FR7: System can automatically capture GPS coordinates from the device at the moment of photo capture
FR8: System can analyze a submitted photo and classify the civic issue type (garbage, pothole, drainage, streetlight, other)
FR9: System can assign a severity level (minor, moderate, critical) to each issue based on photo analysis
FR10: System can identify the responsible ward authority based on GPS coordinates of the reported issue
FR11: System can deliver an immediate notification to the assigned authority upon issue submission
FR12: System can validate that a submitted photo contains a genuine civic issue before accepting the report
FR13: System can merge multiple reports of the same issue in the same location into a single case with elevated priority
FR14: Authority can view all pending issues assigned to their ward in a real-time queue
FR15: Authority can view full issue details: photo, GPS location, AI-assigned category, severity, and submission timestamp
FR16: Authority can update an issue status (Pending → In Progress → Resolved)
FR17: Authority can upload a resolution photo as proof that the issue has been addressed
FR18: Authority can view their current performance score, resolution rate, and weekly rank
FR19: System can automatically calculate and update authority performance scores based on resolution and escalation events
FR20: System can automatically escalate an unresolved issue to the next authority tier when the SLA window expires
FR21: System can apply a point penalty to an authority whose issue is escalated due to inaction
FR22: System can apply a point bonus to an authority who resolves an issue ahead of the SLA deadline
FR23: System can record all escalation events with timestamps in a publicly visible and permanent audit trail
FR24: System can prevent manual modification of authority scores — scores change only via verified system events
FR25: System can enforce different SLA windows based on issue severity (critical = shorter window)
FR26: Any visitor can view a real-time heat map displaying the civic health score of each ward in Jaipur
FR27: Any visitor can drill into a specific ward to view recent issues, resolution rate, and assigned authority profile
FR28: System can update ward color on the heat map in real-time when the ward's aggregate score crosses a color threshold
FR29: Any visitor can view a weekly leaderboard ranking authorities by resolution performance
FR30: Any visitor can filter the leaderboard by issue category
FR31: Any visitor can view an authority's public profile including name, ward, photo, score, resolution rate, and escalation history
FR32: Any visitor can view the full public audit trail of any individual issue including all status changes and escalation events
FR33: Citizen can create an account and authenticate using email or social login
FR34: Authority can authenticate into a dedicated dashboard with role-specific capabilities separate from the citizen interface
FR35: Admin can create, verify, and manage authority accounts and assign them to specific wards
FR36: System can restrict issue resolution and proof upload capabilities to verified authority accounts only
FR37: System can display a verified badge on authenticated authority public profiles
FR38: System can store citizen report data with access restricted to the submitting citizen and the assigned authority
FR39: System can enforce a submission rate limit per citizen account to prevent spam
FR40: System can store before/after resolution photos permanently with no deletion capability after upload
FR41: System can pre-load demonstration data including Jaipur ward reports, authority accounts, and scores for hackathon demo
FR42: System can calculate ward civic health scores from a rolling 30-day event window

### NonFunctional Requirements

NFR1: App must launch and display camera viewfinder within 500ms of opening on Chrome Android 90+
NFR2: Issue submission round-trip must complete within 3 seconds on 4G
NFR3: Leaflet heat map must render all Jaipur ward polygons within 2 seconds of page load
NFR4: Supabase real-time events must appear on subscribed dashboards within 1 second of the database write
NFR5: Leaderboard must load within 1 second — scores are pre-computed
NFR6: First Contentful Paint must be under 1.5 seconds on 4G
NFR7: JavaScript bundle must not exceed 200kb gzipped
NFR8: All data in transit encrypted via HTTPS/TLS
NFR9: Citizen report photos and GPS stored with Supabase Row-Level Security
NFR10: Authority dashboard routes protected behind Clerk authentication
NFR11: OpenAI API key never exposed client-side — all calls via Next.js server actions
NFR12: Rate limiting of 10 reports per citizen per 24 hours enforced server-side
NFR13: Authority score records write-protected from direct user modification
NFR14: App must function fully on pre-loaded dummy data with no live API dependency
NFR15: Report submission must queue locally if network lost and auto-retry on reconnect
NFR16: Jaipur ward GeoJSON bundled locally — heat map renders without external map tile API
NFR17: A pre-recorded 90-second demo video must exist as venue fallback
NFR18: All citizen-facing interactive elements must have minimum touch target size of 48×48px
NFR19: App must not rely on color alone to communicate status
NFR20: Core citizen flows must be navigable without reading
NFR21: Camera permission prompt, submission confirmation, status notifications display in English and Hindi
NFR22: Authority dashboard must be fully keyboard-navigable on desktop
NFR23: App must be functional on Samsung Internet 14+ and Chrome Android 90+
NFR24: OpenAI Vision API calls must include 5-second timeout — fallback to "Other" category
NFR25: Supabase client must implement automatic reconnection within 3 seconds
NFR26: Clerk authentication sessions persist across page refreshes within 7-day window
NFR27: Leaflet.js must load from locally bundled source — no CDN dependency
NFR28: All Vercel deployments via CI/CD push
NFR29: Supabase schema must support at least 10 cities and 500 wards without schema changes
NFR30: Leaderboard query must remain under 500ms with up to 1,000 authority records
NFR31: Real-time subscriptions must support at least 50 concurrent authority dashboard connections

### Additional Requirements

- Project init: `npx create-next-app@latest nagrik --typescript --tailwind --eslint --app --src-dir` + shadcn init + dependency install
- DB: Supabase tables `issues`, `authorities`, `wards`, `citizens` + RLS policies — created incrementally per epic, only the tables each epic needs
- Auth: Clerk 3-role model (citizen, authority, admin) + `src/middleware.ts` route protection
- Server Actions: All OpenAI + score writes in `src/actions/` — never in client components
- `ActionResult<T>`: Every server action returns `{ success: true; data: T } | { success: false; error: string; code?: string }`
- `RealtimeProvider`: Context wrapper for authority dashboard layout managing Supabase channels
- Local GeoJSON: Jaipur wards at `public/geo/jaipur-wards.geojson`
- Seed data: 20+ pre-loaded Jaipur reports, 5 authority accounts, ward scores (FR41)
- Demo fallback: Pre-categorized photo set + all demo accounts pre-logged-in before judging

### UX Design Requirements

UX-DR1: App opens directly to camera viewfinder — no splash screen, no onboarding wall (Snapchat model)
UX-DR2: Mobile layout uses bottom navigation (4 tabs: Report, Map, Leaderboard, Profile)
UX-DR3: Desktop authority layout uses sidebar navigation with data tables and full-screen map panel
UX-DR4: All touch targets minimum 48×48px — no hover-only states on mobile
UX-DR5: shadcn/ui component style — rounded, modern, zero government aesthetic
UX-DR6: Framer Motion for: page transitions, score counter increments, heat map color transitions, card entry animations
UX-DR7: Issue submission pre-filled card (AI result) shown before final submit tap — one correction allowed
UX-DR8: Authority profile card shows: name, ward, photo, score (animated counter), resolution rate, verified badge

### FR Coverage Map

| FR | Epic | Story |
|---|---|---|
| FR1–4 | Epic 1 | 1.4, 1.5, 1.6, 1.7 |
| FR5 | Epic 1 | 1.7 |
| FR6 | Epic 2 | 2.2 |
| FR7–10 | Epic 1 | 1.5, 1.6, 1.7 |
| FR11 | Epic 2 | 2.2 |
| FR12–13 | Epic 1 | 1.6, 1.7 |
| FR14–15 | Epic 2 | 2.2 |
| FR16–17 | Epic 2 | 2.3 |
| FR18 | Epic 2 | 2.4 |
| FR19, FR22 | Epic 2 | 2.4 |
| FR20–21, FR23–25 | Epic 4 | 4.2 |
| FR26–28 | Epic 3 | 3.1 |
| FR29–30 | Epic 3 | 3.2 |
| FR31–32 | Epic 3 | 3.3 |
| FR33 | Epic 1 | 1.3 |
| FR34, FR36 | Epic 2 | 2.1 |
| FR35 | Epic 4 | 4.1 |
| FR37 | Epic 2 | 2.4 |
| FR38–39 | Epic 1 | 1.2, 1.7 |
| FR40 | Epic 2 | 2.3 |
| FR41 | Epic 4 | 4.1 |
| FR42 | Epic 4 | 4.2 |

## Epic List

### Epic 1: Citizen Can Report Civic Issues
Citizens can create an account, open the app to a camera, photograph a civic issue, receive AI categorization, and submit a geotagged report in under 10 seconds. Includes all project and database foundation needed to support this flow.
**FRs covered:** FR1–5, FR7–13, FR33, FR38–39

### Epic 2: Authorities Can Manage and Resolve Issues
Authorities can log into a dedicated dashboard, see new issues appear in real-time, update status, resolve with proof photos, and watch their performance score update live.
**FRs covered:** FR6, FR14–19, FR22, FR34, FR36–37, FR40

### Epic 3: Public Can See Accountability Data
Any visitor can view the Jaipur ward heat map colored by authority performance, browse the weekly leaderboard, and drill into any authority's full public profile.
**FRs covered:** FR26–32, FR42

### Epic 4: Demo Is Production-Ready
The full demo loop runs flawlessly — seeded Jaipur data, accountability score engine wired end-to-end, OpenAI fallback tested, Hindi labels added, 90-second recording complete.
**FRs covered:** FR20–21, FR23–25, FR35, FR41

---

## Epic 1: Citizen Can Report Civic Issues

Citizens can create an account, open the app directly to a camera, photograph a civic issue, have it AI-categorized and GPS-tagged automatically, and submit the report in under 10 seconds. This epic includes all project scaffolding and database foundation needed to support the citizen flow — no separate technical epic.

### Story 1.1: Project Scaffolding and Deployment

As a developer,
I want the project initialized, all dependencies installed, and deployed to Vercel,
So that every subsequent story can build on a running, deployable foundation.

**Acceptance Criteria:**

**Given** a fresh machine with Node.js and pnpm installed
**When** I run the initialization sequence
**Then** `npx create-next-app@latest nagrik --typescript --tailwind --eslint --app --src-dir` completes with no errors
**And** `pnpm dlx shadcn@latest init` completes and `components.json` is created
**And** `pnpm add @clerk/nextjs @supabase/supabase-js @supabase/ssr framer-motion leaflet react-leaflet openai` installs without errors
**And** `src/types/actions.ts` exports `ActionResult<T> = { success: true; data: T } | { success: false; error: string; code?: string }`
**And** `pnpm dev` runs on localhost:3000 with no console errors
**And** the project is pushed to GitHub and a Vercel deployment is triggered automatically on push to `main`
**And** `.env.example` is committed with all required keys listed but values redacted

---

### Story 1.2: Citizen Database Schema and Supabase Setup

As a developer,
I want the citizen and issue database tables created with RLS policies,
So that citizen reports can be securely stored and retrieved.

**Acceptance Criteria:**

**Given** a Supabase project is created and `SUPABASE_URL` + keys are in `.env.local`
**When** I run the citizen schema SQL
**Then** `citizens` table exists with columns: `id`, `clerk_user_id`, `created_at`
**And** `wards` table exists with columns: `id`, `name`, `city`, `score`, `geojson_id`
**And** `issues` table exists with columns: `id`, `citizen_id`, `ward_id`, `authority_id`, `photo_url`, `ai_category`, `ai_severity`, `status`, `created_at`, `resolved_at`, `resolution_photo_url`
**And** RLS is enabled on `issues` — authenticated citizen reads only their own rows
**And** `src/lib/supabase/client.ts` exports a browser Supabase client
**And** `src/lib/supabase/server.ts` exports a server-side Supabase client for use in server actions
**And** `src/types/database.ts` defines `Issue`, `Ward`, `Citizen` TypeScript types matching the schema
**And** Supabase real-time is enabled on the `issues` table

---

### Story 1.3: Citizen Authentication with Clerk

As a citizen,
I want to create an account and sign in,
So that my submitted reports are tied to my identity and I can track them.

**Acceptance Criteria:**

**Given** Clerk is configured and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are in `.env.local`
**When** a new user visits the app
**Then** they can sign up using email — Clerk handles all auth UI
**And** after sign-up, they are redirected to the citizen report page (`/report`)
**And** `src/middleware.ts` uses `clerkMiddleware()` to protect `/dashboard/**` and `/admin/**` — unauthenticated users redirect to sign-in
**And** Clerk sessions persist for 7 days — no re-login on page refresh within that window (NFR26)
**And** `src/lib/supabase/client.ts` and `server.ts` use the Clerk user ID to set the Supabase auth context for RLS
**And** a signed-in citizen cannot access authority dashboard routes

---

### Story 1.4: Camera-First Mobile UI Layout

As a citizen,
I want the app to open directly to the camera with a mobile-optimized layout,
So that I can start reporting an issue the instant I open the app.

**Acceptance Criteria:**

**Given** a signed-in citizen opens the app on Chrome Android
**When** the `/report` page loads
**Then** the camera viewfinder fills the full screen within 500ms — no splash screen, no onboarding (NFR1, UX-DR1)
**And** a single large shutter button (min 64×64px) is centered at the bottom of the viewfinder
**And** bottom navigation shows 4 tabs: Report (active), Map, Leaderboard, Profile — all tabs min 48×48px (NFR18, UX-DR2)
**And** if camera permission is denied, a file-upload fallback button appears in place of the viewfinder
**And** the layout uses shadcn/ui components with Tailwind — rounded, modern, no government styling (UX-DR5)
**And** Framer Motion slide-in transition plays when navigating between tabs (UX-DR6)

---

### Story 1.5: Photo Capture and GPS Ward Tagging

As a citizen,
I want the app to capture my photo and automatically detect which ward I'm in,
So that the report is routed to the right authority without me typing anything.

**Acceptance Criteria:**

**Given** the citizen is on the camera screen with permissions granted
**When** they tap the shutter button
**Then** a photo is captured using `getUserMedia` without leaving the app
**And** the device GPS coordinates are captured simultaneously using the Geolocation API
**And** `src/lib/wardLookup.ts` maps the GPS coordinates to the correct Jaipur `ward_id` from the `wards` table
**And** if GPS is unavailable or times out after 3 seconds, the ward defaults to a pre-selected demo Jaipur ward
**And** the captured photo (as a data URL or File object) and `ward_id` are held in local React state pending submission
**And** the citizen never sees raw GPS coordinates — only the ward name (e.g. "Ward 14 — Vaishali Nagar")

---

### Story 1.6: AI Photo Categorization via Server Action

As a citizen,
I want the app to automatically identify what kind of civic issue I photographed,
So that I don't have to fill in any forms or select categories manually.

**Acceptance Criteria:**

**Given** a photo has been captured and is held in React state
**When** the photo is sent for categorization
**Then** `src/actions/categorizePhoto.ts` is invoked as a Next.js Server Action — never called from client-side code directly
**And** the action calls the OpenAI Vision API with prompt: "Classify this civic issue. Return JSON only: { category: 'garbage|pothole|drainage|streetlight|other', severity: 'minor|moderate|critical', isValidCivicIssue: boolean }"
**And** an `AbortController` with a 5-second timeout wraps the OpenAI call (NFR24)
**And** on timeout or API error, the action returns `{ success: true, data: { category: 'Other', severity: 'moderate', isValidCivicIssue: true } }` — never fails the citizen flow
**And** the `OPENAI_API_KEY` environment variable is only accessed inside this server action — never imported in any component file (NFR11)
**And** the action returns `ActionResult<{ category, severity, isValidCivicIssue }>`

---

### Story 1.7: Issue Submission and Confirmation Card

As a citizen,
I want to review the AI result and submit my report with a single tap,
So that the full flow from photo to submission confirmation takes under 10 seconds.

**Acceptance Criteria:**

**Given** the AI categorization result has been returned
**When** the pre-filled confirmation card is shown to the citizen
**Then** the card displays: photo thumbnail, AI-assigned category (with edit dropdown), severity badge, ward name, and the assigned authority's name and score
**And** the citizen can change the AI category via a 5-option dropdown if it is wrong (FR4)
**And** tapping "Submit" invokes `src/actions/submitIssue.ts`
**And** `submitIssue` first checks rate limit: `SELECT count(*) FROM issues WHERE citizen_id = $1 AND created_at > now() - interval '24h'` — if count ≥ 10, returns `{ success: false, error: 'Daily limit reached' }` (NFR12, FR39)
**And** on passing the rate limit check, the action uploads the photo to Supabase Storage and inserts a row into `issues` with all fields populated
**And** the action returns `ActionResult<{ issueId, authorityName, wardName }>`
**And** on success, the confirmation screen shows: "Sent to [Authority Name]. They have 48 hours to resolve." with authority score visible
**And** the issue appears in the citizen's `my-reports` view (FR5)
**And** the full round-trip (photo → AI → DB write → confirmation) completes within 3 seconds on 4G (NFR2)

---

## Epic 2: Authorities Can Manage and Resolve Issues

Authorities can sign into a dedicated desktop-first dashboard, see all issues in their ward appear in real-time, view full issue details, mark issues resolved with a proof photo, and watch their performance score animate upward. The real-time chain (citizen submits → authority queue updates → resolve → score increments) is the core live demo sequence.

### Story 2.1: Authority Database Schema and Authentication

As a ward authority,
I want a dedicated account and dashboard that is separate from the citizen interface,
So that I can access and manage issues assigned to my ward.

**Acceptance Criteria:**

**Given** Clerk is already configured (from Story 1.3)
**When** the authority schema and auth setup is complete
**Then** `authorities` table exists with columns: `id`, `clerk_user_id`, `name`, `ward_id`, `score`, `resolution_count`, `escalation_count`, `photo_url`, `verified`
**And** Supabase real-time is enabled on the `authorities` table
**And** RLS on `authorities` — authority reads only their own row; score column is write-protected from client (NFR13, FR24)
**And** `src/lib/clerk.ts` exports `isAuthority(userId): boolean` and `isAdmin(userId): boolean` helper functions
**And** `src/middleware.ts` redirects unauthenticated users away from `/dashboard/**`
**And** an authority user (created via Clerk dashboard with `authority` role) can sign in and is redirected to `/dashboard`
**And** a citizen attempting to access `/dashboard` is redirected to `/report`
**And** the authority dashboard uses a desktop-first sidebar layout (UX-DR3)

---

### Story 2.2: Real-Time Issue Queue

As a ward authority,
I want to see all pending issues in my ward in real-time,
So that I can act on new reports the moment they are submitted.

**Acceptance Criteria:**

**Given** an authority is signed in at `/dashboard`
**When** the page loads
**Then** `src/providers/RealtimeProvider.tsx` initializes a Supabase channel subscribed to `issues` where `ward_id = {authority.ward_id}`
**And** all pending and in-progress issues for the authority's ward are displayed as cards showing: photo thumbnail, category badge, severity, ward location, time since submission, and 48-hour countdown
**And** issues are ordered: Critical severity first, then by oldest submission time
**And** when a new issue is submitted by a citizen in this ward, it appears in the queue within 1 second without a page refresh (NFR4, FR14)
**And** the dashboard is fully keyboard-navigable (NFR22)
**And** only verified authority accounts can view the dashboard (FR36)
**And** each issue card is a link to the issue detail page

---

### Story 2.3: Issue Detail View and Resolution Flow

As a ward authority,
I want to view full issue details and mark an issue resolved with a proof photo,
So that my resolution is documented and permanently recorded.

**Acceptance Criteria:**

**Given** an authority clicks an issue card in their queue
**When** the issue detail page `/dashboard/issue/[id]` loads
**Then** full details are shown: full-size photo, ward location, AI category, severity badge, submission timestamp, current status (FR15)
**And** an "In Progress" button updates `issues.status = 'in_progress'` in Supabase immediately via a server action
**And** a "Mark Resolved" button opens a modal prompting for a resolution proof photo upload (FR17)
**And** uploading the proof photo calls `src/actions/resolveIssue.ts` which: updates `issues.status = 'resolved'`, sets `issues.resolved_at = now()`, saves `issues.resolution_photo_url`, then calls `updateAuthorityScore`
**And** the proof photo is uploaded to Supabase Storage and the URL is stored — it cannot be deleted after upload (FR40)
**And** `resolveIssue` returns `ActionResult<{ newScore, issueId }>`
**And** after resolution, the issue disappears from the pending queue and moves to a "Resolved" tab

---

### Story 2.4: Live Score Updates and Authority Profile

As a ward authority,
I want my performance score to update live when I resolve issues and be visible on my public profile,
So that my work is recognized and my accountability is public.

**Acceptance Criteria:**

**Given** an authority resolves an issue (Story 2.3 complete)
**When** `resolveIssue` calls `src/actions/updateAuthorityScore.ts`
**Then** `authorities.score` is incremented by +5 in Supabase via a server-side write only (FR22, NFR13)
**And** the score write fires the `authorities` real-time channel
**And** the `ScoreCounter` component in the dashboard sidebar animates from the old score to the new score using Framer Motion (UX-DR6)
**And** `src/app/(public)/authority/[id]/page.tsx` renders the authority's public profile (SSR) showing: name, ward, verified badge, current score with animated counter, resolution rate %, total issues resolved (FR31, FR37)
**And** the verified badge is prominently shown on authority profiles that have `verified = true` (FR37, UX-DR8)
**And** the authority can see their current leaderboard rank on their dashboard profile page (FR18)

---

## Epic 3: Public Can See Accountability Data

Any visitor — citizen, journalist, or senior official — can view the live Jaipur ward heat map with green-to-red coloring based on authority performance, browse the weekly leaderboard ranked by resolution score, and click into any authority's full public profile. These three pages are the visual showpieces during the judge demo.

### Story 3.1: Jaipur Ward Heat Map

As any visitor,
I want to see a live map of Jaipur wards colored by civic performance,
So that I can instantly see which areas are well-managed and which are failing.

**Acceptance Criteria:**

**Given** any visitor (not logged in) navigates to `/map`
**When** the page loads
**Then** Leaflet.js renders from the locally bundled source — no CDN request made (NFR27)
**And** Jaipur ward polygons from `public/geo/jaipur-wards.geojson` are drawn on the map (NFR16)
**And** each ward polygon is filled with a color based on its score: green (80+), yellow (60–79), orange (40–59), red (below 40)
**And** all ward polygons and colors render within 2 seconds of page load (NFR3)
**And** clicking any ward shows a popup with: ward name, authority name, score, and count of issues resolved this week
**And** the `wards` Supabase real-time channel is subscribed — when a ward score changes, the polygon color updates within 1 second (NFR4, FR28)
**And** the map page is SSR (Next.js server component) — fully indexable and shareable

---

### Story 3.2: Weekly Leaderboard

As any visitor,
I want to see a weekly ranking of ward authorities by performance,
So that I can identify the best and worst-performing officials in Jaipur.

**Acceptance Criteria:**

**Given** any visitor navigates to `/leaderboard`
**When** the page loads
**Then** authorities are ranked by `score DESC` queried directly from the pre-computed `authorities.score` column (NFR5, FR29)
**And** the leaderboard loads within 1 second (NFR5)
**And** each row shows: rank number, authority name and photo, ward name, score, resolution rate %, issues resolved this week
**And** top 3 rows have gold / silver / bronze rank indicators; bottom 3 rows have a red highlight
**And** a category filter dropdown (All, Garbage, Pothole, Drainage, Streetlight) filters the leaderboard by the category of issues resolved (FR30)
**And** authority rows are clickable and navigate to that authority's public profile page
**And** the page is SSR by default — client-side real-time updates via the `authorities` channel refresh rankings when scores change

---

### Story 3.3: Authority Public Profile Page

As any visitor,
I want to view a specific authority's full public profile and track record,
So that I can see their accountability history and share it publicly.

**Acceptance Criteria:**

**Given** any visitor navigates to `/authority/[id]`
**When** the profile page loads
**Then** the page is SSR — indexable by search engines and shareable via link (FR31)
**And** the profile shows: name, profile photo, ward name, verified badge, current score with Framer Motion counter animation on load, resolution rate %, total issues resolved, total escalations received (UX-DR8)
**And** a list of recently resolved issues is shown with before and after photos where available (FR32)
**And** the verified badge renders prominently for `verified = true` accounts (FR37)
**And** the score counter animates from 0 to the current score using Framer Motion on first render (UX-DR6)
**And** the authority's leaderboard rank is displayed (e.g. "#4 in Jaipur this week")

---

## Epic 4: Demo Is Production-Ready

The full 90-second demo loop runs without any live API dependency. Jaipur seed data is pre-loaded, the resolve → score → heat map real-time chain is wired end-to-end, key UI strings show Hindi, OpenAI fallback is tested and confirmed, and a backup screen recording is saved. All demo accounts are pre-logged-in before the venue.

### Story 4.1: Jaipur Seed Data and Admin Setup

As a demo operator,
I want realistic pre-loaded Jaipur data and all demo accounts ready,
So that the app looks fully operational from the first second of the judge demo.

**Acceptance Criteria:**

**Given** `supabase/seed.sql` is run against the Supabase project
**When** the app loads with seed data
**Then** 5 authority accounts exist with names, ward assignments, scores, and profile photos — 3 with high scores (green wards), 2 with low scores (orange/red wards)
**And** 20+ issues exist across multiple wards: mix of statuses (pending, in-progress, resolved), categories (garbage, pothole, drainage, streetlight), and severities
**And** ward scores are pre-set to create a visually striking heat map (at least 2 green, 2 yellow, 2 orange, 1 red)
**And** `public/geo/jaipur-wards.geojson` exists with at least 20 real Jaipur ward polygons sourced from open data
**And** all 5 demo authority Clerk accounts are created and can sign in before April 18
**And** `src/app/(admin)/authorities/page.tsx` exists and is accessible only to admin role — allows viewing and creating authority accounts (FR35)
**And** all demo sessions are pre-authenticated and session-persisted for the 7-day window before the event (NFR14)

---

### Story 4.2: End-to-End Accountability Score Engine

As the system,
I want authority scores to change automatically on resolution events and cascade to the heat map in real-time,
So that the live demo sequence (resolve → score → heat map shift) is seamless and visible to judges.

**Acceptance Criteria:**

**Given** an authority marks an issue as resolved
**When** `resolveIssue` and `updateAuthorityScore` complete
**Then** `authorities.score` increments by +5 (FR22)
**And** the ward's aggregate score in `wards.score` is recalculated: `SELECT AVG(score) FROM authorities WHERE ward_id = ?` and the `wards` row is updated
**And** the `wards` real-time channel fires and the heat map polygon color updates within 1 second on the public map page (NFR4, FR28)
**And** if an issue is manually marked as escalated (demo-only trigger), `authorities.score` decrements by -5 and `escalation_events` logs a row with timestamp (FR21, FR23)
**And** all score change events are logged to `escalation_events` table: `{ id, issue_id, authority_id, event_type, score_delta, created_at }` — permanently, no delete (FR23)
**And** `authorities.score` cannot be modified directly via Supabase client — only via server actions (NFR13, FR24)

---

### Story 4.3: Demo Polish, Hindi Labels, and Fallback Recording

As a demo operator,
I want all visual polish, Hindi labels on key strings, and a fallback video ready,
So that the demo succeeds even if venue WiFi is unreliable or a live API fails.

**Acceptance Criteria:**

**Given** the app is fully built and deployed to Vercel production
**When** any external API call fails during the demo
**Then** the OpenAI timeout fallback activates within 5 seconds and shows "Other / Moderate" pre-filled — the submit flow still completes with no crash or error screen (NFR24)
**And** the following UI strings show Hindi below the English label: camera shutter prompt, submission confirmation message, issue status labels (Pending / In Progress / Resolved), severity labels (NFR21, UX-DR7)
**And** Framer Motion page transitions are active on all navigation between tabs (slide-in), score counter animates on resolve, and map polygon color transitions smoothly over 500ms (UX-DR6)
**And** the app is tested on a real Android device (Chrome 90+) and works without errors (NFR23)
**And** a 90-second screen recording of the full demo flow is saved as `demo-fallback.mp4`: citizen submits → authority queue updates → authority resolves → score animates → heat map shifts (NFR17)
**And** the Vercel production URL is confirmed working and all 5 demo authority sessions are pre-logged-in the night before April 18
