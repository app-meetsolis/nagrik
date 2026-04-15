import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
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

const CATEGORY_EMOJI: Record<string, string> = {
  garbage: '🗑️', pothole: '🕳️', drainage: '💧', streetlight: '💡', other: '📌',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending:     { label: 'Pending',     color: 'text-zinc-400  bg-zinc-800',          icon: Clock        },
  in_progress: { label: 'In Progress', color: 'text-blue-400  bg-blue-500/15',       icon: Loader2      },
  resolved:    { label: 'Resolved',    color: 'text-green-400 bg-green-500/15',      icon: CheckCircle2 },
}

const SEVERITY_COLOR: Record<string, string> = {
  minor:    'text-green-400 bg-green-500/10',
  moderate: 'text-amber-400 bg-amber-500/10',
  critical: 'text-red-400   bg-red-500/10',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MyReportsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Get citizen record
  const { data: citizen } = await db
    .from('citizens')
    .select('id')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string } | null; error: unknown }

  // If citizen hasn't submitted anything yet, they won't have a record
  const issues = citizen ? (await db
    .from('issues')
    .select('id, photo_url, ai_category, ai_severity, status, created_at, ward_id')
    .eq('citizen_id', citizen.id)
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; photo_url: string; ai_category: string
        ai_severity: string; status: string; created_at: string; ward_id: string | null
      }> | null
      error: unknown
    }).data : []

  // Ward name lookup
  const { data: wards } = await db
    .from('wards')
    .select('id, name') as { data: Array<{ id: string; name: string }> | null; error: unknown }

  const wardName: Record<string, string> = {}
  for (const w of wards ?? []) wardName[w.id] = w.name

  const list = issues ?? []
  const pending    = list.filter(i => i.status === 'pending').length
  const inProgress = list.filter(i => i.status === 'in_progress').length
  const resolved   = list.filter(i => i.status === 'resolved').length

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-zinc-800 shrink-0">
        <div className="mb-4">
          <h1 className="text-white font-semibold text-base">My Reports</h1>
        </div>

        {/* Stats strip */}
        {list.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 bg-zinc-900 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-white">{list.length}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
            <div className="flex-1 bg-zinc-900 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-amber-400">{pending + inProgress}</p>
              <p className="text-xs text-zinc-500">Active</p>
            </div>
            <div className="flex-1 bg-zinc-900 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-green-400">{resolved}</p>
              <p className="text-xs text-zinc-500">Resolved</p>
            </div>
          </div>
        )}
      </header>

      {/* List */}
      <main className="flex-1 px-4 py-4 pb-20 md:pb-6 flex flex-col gap-3">
        {list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-700" />
            <div>
              <p className="text-white font-semibold">No reports yet</p>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                Help improve your ward — report a civic issue and track its resolution.
              </p>
            </div>
            <Link
              href="/report"
              className="mt-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Report an Issue
            </Link>
          </div>
        ) : (
          list.map(issue => {
            const status  = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.pending
            const StatusIcon = status.icon
            const ward    = issue.ward_id ? (wardName[issue.ward_id] ?? 'Unknown ward') : 'Unknown ward'

            return (
              <div
                key={issue.id}
                className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Photo */}
                <div className="w-20 h-20 shrink-0 bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={issue.photo_url} alt="Issue" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 py-2.5 pr-3 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white capitalize truncate">
                      {CATEGORY_EMOJI[issue.ai_category]} {issue.ai_category}
                    </p>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.color}`}>
                      <StatusIcon className={`w-3 h-3 ${issue.status === 'in_progress' ? 'animate-spin' : ''}`} />
                      {status.label}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 truncate">{ward}</p>

                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${SEVERITY_COLOR[issue.ai_severity] ?? ''}`}>
                      {issue.ai_severity}
                    </span>
                    <div className="flex items-center gap-1 text-zinc-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{timeAgo(issue.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
