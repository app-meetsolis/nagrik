# Nagrik — Waste Segregation Platform
## Complete User Flow & System Structure

---

## What It Does

Citizens photograph waste → AI classifies type + correct bin → earns eco-points.
Collectors (authority role) confirm pickups → scored on completion rate.
Ward recycling rate is public. Both sides are accountable.

```
CITIZEN                              COLLECTOR (authority role)
───────                              ──────────────────────────
Snap photo of waste             →    Sees pending pickups for their ward
AI: type + bin + tip + points        Marks pickup collected
Eco-points credited                  Collector score +5
Ward recycling_rate +1 (recyclable)  Ward recycling_rate visible to all
```

---

## Database Schema

### Existing tables (unchanged)
| Table | Purpose |
|---|---|
| `wards` | 20 Jaipur wards with geojson_id for map placement |
| `citizens` | Clerk-linked user, now with `eco_points` |
| `authorities` | Clerk-linked collector, has `ward_id`, `score`, `resolution_count` |

### New columns added via migration
| Table | Column | Type | Default |
|---|---|---|---|
| `citizens` | `eco_points` | integer | 0 |
| `wards` | `recycling_rate` | integer | 50 |

### New tables
| Table | Purpose |
|---|---|
| `waste_scans` | Every scan a citizen makes — links to citizen, ward, collector |
| `recycling_centers` | 10 seeded Jaipur drop-off points, shown on map |

### `waste_scans` columns
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `citizen_id` | uuid → citizens | who scanned |
| `ward_id` | uuid → wards | GPS-detected ward |
| `collector_id` | uuid → authorities | authority assigned to ward |
| `photo_url` | text | Supabase Storage URL |
| `waste_type` | enum | see WasteType below |
| `recyclable` | boolean | drives ward rate update |
| `bin_color` | text | green/blue/red/grey |
| `prep_steps` | text[] | max 3 steps from AI |
| `tip` | text | one eco-tip from AI |
| `points_earned` | integer | 2 / 10 / 15 depending on type |
| `pickup_status` | text | pending → collected |
| `collected_at` | timestamptz | set when collector confirms |

### `waste_type` enum values
| Value | Bin | Points |
|---|---|---|
| `wet_organic` | Green | 10 |
| `dry_paper` | Blue | 10 |
| `dry_plastic` | Blue | 10 |
| `dry_metal` | Blue | 10 |
| `dry_glass` | Blue | 10 |
| `textile` | Blue | 10 |
| `e_waste` | Red | 15 |
| `hazardous` | Red | 15 |
| `non_recyclable` | Grey | 2 |

---

## User Flows

### CITIZEN FLOW

#### 1. Sign Up / Onboarding (`/onboarding`)
- Clerk handles authentication
- User picks role: **Citizen** or **Authority**
- Citizen fills name + phone → `registerCitizen()` creates row in `citizens`
- Redirected to `/report` (mobile) or `/home` (desktop)

#### 2. Home Dashboard (`/home`)
- Shows:
  - **Eco-points balance** (big hero number from `citizens.eco_points`)
  - **Total scans** count
  - **Recyclable %** computed client-side from scan history
  - **Ward recycling rate** from `wards.recycling_rate`
  - **Last 5 scans** with bin color dot, waste type, points earned, pickup status

#### 3. Scan Waste (`/report`) — 7-step machine
```
capture → processing → preview → analyzing → categorized → submitting → success
```

| Step | What happens |
|---|---|
| `capture` | `CameraCapture` component opens camera |
| `processing` | GPS position fetched → nearest ward detected via `findNearestWardGeojsonId` → photo uploaded to Supabase Storage |
| `preview` | User sees photo + ward name → taps "Classify Waste" |
| `analyzing` | `classifyWaste(photoUrl)` calls GPT-4o Vision with waste classification prompt |
| `categorized` | Shows: bin color dot, waste type, prep steps list, eco-tip, `+X pts` badge. If not waste: "Point camera at a waste item." |
| `submitting` | `logWasteScan()` inserts row in `waste_scans`, increments `eco_points`, bumps `recycling_rate` if recyclable |
| `success` | Shows points earned + running total. Links to `/my-scans` and `/map` |

#### 4. My Scans (`/my-scans`)
- Full history of all waste scans
- Each card: photo, waste type, bin color dot, points earned, pickup status (Pending / Collected)
- Header stats: total, collected count, total eco-points

#### 5. Leaderboard (`/leaderboard`)
- **Section 1 — Top Citizens**: ranked by `eco_points` descending. Top 3 get medal + score bar.
- **Section 2 — Ward Recycling Rates**: ranked by `recycling_rate` descending. Top 3 get medal + rate bar.

#### 6. Map (`/map`)
- Ward circles colored by `recycling_rate`:
  - Green ≥70%, Amber 40–69%, Red <40%
- **Recycling center markers** (dark green dots): click to open popup showing name, address, open hours, accepted waste types
- Collapsible "Ward Recycling Rates" card grid at bottom

---

### COLLECTOR (AUTHORITY) FLOW

#### 1. Sign Up / Onboarding (`/onboarding`)
- Picks **Authority** role
- Enters access code → `verifyAuthorityCode()` validates
- Fills name + selects ward → `registerAuthority()` creates row in `authorities`
- Redirected to `/dashboard`

#### 2. Dashboard (`/dashboard`)
- Header: collector name, ward, score (green)
- Stats: **Pending pickups**, **Collected today**, **Total collected**
- List of all pending waste scans in their ward (queried by `ward_id`, `pickup_status = 'pending'`)
- Each card: waste photo, waste type label, bin color dot, time ago, **"Mark Collected" button**

#### 3. Mark Collected
- Button opens `ResolveDialog` — simple confirmation: "Confirm this waste has been collected?"
- On confirm: `confirmPickup(scanId)` runs:
  1. Verifies collector's `ward_id` matches scan's `ward_id`
  2. Sets `pickup_status = 'collected'`, `collected_at = now()`
  3. Increments `authorities.score` by **+5** flat
  4. Increments `authorities.resolution_count`
- Dialog shows new score → "Back to Dashboard"
- Page auto-refreshes (30s interval via `AutoRefresh`)

---

## AI Classification — `classifyWaste(photoUrl)`

**Model:** GPT-4o-mini with vision, `detail: 'low'`, 8s timeout

**Prompt returns:**
```json
{
  "wasteType": "dry_plastic",
  "recyclable": true,
  "binColor": "blue",
  "prepSteps": ["Remove cap", "Rinse bottle", "Flatten if possible"],
  "tip": "Plastic takes 450 years to decompose — always recycle.",
  "isWaste": true
}
```

**Points logic:**
```
e_waste | hazardous  → 15 pts
recyclable (others)  → 10 pts
non_recyclable       → 2 pts
```

**Fallback:** If API unavailable or JSON parse fails → `{ wasteType: 'non_recyclable', recyclable: false, binColor: 'grey', isWaste: true, pointsEarned: 2 }`

---

## Score / Rate Updates

| Event | What updates |
|---|---|
| Citizen scans recyclable waste | `wards.recycling_rate` +1 (clamped 0–100) |
| Citizen scans any waste | `citizens.eco_points` +points_earned |
| Collector marks collected | `authorities.score` +5, `authorities.resolution_count` +1 |

---

## File Structure

```
src/
├── actions/
│   ├── categorize.ts     classifyWaste() — GPT-4o Vision, returns classification + pointsEarned
│   ├── scan.ts           logWasteScan() — inserts waste_scan, updates eco_points + recycling_rate
│   ├── resolve.ts        confirmPickup() — marks collected, updates collector score
│   ├── upload.ts         uploadIssuePhoto() — unchanged, uploads to Supabase Storage
│   └── onboard.ts        registerCitizen / registerAuthority / verifyAuthorityCode
│
├── types/
│   ├── database.ts       WasteType, WasteScan, RecyclingCenter, Citizen (eco_points), Ward (recycling_rate)
│   └── actions.ts        ClassifyWasteData, LogWasteScanData, ConfirmPickupData
│
├── app/
│   ├── page.tsx          Landing — green theme, waste branding, live scan/recycling stats
│   ├── onboarding/       Role picker → citizen form OR authority code → authority profile
│   │
│   ├── (citizen)/
│   │   ├── layout.tsx    CitizenNav wrapper
│   │   ├── home/         Eco-points dashboard + recent scans
│   │   ├── report/       7-step scan flow (ReportFlow.tsx)
│   │   ├── my-scans/     Full scan history with status
│   │   ├── leaderboard/  Citizens by eco_points + wards by recycling_rate
│   │   └── map/          Ward recycling rate circles + recycling center markers
│   │
│   └── (authority)/
│       └── dashboard/    Pending pickups list + Mark Collected action
│
├── components/
│   ├── CitizenNav.tsx    Home | Scan Waste | Centers | Leaderboard (green accent)
│   └── camera/           CameraCapture — unchanged
│
└── lib/
    ├── geo.ts            GPS + findNearestWardGeojsonId — unchanged
    ├── score.ts          clampScore() — unchanged, used for recycling_rate clamping
    └── supabase/         client + server helpers — unchanged
```

---

## RLS Policies

| Table | Policy | Rule |
|---|---|---|
| `waste_scans` | `waste_scans_citizen_own` | Citizens can read/write their own rows |
| `waste_scans` | `waste_scans_collector_read` | All authenticated users can read (collectors need to see ward scans) |
| `recycling_centers` | `recycling_centers_public_read` | Public read — no auth required |

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=          # optional — falls back to non_recyclable if missing
```
