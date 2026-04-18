import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { AutoRefresh } from './AutoRefresh'
import { IssueActions } from './IssueActions'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, RefreshCw } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────

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
  green: 'Green',
  blue:  'Blue',
  red:   'Red',
  grey:  'Grey',
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Fetch authority record
  const { data: authority } = await db
    .from('authorities')
    .select('id, name, ward_id, score, resolution_count')
    .eq('clerk_user_id', userId)
    .single() as {
      data: {
        id: string; name: string; ward_id: string | null
        score: number; resolution_count: number
      } | null
      error: unknown
    }

  if (!authority) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 text-center gap-4">
        <p className="text-2xl">⏳</p>
        <h2 className="text-slate-900 font-semibold">Account setup pending</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Your collector profile hasn&apos;t been created yet.
          Ask the admin to run the seed SQL with your Clerk user ID.
        </p>
      </div>
    )
  }

  // Fetch ward name
  const { data: ward } = await db
    .from('wards')
    .select('name')
    .eq('id', authority.ward_id)
    .single() as { data: { name: string } | null; error: unknown }

  // Fetch pending scans for this ward
  const { data: scans } = await db
    .from('waste_scans')
    .select('id, photo_url, waste_type, bin_color, recyclable, pickup_status, created_at')
    .eq('ward_id', authority.ward_id)
    .eq('pickup_status', 'pending')
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; photo_url: string; waste_type: string; bin_color: string
        recyclable: boolean; pickup_status: string; created_at: string
      }> | null
      error: unknown
    }

  // Collected today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { data: collectedToday } = await db
    .from('waste_scans')
    .select('id', { count: 'exact', head: true })
    .eq('ward_id', authority.ward_id)
    .eq('pickup_status', 'collected')
    .gte('collected_at', todayStart.toISOString()) as { data: null; count: number | null; error: unknown }

  const pendingCount   = scans?.length ?? 0
  const collectedCount = (collectedToday as unknown as { count: number | null })?.count ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <AutoRefresh />

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Collector Dashboard</p>
            <h1 className="text-lg font-bold text-slate-900">{authority.name}</h1>
            {ward && (
              <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{ward.name}</span>
              </div>
            )}
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{authority.score}</p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{collectedCount}</p>
            <p className="text-xs text-slate-400">Today</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{authority.resolution_count}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
        </div>
      </header>

      {/* Scans list */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-slate-700">Pending Pickups</p>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refreshes</span>
          </div>
        </div>

        {(!scans || scans.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-3xl">✅</p>
            <p className="text-slate-900 font-semibold">All clear!</p>
            <p className="text-slate-400 text-sm">No pending pickups in your ward.</p>
          </div>
        ) : (
          scans.map(scan => (
            <div
              key={scan.id}
              className="flex gap-3 bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              {/* Photo thumbnail */}
              <div className="w-20 h-20 shrink-0 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scan.photo_url}
                  alt="Waste"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 py-2.5 pr-3 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${BIN_DOT[scan.bin_color] ?? 'bg-slate-400'}`} />
                    <p className="text-sm font-semibold text-slate-900">
                      {WASTE_LABEL[scan.waste_type] ?? scan.waste_type}
                    </p>
                  </div>
                  <Badge className="text-xs shrink-0 border-0 bg-amber-50 text-amber-700">
                    Pending
                  </Badge>
                </div>

                <p className="text-xs text-slate-400">{BIN_LABEL[scan.bin_color] ?? scan.bin_color} bin</p>

                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{timeAgo(scan.created_at)}</span>
                  </div>
                  <IssueActions scanId={scan.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
