import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
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

const BIN_LABEL: Record<string, string> = {
  green: 'Green Bin',
  blue:  'Blue Bin',
  red:   'Red Bin',
  grey:  'Grey Bin',
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'text-amber-700 bg-amber-50',
  collected: 'text-green-700 bg-green-50',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MyScansPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const { data: citizen } = await db
    .from('citizens')
    .select('id, eco_points')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string; eco_points: number } | null; error: unknown }

  const scans = citizen ? (await db
    .from('waste_scans')
    .select('id, photo_url, waste_type, bin_color, points_earned, pickup_status, recyclable, created_at')
    .eq('citizen_id', citizen.id)
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; photo_url: string; waste_type: string; bin_color: string
        points_earned: number; pickup_status: string; recyclable: boolean; created_at: string
      }> | null
      error: unknown
    }).data ?? [] : []

  const list       = scans
  const collected  = list.filter(s => s.pickup_status === 'collected').length
  const totalPts   = citizen?.eco_points ?? 0

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <h1 className="text-slate-900 font-semibold text-base">My Scans</h1>

        {list.length > 0 && (
          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-slate-900">{list.length}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-green-600">{collected}</p>
              <p className="text-xs text-slate-400">Collected</p>
            </div>
            <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">{totalPts}</p>
              <p className="text-xs text-green-600">Eco pts</p>
            </div>
          </div>
        )}
      </header>

      {/* List */}
      <main className="flex-1 px-4 py-4 pb-20 md:pb-6 flex flex-col gap-3">
        {list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Leaf className="w-12 h-12 text-slate-200" />
            <div>
              <p className="text-slate-900 font-semibold">No scans yet</p>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                Start scanning waste to earn eco-points and contribute to your ward&apos;s recycling rate.
              </p>
            </div>
            <Link
              href="/report"
              className="mt-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Scan Waste
            </Link>
          </div>
        ) : (
          list.map(scan => (
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
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${BIN_DOT[scan.bin_color] ?? 'bg-slate-400'}`} />
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {WASTE_LABEL[scan.waste_type] ?? scan.waste_type}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[scan.pickup_status] ?? STATUS_STYLE.pending}`}>
                    {scan.pickup_status === 'collected' ? 'Collected' : 'Pending'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{BIN_LABEL[scan.bin_color] ?? scan.bin_color}</p>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-green-600 font-semibold">+{scan.points_earned} pts</span>
                  <span className="text-xs text-slate-400">{timeAgo(scan.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
