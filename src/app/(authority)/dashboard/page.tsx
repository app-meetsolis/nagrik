import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { AutoRefresh } from './AutoRefresh'
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

const CATEGORY_EMOJI: Record<string, string> = {
  garbage: '🗑️', pothole: '🕳️', drainage: '💧', streetlight: '💡', other: '📌',
}

const SEVERITY_STYLE: Record<string, string> = {
  minor:    'bg-green-500/15 text-green-400',
  moderate: 'bg-amber-500/15 text-amber-400',
  critical: 'bg-red-500/15 text-red-400',
}

const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-zinc-700 text-zinc-300',
  in_progress: 'bg-blue-500/15 text-blue-400',
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
    .select('id, name, ward_id, score, resolution_count, escalation_count')
    .eq('clerk_user_id', userId)
    .single() as {
      data: {
        id: string; name: string; ward_id: string | null
        score: number; resolution_count: number; escalation_count: number
      } | null
      error: unknown
    }

  if (!authority) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 text-center gap-4">
        <p className="text-2xl">⏳</p>
        <h2 className="text-white font-semibold">Account setup pending</h2>
        <p className="text-zinc-400 text-sm max-w-xs">
          Your authority profile hasn&apos;t been created yet.
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

  // Fetch pending + in_progress issues
  const { data: issues } = await db
    .from('issues')
    .select('id, photo_url, ai_category, ai_severity, status, created_at, ward_id')
    .eq('authority_id', authority.id)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; photo_url: string; ai_category: string
        ai_severity: string; status: string; created_at: string; ward_id: string | null
      }> | null
      error: unknown
    }

  const pendingCount    = issues?.filter(i => i.status === 'pending').length    ?? 0
  const inProgressCount = issues?.filter(i => i.status === 'in_progress').length ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <AutoRefresh />

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Authority Dashboard</p>
            <h1 className="text-lg font-bold text-white">{authority.name}</h1>
            {ward && (
              <div className="flex items-center gap-1 text-zinc-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{ward.name}</span>
              </div>
            )}
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-400">{authority.score}</p>
            <p className="text-xs text-zinc-500">Score</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{pendingCount}</p>
            <p className="text-xs text-zinc-500">Pending</p>
          </div>
          <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-400">{inProgressCount}</p>
            <p className="text-xs text-zinc-500">In Progress</p>
          </div>
          <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-400">{authority.resolution_count}</p>
            <p className="text-xs text-zinc-500">Resolved</p>
          </div>
        </div>
      </header>

      {/* Issues list */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-zinc-300">Active Issues</p>
          <div className="flex items-center gap-1 text-zinc-600 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refreshes</span>
          </div>
        </div>

        {(!issues || issues.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-3xl">✅</p>
            <p className="text-white font-semibold">All clear!</p>
            <p className="text-zinc-500 text-sm">No pending issues in your ward.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div
              key={issue.id}
              className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* Photo thumbnail */}
              <div className="w-20 h-20 shrink-0 bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.photo_url}
                  alt="Issue"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 py-2.5 pr-3 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white capitalize">
                    {CATEGORY_EMOJI[issue.ai_category]} {issue.ai_category}
                  </p>
                  <Badge className={`text-xs shrink-0 border-0 ${STATUS_STYLE[issue.status] ?? ''}`}>
                    {issue.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${SEVERITY_STYLE[issue.ai_severity] ?? ''}`}>
                    {issue.ai_severity}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-zinc-600 mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{timeAgo(issue.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
