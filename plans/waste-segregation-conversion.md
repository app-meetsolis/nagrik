# Nagrik → AI Waste Segregation & Recycling Platform
## Conversion Plan (Corrected)

---

## What We're Building

Citizens photograph waste → AI classifies type + correct bin → earns eco-points.
Collectors (authority role) confirm pickups → scored on completion rate.
Ward recycling rate is public. Both sides are accountable. Same shame/fame loop as Nagrik.

```
CITIZEN                          COLLECTOR (authority role)
───────                          ──────────────────────────
Snap photo of waste         →    Sees pending pickups for their ward
AI: type + bin + tip + points    Marks pickup collected
Eco-points credited              Collector score improves
Ward recycling rate updates      Ward recycling rate updates
```

---

## Known Bugs in the Original Plan (Fixed Here)

| # | Bug | Fix |
|---|-----|-----|
| 1 | "Delete submit.ts" breaks build — ReportFlow imports it | Delete ONLY after ReportFlow is fully rewritten |
| 2 | Two hardcoded `/my-reports` links in ReportFlow.tsx (lines 147, 318) | Fix both links when rewriting ReportFlow |
| 3 | resolve.ts inserts into escalation_events — plan removed that table | Remove escalation_events insert from confirmPickup |
| 4 | resolve.ts requires photo (line 27) — plan said "optional photo" | Remove photo requirement in confirmPickup |
| 5 | issue.ts (markInProgress) not in plan — imported by IssueActions.tsx | Repurpose as markPickupInProgress or delete with IssueActions update |
| 6 | Recycling centers map empty — no seed data planned | Add 10 seeded Jaipur recycling center rows in migration |
| 7 | Keep Issue + EscalationEvent types until resolve.ts is updated | Remove them only in the final cleanup step |

---

## Implementation Steps (Strict Order)

### PHASE 1 — Database (30 min)
> Do this first. Everything else depends on the schema.

**Step 1 — Run this SQL in Supabase dashboard:**

```sql
-- 1. Waste type enum
create type public.waste_type as enum (
  'wet_organic', 'dry_paper', 'dry_plastic', 'dry_metal',
  'dry_glass', 'e_waste', 'hazardous', 'textile', 'non_recyclable'
);

-- 2. Add eco_points to citizens
alter table public.citizens
  add column if not exists eco_points integer not null default 0;

-- 3. Add recycling_rate to wards (replaces score for this domain)
alter table public.wards
  add column if not exists recycling_rate integer not null default 50;

-- 4. waste_scans table (replaces issues)
create table if not exists public.waste_scans (
  id             uuid primary key default uuid_generate_v4(),
  citizen_id     uuid references public.citizens(id) on delete cascade,
  ward_id        uuid references public.wards(id) on delete set null,
  collector_id   uuid references public.authorities(id) on delete set null,
  photo_url      text not null,
  waste_type     public.waste_type not null default 'non_recyclable',
  recyclable     boolean not null default false,
  bin_color      text not null default 'grey',
  prep_steps     text[] not null default '{}',
  tip            text,
  points_earned  integer not null default 0,
  pickup_status  text not null default 'pending',  -- pending | collected
  collected_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- 5. recycling_centers table
create table if not exists public.recycling_centers (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  address        text not null,
  lat            double precision not null,
  lng            double precision not null,
  accepted_types public.waste_type[] not null default '{}',
  ward_id        uuid references public.wards(id) on delete set null,
  open_hours     text,
  created_at     timestamptz not null default now()
);

-- 6. Seed 10 Jaipur recycling centers
insert into public.recycling_centers (name, address, lat, lng, accepted_types, open_hours) values
  ('Mansarovar Green Hub',    'Mansarovar, Jaipur',        26.8514, 75.7573, '{dry_plastic,dry_paper,dry_metal}',           '9am–6pm Mon–Sat'),
  ('Vaishali E-Waste Drop',   'Vaishali Nagar, Jaipur',    26.9100, 75.7250, '{e_waste}',                                   '10am–5pm Mon–Fri'),
  ('Malviya Nagar Recycling', 'Malviya Nagar, Jaipur',     26.8570, 75.8060, '{dry_plastic,dry_paper,dry_glass}',           '9am–7pm Daily'),
  ('Civil Lines Waste Depot', 'Civil Lines, Jaipur',        26.9260, 75.8010, '{wet_organic,dry_paper,dry_plastic}',         '8am–4pm Daily'),
  ('Jagatpura Compost Point', 'Jagatpura, Jaipur',         26.8250, 75.8690, '{wet_organic}',                               '7am–12pm Daily'),
  ('Sanganer Textile Collect','Sanganer, Jaipur',           26.7930, 75.8170, '{textile,dry_plastic}',                       '10am–6pm Mon–Sat'),
  ('Tonk Road Hazmat Unit',   'Tonk Road, Jaipur',         26.8700, 75.8300, '{hazardous,e_waste}',                         '9am–3pm Mon–Fri'),
  ('Adarsh Nagar Eco Center', 'Adarsh Nagar, Jaipur',      26.9400, 75.8100, '{dry_paper,dry_plastic,dry_glass,dry_metal}', '9am–6pm Daily'),
  ('Pratap Nagar Depot',      'Pratap Nagar, Jaipur',      26.8390, 75.8500, '{wet_organic,dry_plastic,dry_paper}',         '8am–5pm Daily'),
  ('Sitapura Industrial Hub', 'Sitapura Industrial Area',   26.7780, 75.8520, '{e_waste,hazardous,dry_metal}',               '9am–5pm Mon–Sat');

-- 7. RLS
alter table public.waste_scans enable row level security;
alter table public.recycling_centers enable row level security;

create policy "waste_scans_citizen_own"
  on public.waste_scans for all
  using (citizen_id in (
    select id from public.citizens where clerk_user_id = auth.uid()::text
  ));

create policy "waste_scans_collector_read"
  on public.waste_scans for select
  using (true);

create policy "recycling_centers_public_read"
  on public.recycling_centers for select using (true);
```

---

### PHASE 2 — Types (15 min)

**Step 2 — `src/types/database.ts`**
- Add `WasteType` union type
- Add `WasteScan` interface
- Add `RecyclingCenter` interface
- Update `Citizen` — add `eco_points: number`
- Update `Ward` — add `recycling_rate: number`
- **KEEP `Issue` and `EscalationEvent`** — remove them only in Step 9 after resolve.ts is done

**Step 3 — `src/types/actions.ts`**
- Add `ClassifyWasteData` — `{ wasteType, recyclable, binColor, prepSteps, tip, pointsEarned }`
- Add `LogWasteScanData` — `{ scanId, pointsEarned, totalEcoPoints }`
- Add `ConfirmPickupData` — `{ scanId, newCollectorScore }`
- Keep existing interfaces until their actions are deleted

---

### PHASE 3 — Actions (1.5 hrs)

**Step 4 — Rewrite `src/actions/categorize.ts` → `classifyWaste(photoUrl)`**

New prompt:
```
You are a waste classification AI for India.
Analyze the photo and respond with ONLY valid JSON:
{
  "wasteType": "wet_organic"|"dry_paper"|"dry_plastic"|"dry_metal"|"dry_glass"|"e_waste"|"hazardous"|"textile"|"non_recyclable",
  "recyclable": true|false,
  "binColor": "green"|"blue"|"red"|"grey",
  "prepSteps": ["string", ...],  // max 3 steps
  "tip": "string",               // one eco-tip
  "isWaste": true|false          // false if photo is not waste at all
}

Bin colors: green=wet organic, blue=dry recyclables, red=hazardous/e-waste, grey=non-recyclable
```

Points logic (in this file):
```
e_waste | hazardous → 15 pts
recyclable (non-hazardous) → 10 pts
non_recyclable → 2 pts
```

**Step 5 — Write `src/actions/scan.ts` → `logWasteScan(...)`**
- Auth check
- Upsert citizen record (same pattern as submit.ts)
- Find collector for ward (same pattern as submit.ts authority lookup)
- Insert `waste_scans` row
- Increment `citizens.eco_points` by `pointsEarned`
- Increment `wards.recycling_rate` by +1 if recyclable (clamped 0–100)
- Return `{ scanId, pointsEarned, totalEcoPoints }`

**Step 6 — Rewrite `src/actions/resolve.ts` → `confirmPickup(scanId)`**
- Auth check → find authority/collector
- Fetch waste_scan (verify `collector_id` matches or ward matches)
- **No photo — remove all file upload code**
- Update `waste_scans`: `pickup_status='collected'`, `collected_at=now()`
- Increment `authorities.score` by +5 (flat, not severity-based)
- Increment `authorities.resolution_count`
- **Remove `escalation_events` insert entirely**
- Return `{ scanId, newCollectorScore }`

**Step 7 — Repurpose `src/actions/issue.ts` → `markScanInProgress` (or delete)**
- If keeping in-progress state: change table from `issues` to `waste_scans`, field from `status` to `pickup_status`
- If removing in-progress state (simpler): delete this file and update IssueActions.tsx to only show "Mark Collected"

> Recommendation: delete in-progress state. Waste pickup is binary — either collected or not. Simplifies the dashboard.

---

### PHASE 4 — Citizen Flow (2.5 hrs)

**Step 8 — Rewrite `src/app/(citizen)/report/ReportFlow.tsx`**

Keep the exact same step machine: `capture → processing → preview → analyzing → categorized → submitting → success`

Changes:
- Import `classifyWaste` instead of `categorizePhoto`
- Import `logWasteScan` instead of `submitIssue`
- Result card shows: bin color dot, waste type label, prep steps list, eco-tip, `+X eco-points` badge
- Invalid photo message: "This doesn't look like waste. Point camera at a waste item."
- Success screen: shows points earned + running total
- **Fix line 147**: `href="/my-reports"` → `href="/my-scans"`
- **Fix line 318**: `href="/my-reports"` → `href="/my-scans"`
- **Delete `submit.ts` only after this file is saved and builds cleanly**

**Step 9 — Update `src/app/(citizen)/home/page.tsx`**
- Hero stat: eco-points balance (big number)
- Secondary stats: total scans, recyclable %, ward recycling rate
- Recent scans list (last 5) with waste type + bin color dot + points
- Remove all issue/civic references

**Step 10 — Rename route + rewrite `my-reports` → `my-scans`**
- Rename folder: `src/app/(citizen)/my-reports/` → `src/app/(citizen)/my-scans/`
- Rewrite page: query `waste_scans`, show waste type + bin color dot + points earned + pickup status
- After confirming it builds: delete old my-reports folder

**Step 11 — Rewrite `src/app/(citizen)/leaderboard/page.tsx`**
- Tab 1: Top Citizens — ranked by `eco_points`
- Tab 2: Top Wards — ranked by `recycling_rate`
- Remove authority leaderboard

---

### PHASE 5 — Map (45 min)

**Step 12 — Update `src/app/(citizen)/map/WardMap.tsx`**
- Ward circles: color based on `recycling_rate` (not `score`)
  - Green ≥70, Amber 40–69, Red <40
- Add recycling center markers: green leaf pin
- Click on center: popup with name, accepted types, open hours
- Query `recycling_centers` from Supabase on load

---

### PHASE 6 — Collector Dashboard (1 hr)

**Step 13 — Rewrite `src/app/(authority)/dashboard/page.tsx`**
- Query `waste_scans` where `collector_id = authority.id` AND `pickup_status = 'pending'`
  - OR query by `ward_id` if collector_id is not yet assigned on scan submission
- Stats: pending pickups, collected today, collector score
- Remove "Active Issues" label → "Pending Pickups"
- Remove `CATEGORY_EMOJI` and `SEVERITY_STYLE` — replace with waste type + bin color

**Step 14 — Rewrite `src/app/(authority)/dashboard/IssueActions.tsx`**
- Remove "Mark In Progress" button entirely
- Single action: "Mark Collected" → calls `confirmPickup(scanId)`
- Remove import of `markInProgress` from issue.ts
- After this: delete `src/actions/issue.ts`

**Step 15 — Simplify `src/app/(authority)/dashboard/ResolveDialog.tsx`**
- Remove photo upload UI entirely
- Simple confirmation dialog: "Confirm this waste has been collected?"
- Confirm button calls `confirmPickup`

---

### PHASE 7 — Branding (45 min)

**Step 16 — Rewrite `src/app/page.tsx` (landing)**
- New headline: "AI-Powered Waste Segregation for Smarter Cities"
- Feature row: Scan Waste | Earn Points | Track Pickups
- Live stats: total scans, recyclable rate, avg ward recycling rate
- Green color accent (replace orange)

**Step 17 — Update `src/components/CitizenNav.tsx`**
- Labels: Home | Scan | Centers | Leaderboard
- Icons: Home, Camera, MapPin, Trophy
- "Centers" links to `/map` (recycling centers are on the map)

**Step 18 — Update `src/app/onboarding/OnboardingShell.tsx`**
- Citizen card: "Scan & segregate your waste. Earn eco-points."
- Authority card: "Manage waste pickups for your ward."

---

### PHASE 8 — Final Cleanup (15 min)

**Step 19 — Delete dead files** (only after build passes):
- `src/actions/submit.ts`
- `src/actions/issue.ts`

**Step 20 — Remove from `database.ts`**:
- `Issue` interface
- `EscalationEvent` interface
- Related Database table entries

**Step 21 — Remove from `actions.ts`**:
- `SubmitIssueData`
- `CategorizePhotoData`
- `ResolveIssueData`

**Step 22 — Run build + fix errors**:
```bash
npm run build
```

---

## Files Changed Summary

| File | Action |
|---|---|
| `src/actions/categorize.ts` | Full rewrite → `classifyWaste` |
| `src/actions/scan.ts` | NEW |
| `src/actions/resolve.ts` | Full rewrite → `confirmPickup` (no photo, no escalation_events) |
| `src/actions/submit.ts` | DELETE (after Step 8) |
| `src/actions/issue.ts` | DELETE (after Step 14) |
| `src/types/database.ts` | Add waste types, update Citizen + Ward, remove Issue + EscalationEvent (Step 19) |
| `src/types/actions.ts` | Add waste action types, remove civic action types (Step 19) |
| `src/app/(citizen)/report/ReportFlow.tsx` | Full rewrite + fix /my-reports links |
| `src/app/(citizen)/home/page.tsx` | Full rewrite |
| `src/app/(citizen)/my-reports/` → `my-scans/` | Rename folder + rewrite page |
| `src/app/(citizen)/leaderboard/page.tsx` | Full rewrite (dual leaderboard) |
| `src/app/(citizen)/map/WardMap.tsx` | Add recycling centers, recycling_rate coloring |
| `src/app/(authority)/dashboard/page.tsx` | Full rewrite → waste pickups |
| `src/app/(authority)/dashboard/IssueActions.tsx` | Full rewrite → "Mark Collected" only |
| `src/app/(authority)/dashboard/ResolveDialog.tsx` | Simplify → no photo |
| `src/app/page.tsx` | Full rewrite → waste branding |
| `src/components/CitizenNav.tsx` | Update labels + links |
| `src/app/onboarding/OnboardingShell.tsx` | Update copy |
| `src/lib/score.ts` | Keep as-is (reused for collector scoring) |
| `src/lib/geo.ts` | Keep as-is (GPS + ward detection unchanged) |
| `src/actions/upload.ts` | Keep as-is (photo upload unchanged) |
| `src/components/camera/CameraCapture.tsx` | Keep as-is |
| `src/lib/supabase/` | Keep as-is |
| `src/lib/clerk.ts` | Keep as-is |

---

## Time Estimate

| Phase | Time |
|---|---|
| Database + seed | 30 min |
| Types | 15 min |
| Actions | 1.5 hr |
| Citizen flow | 2.5 hr |
| Map | 45 min |
| Collector dashboard | 1 hr |
| Branding | 45 min |
| Cleanup + build fix | 15 min |
| **Total** | **~8 hours** |

---

## Verification Checklist

- [ ] `npm run build` — zero TypeScript errors
- [ ] Citizen: photo of plastic bottle → `dry_plastic`, blue bin, prep steps, +10 points
- [ ] Citizen: photo of old phone → `e_waste`, red bin, +15 points
- [ ] Citizen: photo of food scraps → `wet_organic`, green bin, +10 points
- [ ] Home page: eco-points balance updates after scan
- [ ] `/my-scans` loads (not 404)
- [ ] No broken `/my-reports` links anywhere
- [ ] Leaderboard: citizens ranked by eco_points
- [ ] Map: recycling centers show as green markers with popup
- [ ] Collector dashboard: pending pickups appear
- [ ] Collector: "Mark Collected" works without photo upload
- [ ] `npm run build` again after cleanup — still zero errors
