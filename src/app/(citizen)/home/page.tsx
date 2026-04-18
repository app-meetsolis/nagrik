import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Camera, Leaf, Recycle } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const WASTE_LABEL: Record<string, string> = {
  wet_organic:    'Wet Organic',
  dry_paper:      'Paper',
  dry_plastic:    'Plastic',
  dry_metal:      'Metal',
  dry_glass:      'Glass',
  e_waste:        'E-Waste',
  hazardous:      'Hazardous',
  textile:        'Textile',
  non_recyclable: 'Non-Recyclable',
}

const BIN_DOT: Record<string, string> = {
  green: 'bg-green-500',
  blue:  'bg-blue-500',
  red:   'bg-red-500',
  grey:  'bg-slate-400',
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'text-amber-700 bg-amber-50',
  collected: 'text-green-700 bg-green-50',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  const firstName = user?.firstName ?? 'there'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Get citizen record with eco_points
  const { data: citizen } = await db
    .from('citizens')
    .select('id, eco_points')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string; eco_points: number } | null; error: unknown }

  const ecoPoints = citizen?.eco_points ?? 0

  // All scans for stats + recent 5 for the list
  const allScans = citizen ? (await db
    .from('waste_scans')
    .select('id, photo_url, waste_type, bin_color, points_earned, pickup_status, recyclable, created_at, ward_id')
    .eq('citizen_id', citizen.id)
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; photo_url: string; waste_type: string; bin_color: string
        points_earned: number; pickup_status: string; recyclable: boolean
        created_at: string; ward_id: string | null
      }> | null
      error: unknown
    }).data ?? [] : []

  // Ward recycling rate
  let wardRecyclingRate: number | null = null
  if (allScans.length > 0 && allScans[0].ward_id) {
    const { data: ward } = await db
      .from('wards')
      .select('recycling_rate')
      .eq('id', allScans[0].ward_id)
      .single() as { data: { recycling_rate: number } | null; error: unknown }
    wardRecyclingRate = ward?.recycling_rate ?? null
  }

  const total      = allScans.length
  const recyclable = allScans.filter(s => s.recyclable).length
  const recyclePct = total > 0 ? Math.round((recyclable / total) * 100) : 0
  const recentList = allScans.slice(0, 5)

  return (
    <div className="flex flex-col min-h-full">

      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-slate-100 shrink-0">
        <h1 className="text-slate-900 font-semibold text-lg">Welcome back, {firstName}</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your eco impact</p>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-5 pb-20 md:pb-6">

        {/* Eco-points hero */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-700 uppercase tracking-widest font-medium">Eco Points</p>
            <p className="text-5xl font-bold text-green-700 mt-1">{ecoPoints}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
            <Leaf className="w-7 h-7 text-green-600" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-400">Scans</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Recycle className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xl font-bold text-green-600">{recyclePct}%</p>
            </div>
            <p className="text-xs text-slate-400">Recyclable</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">
              {wardRecyclingRate !== null ? `${wardRecyclingRate}%` : '—'}
            </p>
            <p className="text-xs text-slate-400">Ward rate</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/report"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Camera className="w-4 h-4" />
          Scan Waste
        </Link>

        {/* Recent scans */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Recent Scans</p>
            {allScans.length > 0 && (
              <Link href="/my-scans" className="text-xs text-green-600 font-medium">
                View all →
              </Link>
            )}
          </div>

          {recentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Leaf className="w-10 h-10 text-slate-200" />
              <div>
                <p className="text-slate-900 font-semibold text-sm">No scans yet</p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  Start scanning waste to earn eco-points and help your ward.
                </p>
              </div>
            </div>
          ) : (
            recentList.map(scan => (
              <div
                key={scan.id}
                className="flex gap-3 bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                {/* Photo */}
                <div className="w-20 h-20 shrink-0 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={scan.photo_url} alt="Waste" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 py-2.5 pr-3 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${BIN_DOT[scan.bin_color] ?? 'bg-slate-400'}`} />
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {WASTE_LABEL[scan.waste_type] ?? scan.waste_type}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[scan.pickup_status] ?? STATUS_STYLE.pending}`}>
                      {scan.pickup_status === 'collected' ? 'Collected' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-green-600 font-semibold">+{scan.points_earned} pts</span>
                    <span className="text-xs text-slate-400">{timeAgo(scan.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  )
}
