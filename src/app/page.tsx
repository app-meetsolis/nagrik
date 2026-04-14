import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'

async function fetchStats() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any

    const [{ count: totalIssues }, { count: resolved }, { data: wards }] = await Promise.all([
      db.from('issues').select('*', { count: 'exact', head: true }),
      db.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      db.from('wards').select('score'),
    ])

    const avgScore = wards?.length
      ? Math.round((wards as { score: number }[]).reduce((s: number, w: { score: number }) => s + w.score, 0) / wards.length)
      : 0

    return {
      totalIssues: totalIssues ?? 0,
      resolved:    resolved    ?? 0,
      avgScore,
    }
  } catch {
    return { totalIssues: 0, resolved: 0, avgScore: 0 }
  }
}

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/report')

  const stats = await fetchStats()
  const resolutionRate = stats.totalIssues > 0
    ? Math.round((stats.resolved / stats.totalIssues) * 100)
    : 0

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold tracking-tight">nagrik</span>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            Sign in
          </Button>
        </SignInButton>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-6">
        <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/20 text-xs tracking-widest uppercase">
          Jaipur Civic Platform
        </Badge>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-sm">
          Report issues.
          <br />
          <span className="text-orange-400">Hold officials</span>
          <br />
          accountable.
        </h1>

        <p className="text-zinc-400 text-base max-w-xs leading-relaxed">
          Snap a photo. AI tags the category and ward. Your authority gets notified — and scored on their response.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <SignUpButton mode="modal">
            <Button className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-base rounded-xl">
              Report an Issue
            </Button>
          </SignUpButton>

          <div className="flex gap-3 w-full">
            <Link href="/map" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
              >
                Ward Map
              </Button>
            </Link>
            <Link href="/leaderboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
              >
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Live stats strip */}
      <footer className="border-t border-zinc-800 px-6 py-5">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xl font-bold text-white">{stats.totalIssues}</p>
            <p className="text-xs text-zinc-500">Issues filed</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">{resolutionRate}%</p>
            <p className="text-xs text-zinc-500">Resolved</p>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-400">{stats.avgScore}</p>
            <p className="text-xs text-zinc-500">Avg ward score</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
