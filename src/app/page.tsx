import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'
import { AuthRedirect } from '@/components/AuthRedirect'

async function fetchStats() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any

    const [{ count: totalScans }, { count: recyclable }, { data: wards }] = await Promise.all([
      db.from('waste_scans').select('*', { count: 'exact', head: true }),
      db.from('waste_scans').select('*', { count: 'exact', head: true }).eq('recyclable', true),
      db.from('wards').select('recycling_rate'),
    ])

    const avgRecyclingRate = wards?.length
      ? Math.round((wards as { recycling_rate: number }[]).reduce((s: number, w: { recycling_rate: number }) => s + w.recycling_rate, 0) / wards.length)
      : 0

    return {
      totalScans:      totalScans ?? 0,
      recyclable:      recyclable ?? 0,
      avgRecyclingRate,
    }
  } catch {
    return { totalScans: 0, recyclable: 0, avgRecyclingRate: 0 }
  }
}

export default async function LandingPage() {
  const { userId, sessionClaims } = await auth()
  if (userId) {
    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (!role) redirect('/onboarding')
    if (role === 'authority' || role === 'admin') redirect('/dashboard')
    const ua = (await headers()).get('user-agent') ?? ''
    redirect(/Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? '/report' : '/home')
  }

  const stats = await fetchStats()
  const recyclableRate = stats.totalScans > 0
    ? Math.round((stats.recyclable / stats.totalScans) * 100)
    : 0

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* Handles redirect after Clerk modal sign-in (client-side auth state change) */}
      <AuthRedirect />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold tracking-tight">nagrik</span>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
            Sign in
          </Button>
        </SignInButton>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-6">
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs tracking-widest uppercase">
          Jaipur Waste Segregation
        </Badge>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-sm">
          AI-Powered Waste
          <br />
          <span className="text-green-600">Segregation</span>
          <br />
          for Smarter Cities
        </h1>

        <p className="text-slate-500 text-base max-w-xs leading-relaxed">
          Snap a photo of waste. AI classifies the type and correct bin. Earn eco-points. Track pickup status.
        </p>

        {/* Feature row — desktop only */}
        <div className="hidden sm:flex items-center gap-8 text-slate-500 text-sm">
          <span>📸 Scan Waste</span>
          <span className="text-slate-200">|</span>
          <span>🤖 Earn Points</span>
          <span className="text-slate-200">|</span>
          <span>♻ Track Pickups</span>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <SignUpButton mode="modal">
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-xl">
              Get Started — It&apos;s Free
            </Button>
          </SignUpButton>

          <div className="flex gap-3 w-full">
            <Link href="/map" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Recycling Centers
              </Button>
            </Link>
            <Link href="/leaderboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Live stats strip */}
      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.totalScans}</p>
            <p className="text-xs text-slate-400">Scans logged</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{recyclableRate}%</p>
            <p className="text-xs text-slate-400">Recyclable</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{stats.avgRecyclingRate}%</p>
            <p className="text-xs text-slate-400">Avg ward rate</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
