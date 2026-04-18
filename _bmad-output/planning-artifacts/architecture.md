---
stepsCompleted: [step-01-init, step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation, step-08-complete]
workflowStatus: complete
completedAt: '2026-04-13'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
workflowType: 'architecture'
project_name: 'hekaton'
user_name: 'Harigopal'
date: '2026-04-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — Next.js PWA (mobile citizen interface) + desktop authority dashboard. Single codebase, two layout modes.

### Selected Starter: create-next-app (official)

**Rationale:** Stack is pre-defined in the PRD. No community starter bundles Clerk + Supabase + OpenAI + Leaflet without conflict. Official starter + manual dependencies gives full control — critical for a 3-day hackathon build.

**Initialization Command:**

```bash
npx create-next-app@latest nagrik \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir
```

**Post-init setup:**

```bash
pnpm dlx shadcn@latest init
pnpm add @clerk/nextjs @supabase/supabase-js @supabase/ssr \
  framer-motion leaflet react-leaflet openai
```

**Architectural Decisions Provided by Starter:**

- Language: TypeScript (strict mode)
- Styling: Tailwind CSS — configured, purged, production-ready
- Routing: App Router — server components default, client opt-in
- Structure: `src/` directory (`src/app/`, `src/components/`, `src/lib/`)
- Linting: ESLint with Next.js config
- Build: Turbopack (dev), Webpack (prod via Vercel)

**Note:** Project initialization is the first implementation story (Day 1, P0).

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
nagrik/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                    # shadcn/ui config
├── .env.local                         # never committed
├── .env.example                       # committed, values redacted
├── .gitignore
│
├── public/
│   ├── geo/
│   │   └── jaipur-wards.geojson       # bundled locally (NFR16, NFR27)
│   ├── icons/                         # PWA icons (192px, 512px)
│   └── manifest.json                  # PWA manifest
│
├── supabase/
│   ├── schema.sql                     # full DB schema + RLS policies
│   └── seed.sql                       # Jaipur demo data (20+ reports, authorities, wards)
│
└── src/
    ├── middleware.ts                   # Clerk route protection — /dashboard/**, /admin/**
    │
    ├── app/
    │   ├── layout.tsx                  # root — ClerkProvider, fonts
    │   ├── globals.css
    │   │
    │   ├── (public)/                   # SSR — no auth required (FR26-32)
    │   │   ├── page.tsx                # landing / city selector
    │   │   ├── map/page.tsx            # live Jaipur heat map
    │   │   ├── leaderboard/page.tsx    # weekly leaderboard
    │   │   └── authority/[id]/page.tsx # authority public profile
    │   │
    │   ├── (citizen)/                  # Clerk-protected, mobile-first layout
    │   │   ├── layout.tsx              # bottom nav, mobile viewport
    │   │   ├── report/page.tsx         # camera → submit flow (FR1-6)
    │   │   ├── my-reports/page.tsx     # citizen issue history (FR5)
    │   │   └── profile/page.tsx
    │   │
    │   ├── (authority)/               # Clerk-protected, desktop-first layout
    │   │   ├── layout.tsx             # sidebar nav, RealtimeProvider
    │   │   ├── dashboard/page.tsx     # issue queue (FR14-18)
    │   │   ├── issue/[id]/page.tsx    # issue detail + resolve
    │   │   └── profile/page.tsx       # score + rank (FR18)
    │   │
    │   ├── (admin)/                   # Clerk admin role only
    │   │   ├── layout.tsx
    │   │   └── authorities/page.tsx   # manage authority accounts (FR35)
    │   │
    │   └── api/
    │       └── webhooks/
    │           └── escalation/route.ts  # Phase 2 — escalation trigger
    │
    ├── actions/                        # Server Actions — all OpenAI + DB writes
    │   ├── submitIssue.ts              # FR1-4, FR7-13 — photo + GPS → Supabase
    │   ├── categorizePhoto.ts          # OpenAI Vision call (server-only, NFR11)
    │   ├── resolveIssue.ts             # FR16-17 — status + proof upload
    │   ├── updateAuthorityScore.ts     # FR19, FR22 — score write (server-only)
    │   └── createAuthority.ts          # FR35 — admin creates authority accounts
    │
    ├── components/
    │   ├── ui/                         # shadcn/ui generated components
    │   ├── reporting/                  # FR1-6 — citizen submit flow
    │   │   ├── CameraCapture.tsx
    │   │   ├── IssuePreviewCard.tsx
    │   │   ├── CategoryBadge.tsx
    │   │   └── SubmitButton.tsx
    │   ├── map/                        # FR26-28 — heat map
    │   │   ├── WardHeatMap.tsx         # Leaflet + GeoJSON
    │   │   ├── WardPolygon.tsx
    │   │   └── MapLegend.tsx
    │   ├── dashboard/                  # FR14-18 — authority interface
    │   │   ├── IssueQueue.tsx
    │   │   ├── IssueCard.tsx
    │   │   ├── ResolveModal.tsx
    │   │   └── ScoreCounter.tsx
    │   ├── leaderboard/               # FR29-32
    │   │   ├── LeaderboardTable.tsx
    │   │   ├── AuthorityRow.tsx
    │   │   └── CategoryFilter.tsx
    │   └── shared/
    │       ├── AuthorityAvatar.tsx
    │       ├── SeverityBadge.tsx
    │       ├── StatusTag.tsx
    │       └── HindiToggle.tsx
    │
    ├── hooks/
    │   ├── useIssueQueue.ts            # realtime issues for authority dashboard
    │   ├── useWardScore.ts             # realtime ward score → heat map color
    │   ├── useAuthorityScore.ts        # realtime authority score counter
    │   └── useCamera.ts               # getUserMedia wrapper
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts              # browser Supabase client
    │   │   ├── server.ts              # server Supabase client (SSR/actions)
    │   │   └── types.ts               # generated DB types
    │   ├── clerk.ts                   # role helpers (isAuthority, isAdmin)
    │   ├── wardLookup.ts              # GPS coords → ward_id
    │   ├── scoreEngine.ts             # score delta constants (+5 resolve, -5 escalate)
    │   └── utils.ts                   # cn(), formatDate(), formatScore()
    │
    ├── providers/
    │   └── RealtimeProvider.tsx       # Supabase channel context for authority layout
    │
    └── types/
        ├── database.ts                # Issue, Authority, Ward, EscalationEvent, Citizen
        └── actions.ts                 # ActionResult<T> + all action return types
```

### Architectural Boundaries

**API Boundaries:**
- All external API calls (OpenAI) are contained within `src/actions/` — never crossed into `src/components/` or `src/app/` client components
- Supabase writes go through `src/actions/` only. Supabase reads for SSR go through `src/lib/supabase/server.ts`. Real-time reads go through hooks in `src/hooks/`
- Public pages (`(public)/`) use Supabase server client for SSR. Protected pages use Clerk-verified session before any DB access

**Component Boundaries:**
- `src/components/ui/` — pure presentational, zero business logic
- `src/components/{feature}/` — feature-specific, may call hooks, must not call Server Actions directly (pass handlers as props)
- `src/providers/RealtimeProvider.tsx` — single channel registry for authority dashboard layout, shared via React Context

**Data Boundaries:**
- `issues` table: RLS — citizen reads own rows, authority reads rows where `ward_id` matches
- `authorities` table: `score` column writable only from `updateAuthorityScore.ts` server action
- `wards` table: read-only from client (scores derived from authorities aggregate)

### Requirements to Structure Mapping

| FR Group | Location |
|---|---|
| Issue Reporting (FR1-6) | `src/app/(citizen)/report/`, `src/actions/submitIssue.ts`, `src/components/reporting/` |
| AI & Routing (FR7-13) | `src/actions/categorizePhoto.ts`, `src/lib/wardLookup.ts` |
| Authority Resolution (FR14-18) | `src/app/(authority)/dashboard/`, `src/actions/resolveIssue.ts`, `src/components/dashboard/` |
| Accountability Engine (FR19-25) | `src/actions/updateAuthorityScore.ts`, `src/lib/scoreEngine.ts` |
| Civic Intelligence (FR26-32) | `src/app/(public)/map/`, `src/app/(public)/leaderboard/`, `src/components/map/`, `src/components/leaderboard/` |
| Access Management (FR33-37) | `src/middleware.ts`, `src/lib/clerk.ts`, `src/app/(admin)/` |
| Data & Transparency (FR38-42) | `supabase/schema.sql`, `supabase/seed.sql`, rate limit in `src/actions/submitIssue.ts` |

### Data Flow

```
Citizen captures photo
  → CameraCapture.tsx (getUserMedia)
  → submitIssue server action
    → categorizePhoto (OpenAI Vision, 5s timeout)
    → wardLookup (GPS → ward_id)
    → rate limit check (Supabase count query)
    → issues table INSERT
      → Supabase real-time fires on issues:ward_{id}
        → useIssueQueue hook (authority dashboard) receives new issue
        → updateAuthorityScore fires on resolution
          → authorities.score UPDATE
            → Supabase real-time fires on authorities:id_{id}
              → useWardScore hook → heat map color recalculates
              → useAuthorityScore hook → ScoreCounter animates
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All 4 external services (Clerk, Supabase, OpenAI, Leaflet) are isolated behind clear boundaries with no version conflicts. Next.js App Router server/client split is consistent with Clerk middleware pattern and Supabase SSR client.

**Pattern Consistency:** Naming conventions (snake_case DB, PascalCase components, camelCase actions) are consistent across all layers. `ActionResult<T>` pattern is universal. Real-time subscription cleanup pattern is specified with examples.

**Structure Alignment:** Route groups (`(public)`, `(citizen)`, `(authority)`, `(admin)`) directly map to the 3-role Clerk model. Server actions are in a dedicated `src/actions/` directory enforcing the server-only boundary for OpenAI and score writes.

### Requirements Coverage Validation ✅

**Functional Requirements (42 FRs):** All 7 FR groups have explicit directory/file mapping. No FR is architecturally orphaned.

**Non-Functional Requirements (31 NFRs):**

| NFR Category | Coverage |
|---|---|
| Performance (NFR1-7) | Pre-computed scores, local GeoJSON, 200kb budget via no state library, Next.js Image |
| Security (NFR8-13) | Server actions for OpenAI, Clerk middleware, Supabase RLS, write-protected score |
| Reliability (NFR14-17) | Seed data in `supabase/seed.sql`, local GeoJSON in `public/geo/`, AbortController fallback |
| Accessibility (NFR18-23) | HindiToggle component, 48px touch targets via shadcn, text labels on all icons |
| Integration (NFR24-28) | AbortController 5s timeout, Supabase auto-reconnect, 7-day Clerk sessions, local Leaflet |
| Scalability (NFR29-31) | city/ward as parameters in schema, pre-computed leaderboard column |

### Implementation Readiness Validation ✅

**Decision Completeness:** All 5 critical decision categories documented with rationale. Technology versions verifiable via `create-next-app@latest`.

**Structure Completeness:** Every file and directory named specifically — no generic placeholders. All 42 FRs mapped to exact file locations.

**Pattern Completeness:** 6 conflict areas addressed. Code examples provided for Server Action response shape and real-time subscription pattern.

### Gap Analysis Results

**No critical gaps found.**

**Minor items (non-blocking for hackathon):**
- Supabase schema SQL not yet written — first implementation artifact needed (Day 1, P0)
- Jaipur ward GeoJSON source not yet acquired — teammate task (Day 1)
- PWA service worker configuration — shadcn/Next.js handles manifest, service worker is a Day 3 polish item

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (medium)
- [x] Technical constraints identified (7 key constraints)
- [x] Cross-cutting concerns mapped (6 areas)

**✅ Architectural Decisions**
- [x] Critical decisions documented (5 categories)
- [x] Technology stack fully specified (9 technologies)
- [x] Integration patterns defined (Server Actions, real-time channels, RLS)
- [x] Performance considerations addressed (pre-computed scores, local assets)

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, files, components, types)
- [x] API response format standardized (`ActionResult<T>`)
- [x] Real-time subscription pattern specified with code example
- [x] Error handling and loading state rules documented
- [x] Anti-patterns explicitly listed

**✅ Project Structure**
- [x] Complete directory tree defined (every file named)
- [x] Component boundaries established (ui / feature / shared)
- [x] Integration points mapped (data flow diagram)
- [x] All 42 FRs mapped to specific locations

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Server/client boundary is airtight — OpenAI and score writes can never leak to client
- Real-time chain is fully specified (citizen submit → authority queue → heat map → leaderboard)
- Demo resilience is architecturally baked in — no live API dependency required for full demo flow
- Route group structure maps 1:1 to Clerk roles — auth and routing are naturally aligned

**Areas for Future Enhancement (Phase 2+):**
- Escalation cron job architecture (Supabase pg_cron or Vercel cron)
- PWA offline queue with IndexedDB
- Multi-city support (schema supports it, UI does not yet)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use `ActionResult<T>` for every Server Action — no exceptions
- Never import OpenAI in any client component
- Clean up Supabase channels in every `useEffect` return
- Refer to this document for all architectural questions

**First Implementation Steps (Day 1, P0):**
1. `npx create-next-app@latest nagrik --typescript --tailwind --eslint --app --src-dir`
2. `pnpm dlx shadcn@latest init`
3. `pnpm add @clerk/nextjs @supabase/supabase-js @supabase/ssr framer-motion leaflet react-leaflet openai`
4. Write `supabase/schema.sql` — tables: `issues`, `authorities`, `wards`, `citizens`
5. Set up Clerk + Supabase environment variables
6. Implement `src/middleware.ts` route protection
7. Build citizen camera → submit flow (`src/app/(citizen)/report/`)

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 areas where AI agents could make different choices — naming, API response shape, error handling, loading states, real-time subscription pattern, server/client boundary

### Naming Patterns

**Database Naming Conventions:**
- Tables: plural snake_case → `issues`, `authorities`, `wards`, `escalation_events`, `citizens`
- Columns: snake_case → `ward_id`, `created_at`, `citizen_id`, `resolution_photo_url`, `ai_category`
- Foreign keys: `{table_singular}_id` → `ward_id`, `authority_id`, `citizen_id`
- Timestamps: always `created_at`, `updated_at`, `resolved_at`, `escalated_at`

**File & Component Naming:**
- React components: PascalCase → `IssueCard.tsx`, `WardHeatMap.tsx`, `AuthorityQueue.tsx`, `LeaderboardTable.tsx`
- Custom hooks: camelCase with `use` prefix → `useIssueQueue.ts`, `useWardScore.ts`, `useRealtimeChannel.ts`
- Server actions: camelCase verb-noun → `submitIssue.ts`, `resolveIssue.ts`, `updateAuthorityScore.ts`, `categorizePhoto.ts`
- API routes: kebab-case directories → `src/app/api/webhooks/escalation/route.ts`
- Utility files: camelCase → `supabaseClient.ts`, `clerkHelpers.ts`, `wardLookup.ts`

**TypeScript Types:**
- Domain types: PascalCase → `Issue`, `Authority`, `Ward`, `EscalationEvent`, `Citizen`
- Prop types: `{Component}Props` → `IssueCardProps`, `WardHeatMapProps`
- Server Action results: `{Action}Result` → `SubmitIssueResult`, `ResolveIssueResult`

### Format Patterns

**Server Action Response — All actions return this exact shape:**
```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```
No exceptions. Never throw errors to the client. Never return raw objects.

**Client consumption pattern:**
```ts
const result = await submitIssue(formData)
if (!result.success) {
  setError(result.error)
  return
}
// use result.data
```

**Supabase query result handling:**
```ts
const { data, error } = await supabase.from('issues').select('*')
if (error) return { success: false, error: error.message }
return { success: true, data }
```

### Communication Patterns

**Real-time Subscription Pattern — always with cleanup:**
```ts
useEffect(() => {
  const channel = supabase
    .channel(`issues:ward_${wardId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'issues',
      filter: `ward_id=eq.${wardId}`
    }, handler)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [wardId])
```
- Never create channels outside `useEffect`
- Always return cleanup function
- Channel name must match filter: `{table}:{filter_column}_{value}`

**State update pattern for real-time data:**
```ts
// Append new issues to list — never mutate in place
setIssues(prev => [newIssue, ...prev])
// Update score — replace by id
setAuthorities(prev => prev.map(a => a.id === updated.id ? updated : a))
```

### Process Patterns

**Error Handling:**
- Server Actions: wrap in try/catch, return `{ success: false, error: string }` — never throw
- Client components: always check `result.success` before accessing `result.data`
- OpenAI timeout: `AbortController` at 5s → fallback `{ category: "Other", severity: "moderate" }`
- Supabase real-time disconnect: show reconnecting toast, retry automatically via Supabase client

**Loading States:**
- Naming: `isSubmitting`, `isResolving`, `isLoading` — never bare `loading`
- All async actions disable the trigger button while `pending: true`
- No silent loading — always show skeleton, spinner, or disabled state

**Server/Client Boundary:**
- OpenAI API key: `process.env.OPENAI_API_KEY` in server actions only — never in client components
- Supabase service role key: server only. Supabase anon key: client-safe
- Clerk `auth()`: server components. `useAuth()`: client components

### Enforcement Guidelines

**All AI Agents MUST:**
- Return `ActionResult<T>` from every Server Action — no exceptions
- Use snake_case for all Supabase column names
- Clean up Supabase real-time channels in `useEffect` return
- Never call OpenAI from a client component
- Prefix all loading state variables with `is`

**Anti-Patterns (never do these):**
- ❌ `const { data } = await submitIssue()` — always check `success` first
- ❌ `supabase.channel('issues').subscribe()` outside useEffect
- ❌ `import OpenAI from 'openai'` in any file under `src/app/(citizen)/` or `src/components/`
- ❌ `setState({ loading: true })` — use `setIsLoading(true)`
- ❌ Table names in camelCase: `issueReports` — use `issue_reports`

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- API layer: Server Actions for OpenAI + score writes; Route Handlers for webhooks only
- Score computation: `score` column on `authorities` table, server-side writes only
- Rate limiting: Supabase query (`count issues by citizen + 24h window`) in server action — no extra service
- Real-time subscriptions: Context Provider pattern wrapping authority dashboard layout

**Important Decisions (Shape Architecture):**
- State management: `useState`/`useContext` for UI state; Supabase real-time as live data layer — no Zustand/TanStack Query
- Leaderboard: Pre-computed `score` column queried directly — no materialized view complexity
- Route protection: Clerk middleware for all `/dashboard/**` and `/admin/**` routes

**Deferred Decisions (Post-MVP):**
- Escalation cron job (Phase 2 — scheduler not needed for hackathon demo)
- PWA offline queue (Phase 2)
- Hindi toggle full implementation (Phase 2)

### Data Architecture

- **Database:** Supabase PostgreSQL
- **RLS Strategy:** Row-level policies on `issues` table — citizen reads own rows, authority reads rows where `ward_id` matches their assignment
- **Score writes:** Server-side event handlers only. `authorities.score` column is the single source of truth, updated on every resolution or escalation event
- **Rate limiting:** `SELECT count(*) FROM issues WHERE citizen_id = $1 AND created_at > now() - interval '24h'` — checked in submit server action before any write
- **Leaderboard:** Direct query on `authorities` table ordered by `score DESC` — pre-computed column, sub-500ms

### Authentication & Security

- **Auth provider:** Clerk — 3 roles (citizen, authority, admin)
- **Authority account creation:** Admin-only via Clerk dashboard or admin server action — no self-registration
- **Session persistence:** 7-day Clerk sessions (NFR26)
- **Route protection:** `clerkMiddleware()` in `src/middleware.ts` — protects `/dashboard/**`, `/admin/**`
- **OpenAI key:** Server-side only via `.env.local` — never imported in client components (NFR11)
- **Supabase RLS:** Enabled on `issues` table; `authorities` score column write-protected via RLS policy

### API & Communication Patterns

- **Server Actions:** OpenAI Vision call, issue submission write, score update, rate limit check
- **Route Handlers (`/api/...`):** Supabase webhook receiver for future escalation triggers only
- **Real-time:** Supabase `createClient` with `realtime` enabled — 3 channels: `issues:ward_id`, `authorities:id`, `wards:city`
- **OpenAI timeout:** 5-second AbortController in server action; on timeout → fallback category "Other", citizen can correct before submit

### Frontend Architecture

- **State management:** `useState` + `useContext` only — Supabase real-time subscription is the live data layer
- **Real-time placement:** `<RealtimeProvider>` Context wraps authority dashboard layout — channel created once, shared via hooks (`useIssueQueue`, `useAuthorityScore`, `useWardMap`)
- **Rendering split:** Public pages (map, leaderboard, authority profiles) → Next.js SSR. Protected pages (citizen submit, authority dashboard) → client components behind Clerk auth
- **Component structure:** Feature-based organization (`/components/reporting/`, `/components/map/`, `/components/dashboard/`, `/components/leaderboard/`)

### Infrastructure & Deployment

- **Hosting:** Vercel — CI/CD from `main` branch push (NFR28)
- **Environments:** `main` → production. No staging environment needed for hackathon.
- **Environment variables:** `.env.local` (local dev), Vercel dashboard (production). Public keys only for Clerk + Supabase client.
- **Demo resilience:** Pre-seeded Jaipur data in Supabase; local GeoJSON in `/public/geo/`; pre-categorized photo fallback in server action; all demo accounts pre-logged-in before judging

### Decision Impact Analysis

**Implementation Sequence:**
1. Supabase schema + RLS setup
2. Clerk auth + middleware
3. `create-next-app` + shadcn init
4. Server Actions (submit + OpenAI + score)
5. Citizen mobile UI (camera → submit flow)
6. Authority dashboard (queue + resolve)
7. Leaflet heat map + real-time color
8. Leaderboard page
9. Pre-seed Jaipur demo data

**Cross-Component Dependencies:**
- Score update triggers real-time → leaderboard + heat map must both subscribe to `authorities` changes
- Issue submission (citizen) → `issues` table write → triggers authority real-time channel → ward score recalculation → heat map update
- Clerk role determines which Supabase RLS policy applies — auth and data layer are coupled

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 42 FRs across 7 capability groups

| Group | FRs | Architectural Implication |
|---|---|---|
| Issue Reporting | FR1–6 | Camera API (getUserMedia), one-tap submit, local state before Supabase write |
| AI & Intelligent Routing | FR7–13 | Server action boundary for OpenAI Vision, GPS → ward lookup, rate limiting |
| Authority Resolution | FR14–18 | Real-time queue via Supabase subscription, proof photo upload flow |
| Accountability Engine | FR19–25 | Write-protected score system, server-side event handlers only, escalation scheduler |
| Civic Intelligence | FR26–32 | SSR public pages, Leaflet heat map with real-time color updates, leaderboard pre-computation |
| User & Access Management | FR33–37 | 3-role Clerk auth (Citizen / Authority / Admin), admin-only authority creation |
| Data & Transparency | FR38–42 | Supabase RLS, rate limiting middleware, permanent photo storage, seed data layer |

**Non-Functional Requirements:** 31 NFRs across 6 categories

| Category | Key Constraints |
|---|---|
| Performance | 500ms camera launch · 3s submission round-trip · 200kb gzipped bundle · 2s map render |
| Security | OpenAI key server-side only · Supabase RLS · Clerk auth guards · write-protected scores |
| Reliability | Full demo on pre-loaded data (no live API dependency) · offline queue for submissions · local GeoJSON |
| Accessibility | 48×48px touch targets · no color-only status · Hindi toggle on citizen UI |
| Integration | 5s OpenAI timeout + fallback · Supabase auto-reconnect · 7-day Clerk sessions · local Leaflet bundle |
| Scalability | Schema supports 10 cities / 500 wards · leaderboard pre-computed · 50 concurrent real-time connections |

**Scale & Complexity:**

- Primary domain: Full-stack web — PWA citizen interface + desktop authority dashboard
- Complexity level: Medium
- External integrations: 4 (Clerk, Supabase, OpenAI Vision, Leaflet + local GeoJSON)
- Estimated architectural components: ~20 (pages, server actions, Supabase tables, real-time channels, API routes)

### Technical Constraints & Dependencies

- **OpenAI Vision API** — server-side only via Next.js server actions. Never imported client-side. 5s timeout, "Other" category fallback required.
- **Leaflet.js** — locally bundled, no CDN. Jaipur GeoJSON stored in `/public/geo/jaipur-wards.geojson`.
- **Clerk** — 3 roles (citizen, authority, admin). Authority accounts pre-created by admin only — no self-registration. 7-day session persistence.
- **Supabase** — PostgreSQL + real-time channels. RLS enforced at row level for report data. Score writes locked to server-side event handlers.
- **Vercel** — CI/CD only. No manual file uploads. Environment variables via Vercel dashboard.
- **No Google Maps** — billing dependency eliminated. All map functionality through Leaflet + local tiles or CartoDB basemap.

### Cross-Cutting Concerns Identified

| Concern | Components Affected |
|---|---|
| Auth + role enforcement | All protected routes, Clerk middleware, Supabase RLS policies, admin authority creation |
| Real-time data sync | Issue queue (authority), score counter (authority profile), heat map color (public map), My Reports status (citizen) |
| Score integrity | Escalation engine, resolution upload handler, leaderboard query, authority profile display |
| Demo resilience | OpenAI fallback flow, pre-seeded Jaipur data, offline submission queue, local GeoJSON, session pre-login |
| Server/client boundary | OpenAI in server actions, Clerk in middleware + server components, SSR for public pages, CSR for real-time dashboards |
| Performance budget | Bundle splitting (200kb limit), image optimization via Next.js Image, pre-computed leaderboard scores, lazy map load |
