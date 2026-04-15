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

const CATEGORY_EMOJI: Record<string, string> = {
  garbage: '🗑️', pothole: '🕳️', drainage: '💧', streetlight: '💡', other: '📌',
}

const SEVERITY_STYLE: Record<string, string> = {
  minor:    'bg-green-50 text-green-700',
  moderate: 'bg-amber-50 text-amber-700',
  critical: 'bg-red-50   text-red-700',
}

const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50   text-blue-600',
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
        <h2 className="text-slate-900 font-semibold">Account setup pending</h2>
        <p className="text-slate-400 text-sm max-w-xs">
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
      <header className="px-4 pt-5 pb-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Authority Dashboard</p>
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
            <p className="text-3xl font-bold text-orange-500">{authority.score}</p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{inProgressCount}</p>
            <p className="text-xs text-slate-400">In Progress</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{authority.resolution_count}</p>
            <p className="text-xs text-slate-400">Resolved</p>
          </div>
        </div>
      </header>

      {/* Issues list */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-slate-700">Active Issues</p>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refreshes</span>
          </div>
        </div>

        {(!issues || issues.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-3xl">✅</p>
            <p className="text-slate-900 font-semibold">All clear!</p>
            <p className="text-slate-400 text-sm">No pending issues in your ward.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div
              key={issue.id}
              className="flex gap-3 bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              {/* Photo thumbnail */}
              <div className="w-20 h-20 shrink-0 bg-slate-100">
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
                  <p className="text-sm font-semibold text-slate-900 capitalize">
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

                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{timeAgo(issue.created_at)}</span>
                  </div>
                  <IssueActions issueId={issue.id} status={issue.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
