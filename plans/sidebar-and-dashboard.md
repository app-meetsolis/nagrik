# Plan: Fix Sidebar Layout + Citizen Dashboard

## Context
Three problems to fix:
1. **Sidebar overlaps content** — CitizenNav uses `position: fixed` + `md:pl-56` padding hack. The authority layout already does this correctly with flex. Need to match that pattern.
2. **Post-login redirect goes to `/map`** — should go to new `/home` citizen dashboard.
3. **Clerk modal warning** — SignIn/SignUpButton stay mounted briefly after client-side sign-in.

**The nav rule (confirmed by user):**
- Desktop: sidebar permanently on left on ALL app pages (leaderboard, map, home, report, my-reports) — for everyone, no auth check
- Mobile: bottom nav bar permanently on all the same pages
- Landing `/`: own header (unchanged, no sidebar)
- Authority `/dashboard`: own sidebar (unchanged)

**Cache issue:** Not a code bug. Hard reload: `Ctrl+Shift+R`. For dev: delete `.next/` folder and restart.

---

## Changes

### 1. Move leaderboard + map under `(citizen)/`

Move these files so they get the citizen flex layout:
- `src/app/leaderboard/page.tsx` → `src/app/(citizen)/leaderboard/page.tsx`
- `src/app/map/page.tsx` → `src/app/(citizen)/map/page.tsx`
- `src/app/map/MapPageClient.tsx` → `src/app/(citizen)/map/MapPageClient.tsx`
- `src/app/map/WardMap.tsx` → `src/app/(citizen)/map/WardMap.tsx`
- `src/app/map/WardMapLoader.tsx` → `src/app/(citizen)/map/WardMapLoader.tsx`

Remove `<PublicNav />` from both pages after moving (sidebar replaces it for navigation).

---

### 2. Fix CitizenNav — flex child, not fixed

**File:** `src/components/CitizenNav.tsx`

Desktop aside — change from:
```
hidden md:flex fixed left-0 top-0 bottom-0 w-56 … z-50
```
to:
```
hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white h-full
```
- Removed: `fixed`, `left-0`, `top-0`, `bottom-0`, `z-50`
- Added: `shrink-0`, `h-full`
- Now sits naturally in the flex row, pushes content right — no overlap possible

Mobile bottom nav (`md:hidden fixed bottom-0`) — unchanged, stays fixed.

---

### 3. Fix `(citizen)/layout.tsx` — flex container, no auth check

**File:** `src/app/(citizen)/layout.tsx`

```tsx
import { CitizenNav } from '@/components/CitizenNav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] bg-white text-slate-900 overflow-hidden">
      <CitizenNav />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
```

- Same pattern as `(authority)/layout.tsx` — proven to work
- No `md:pl-56` padding hack — sidebar is in the flex flow
- `flex-1 min-w-0` on main prevents it shrinking behind sidebar
- No auth check — nav is always visible to all visitors on these pages

---

### 4. Create citizen home dashboard

**File:** `src/app/(citizen)/home/page.tsx` ← NEW

```
Data: currentUser() for name, issues table for stats/recent reports

UI layout:
┌─────────────────────────────────────┐
│ Header — "Welcome back, [Name]"     │
│ subtitle: "Your civic impact"       │
├──────┬──────┬──────────────────────┤
│Total │Active│ Resolved  (3 cards)  │
├─────────────────────────────────────┤
│ "Report an Issue" orange CTA button │
├─────────────────────────────────────┤
│ Recent Reports (last 5)             │
│ Same card style as my-reports       │
│ "View all →" link to /my-reports    │
├─────────────────────────────────────┤
│ Empty state if no reports yet       │
└─────────────────────────────────────┘
```

Data pattern: same as `src/app/(citizen)/my-reports/page.tsx` — `createServiceClient()`,
fetch citizen by `clerk_user_id`, fetch issues, ward name lookup.

---

### 5. Fix redirects

**File:** `src/app/page.tsx`
- Server redirect: desktop → `/home` (was `/map`), mobile → `/report`
- Wrap `<SignInButton>` and `<SignUpButton>` in `<SignedOut>` from `@clerk/nextjs` to fix Clerk warning

**File:** `src/components/AuthRedirect.tsx`
- Change redirect target: desktop → `/home` (was `/map`)

---

### 6. Deploy

```bash
git checkout master
git merge ui-redesign
git push origin master   # Vercel auto-deploys on push to master
```

---

## Files Summary

| File | Action |
|---|---|
| `src/components/CitizenNav.tsx` | Modify — remove fixed positioning, use flex child |
| `src/app/(citizen)/layout.tsx` | Modify — flex container, no auth check |
| `src/app/(citizen)/home/page.tsx` | Create — citizen dashboard |
| `src/app/(citizen)/leaderboard/page.tsx` | Move from `leaderboard/`, remove PublicNav |
| `src/app/(citizen)/map/page.tsx` | Move from `map/`, remove PublicNav |
| `src/app/(citizen)/map/MapPageClient.tsx` | Move from `map/` |
| `src/app/(citizen)/map/WardMap.tsx` | Move from `map/` |
| `src/app/(citizen)/map/WardMapLoader.tsx` | Move from `map/` |
| `src/app/page.tsx` | Modify — redirect to `/home`, wrap buttons in `<SignedOut>` |
| `src/components/AuthRedirect.tsx` | Modify — redirect desktop to `/home` |
| `src/app/leaderboard/page.tsx` | Delete (moved) |
| `src/app/map/` (all files) | Delete (moved) |

## Verification

1. Visit `/leaderboard` without logging in → sidebar on desktop, bottom nav on mobile, content fills right cleanly
2. Visit `/map` → same layout
3. Sign in via modal on `/` → immediately redirected: desktop → `/home`, mobile → `/report`
4. On `/home` — sidebar left, content right, no overlap, scrolls independently
5. Navigate between pages via sidebar — sidebar stays, only content area changes
6. Authority login → `/dashboard` — unaffected, own sidebar works
7. No Clerk warnings in console
8. Check Vercel deploy URL after merge to master
