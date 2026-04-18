# Nagrik — Comprehensive UI/UX Redesign (Light Theme)

## Context
The app currently uses a hardcoded dark design (zinc-950 backgrounds, zinc-900 cards, zinc-800 borders, white text) even though globals.css already defines a light-mode token set. The user wants a white/light theme across every page with best-practice UI patterns, approachable design, applied to both desktop and mobile.

**Orange accent stays.** Camera capture step stays dark (camera viewfinder requires it).

---

## Theme Strategy

**Direct class replacement** (not CSS token migration — pages bypass tokens with hardcoded zinc classes).

### The mapping applied to every file:

| Old (dark) | New (light) |
|---|---|
| `bg-zinc-950` | `bg-white` |
| `bg-zinc-900` | `bg-slate-50` |
| `border-zinc-800` | `border-slate-200` |
| `border-zinc-700` | `border-slate-200` |
| `text-white` (structural) | `text-slate-900` |
| `text-zinc-400` | `text-slate-500` |
| `text-zinc-500` | `text-slate-400` |
| `text-zinc-600` | `text-slate-400` |
| `hover:bg-zinc-800` | `hover:bg-slate-100` |
| `hover:text-white` | `hover:text-slate-900` |
| `bg-zinc-800` (progress track) | `bg-slate-200` |
| `bg-orange-500/15` (active nav) | `bg-orange-50` |
| `text-orange-400` (active nav) | `text-orange-600` |
| `text-green-400` | `text-green-600` |
| `text-amber-400` | `text-amber-600` |
| Status alpha bgs (`bg-green-500/15`) | Opaque: `bg-green-50` |

**Keep unchanged:** All status/severity colors (green/amber/red/blue), orange CTAs, the camera step.

---

## Files to Change (in priority order)

### 1. `src/app/layout.tsx`
- Change `themeColor` from `"#09090b"` → `"#ffffff"`

### 2. `src/app/(citizen)/layout.tsx`
- `bg-zinc-950 text-white` → `bg-white text-slate-900`

### 3. `src/app/(authority)/layout.tsx`
- `bg-zinc-950 text-white` → `bg-slate-50 text-slate-900`

### 4. `src/components/CitizenNav.tsx` — desktop sidebar + mobile FAB
Desktop aside:
- `bg-zinc-950 border-zinc-800` → `bg-white border-slate-200`
- Brand text: `text-white` → `text-slate-900`, `text-zinc-500` → `text-slate-400`, `border-zinc-800` → `border-slate-100`
- Active link: `bg-orange-500/15 text-orange-400` → `bg-orange-50 text-orange-600`
- Inactive: `text-zinc-400 hover:bg-zinc-800 hover:text-white` → `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
- Sign out: `text-zinc-500 hover:bg-zinc-800 hover:text-white` → `text-slate-400 hover:bg-slate-50 hover:text-slate-700`, `border-zinc-800` → `border-slate-100`

Mobile bottom nav:
- `bg-zinc-950 border-zinc-800` → `bg-white/95 backdrop-blur-sm border-slate-200` + `shadow-[0_-1px_4px_rgba(0,0,0,0.06)]`
- Inactive icons: `text-zinc-500` → `text-slate-400`
- Active icons: `text-orange-400` → `text-orange-500`

### 5. `src/app/(authority)/dashboard/Sidebar.tsx`
Same substitutions as CitizenNav desktop sidebar.

### 6. `src/components/PublicNav.tsx`
- Header: `border-zinc-800` → `border-slate-100`
- Logo: `text-white hover:text-orange-400` → `text-slate-900 hover:text-orange-500`
- Active: `bg-orange-500/15 text-orange-400` → `bg-orange-50 text-orange-600`
- Inactive: `text-zinc-400 hover:text-white hover:bg-zinc-800` → `text-slate-500 hover:text-slate-900 hover:bg-slate-50`

### 7. `src/app/page.tsx` — Landing page (full redesign)
Color swaps:
- Outer div: `bg-zinc-950 text-white` → `bg-white text-slate-900`
- Badge: `bg-orange-500/15 text-orange-400 border-orange-500/20` → `bg-orange-50 text-orange-600 border-orange-200`
- Subheading: `text-zinc-400` → `text-slate-500`
- Sign In: `text-zinc-400 hover:text-white` → `text-slate-500 hover:text-slate-900`
- Secondary buttons: `border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white` → `border-slate-200 text-slate-700 hover:bg-slate-50`
- Stats footer: `border-zinc-800` → `border-slate-100`, add `bg-slate-50`
- Stats values: `text-white` → `text-slate-900`, `text-green-400` → `text-green-600`, `text-orange-400` → `text-orange-500`
- Stat labels: `text-zinc-500` → `text-slate-400`

Structural additions:
- Add 3-column feature row between subheading and CTAs (hidden on mobile, shown sm+):
  - 📸 Snap a photo | 🤖 AI categorizes | ⚖️ Officials scored
  - `text-slate-500 text-sm` labels
- Update CTA copy: "Report an Issue" → "Get Started — It's Free"
- CTA hover: `hover:bg-orange-400` → `hover:bg-orange-600`

### 8. `src/app/leaderboard/page.tsx`
- Outer: `bg-zinc-950` → `bg-white`
- RANK_STYLE: gold `border-yellow-200 bg-yellow-50`, silver `border-slate-200 bg-slate-50`, bronze `border-orange-200 bg-orange-50`
- Podium text: `text-white` → `text-slate-900`, `text-zinc-500` → `text-slate-400`
- Score bar track: `bg-zinc-800` → `bg-slate-200`
- `scoreToColor()`: all `-400` → `-600`
- Rankings rows: `bg-zinc-900 border-zinc-800` → `bg-white border-slate-200`
- Rank #: `text-zinc-600` → `text-slate-300`
- Name: `text-white` → `text-slate-900`; Ward/resolution: `text-slate-400`

### 9. `src/app/(citizen)/my-reports/page.tsx`
- Header border: `border-zinc-800` → `border-slate-100`
- Stats cards: `bg-zinc-900` → `bg-slate-50 border border-slate-100`
- Values: `text-amber-400` → `text-amber-600`, `text-green-400` → `text-green-600`
- Issue cards: `bg-zinc-900 border-zinc-800` → `bg-white border-slate-200`
- Photo: `bg-zinc-800` → `bg-slate-100`
- STATUS_CONFIG: `pending` → `'text-slate-600 bg-slate-100'`, `in_progress` → `'text-blue-600 bg-blue-50'`, `resolved` → `'text-green-600 bg-green-50'`
- SEVERITY_COLOR: `minor` → `'text-green-700 bg-green-50'`, `moderate` → `'text-amber-700 bg-amber-50'`, `critical` → `'text-red-700 bg-red-50'`
- Empty state icon: `text-zinc-700` → `text-slate-200`

### 10. `src/app/(authority)/dashboard/page.tsx`
- Header: `border-zinc-800` → `border-slate-200`
- Stats cards: `bg-zinc-900` → `bg-white border border-slate-200`
- `text-blue-400` → `text-blue-600`, `text-green-400` → `text-green-600`
- Issue cards: `bg-zinc-900 border-zinc-800` → `bg-white border-slate-200`
- Photo: `bg-zinc-800` → `bg-slate-100`
- SEVERITY_STYLE: minor/moderate/critical → `bg-*-50 text-*-700` pattern
- STATUS_STYLE: pending/in_progress → `bg-*-50 text-*-600` pattern

### 11. `src/app/(authority)/dashboard/IssueActions.tsx`
- "Start Working": `bg-blue-500/15 text-blue-400` → `bg-blue-50 text-blue-600 border border-blue-200`
- "Upload Resolution": `bg-orange-500/15 text-orange-400` → `bg-orange-50 text-orange-600 border border-orange-200`

### 12. `src/app/(authority)/dashboard/ResolveDialog.tsx`
- Dialog: `bg-zinc-900 border-zinc-800 text-white` → `bg-white border-slate-200 text-slate-900`
- Drop zone: `border-zinc-700 hover:border-zinc-500` → `border-slate-300 hover:border-slate-400`
- "Back to Dashboard": `bg-zinc-800 hover:bg-zinc-700` → `bg-slate-100 hover:bg-slate-200 text-slate-700`

### 13. `src/app/map/page.tsx`
- `bg-zinc-950` → `bg-white`

### 14. `src/app/map/MapPageClient.tsx`
- Floating legend: `bg-zinc-900/90 border-zinc-800 text-zinc-300` → `bg-white/95 backdrop-blur border-slate-200 text-slate-700`
- Toggle bar: `border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900` → `border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
- Score cards: opaque `bg-*-50` backgrounds, `border-*-200` borders, `text-slate-900` ward names, `bg-slate-200` progress tracks, score text `-400` → `-600`

### 15. `src/app/(citizen)/report/ReportFlow.tsx`
Add step-based dark/light split:
```tsx
const isDark = ['capture', 'processing', 'analyzing', 'submitting'].includes(step)
// Outer div: add ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'}
```
- Categorized card: `bg-zinc-900 border-zinc-800` → `bg-white border-slate-200`, inner `bg-zinc-950` → `bg-slate-50`
- "Ready to submit" badge: `bg-zinc-800 text-zinc-400 border-zinc-700` → `bg-orange-50 text-orange-600 border-orange-200`
- Success icon: `w-20 h-20 bg-green-500/15 border-green-500/30` → `w-24 h-24 bg-green-50 border-2 border-green-200`, icon `text-green-400` → `text-green-500`
- Details card: `bg-zinc-900 border-zinc-800` → `bg-slate-50 border-slate-200`
- Secondary buttons: `border-zinc-700 text-zinc-300 hover:bg-zinc-800` → `border-slate-200 text-slate-700 hover:bg-slate-50`

---

## Verification
- Landing page (unauthenticated) → white bg, orange badge, 3-feature row, slate-50 stats strip
- Citizen login on desktop → white sidebar, orange active state, lands on `/map`
- Citizen `/my-reports` → white cards, slate-200 borders, opaque status pills
- `/leaderboard` → white bg, opaque podium cards (yellow-50/slate-50/orange-50)
- `/report` capture step → stays dark; categorized/success steps → white-themed
- Authority login → white sidebar, slate-50 page bg, white issue cards
- Mobile → white/glass bottom nav with orange FAB
