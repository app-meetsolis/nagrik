import { MapPin, CheckCircle2, Trophy } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/PublicNav'

const MEDAL = ['🥇', '🥈', '🥉']

const RANK_STYLE: Record<number, string> = {
  0: 'border-yellow-500/40 bg-yellow-500/10',
  1: 'border-zinc-400/40  bg-zinc-400/10',
  2: 'border-orange-700/40 bg-orange-700/10',
}

function scoreToColor(score: number) {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-emerald-400'
  if (score >= 40) return 'text-amber-400'
  if (score >= 20) return 'text-orange-400'
  return 'text-red-400'
}

function scoreBarColor(score: number) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-emerald-400'
  if (score >= 40) return 'bg-amber-400'
  if (score >= 20) return 'bg-orange-400'
  return 'bg-red-500'
}

export default async function LeaderboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Fetch all authorities sorted by score desc
  const { data: authorities } = await db
    .from('authorities')
    .select('id, name, ward_id, score, resolution_count')
    .order('score', { ascending: false }) as {
      data: Array<{
        id: string; name: string; ward_id: string | null
        score: number; resolution_count: number
      }> | null
      error: unknown
    }

  // Fetch all wards for name lookup
  const { data: wards } = await db
    .from('wards')
    .select('id, name') as {
      data: Array<{ id: string; name: string }> | null
      error: unknown
    }

  const wardName: Record<string, string> = {}
  for (const w of wards ?? []) wardName[w.id] = w.name

  const list = (authorities ?? []).map(a => ({
    ...a,
    ward: a.ward_id ? (wardName[a.ward_id] ?? '—') : '—',
  }))

  const top3 = list.slice(0, 3)
  const rest = list.slice(3)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      <PublicNav />

      <main className="flex-1 px-4 pt-5 pb-20 md:pb-8 flex flex-col gap-6">

        {/* ── Podium — Top 3 ─────────────────────────────────────────── */}
        {top3.length > 0 && (
          <section>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
              Top Performers
            </p>

            <div className="flex flex-col gap-3">
              {top3.map((a, idx) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border p-4 flex items-center gap-4 ${RANK_STYLE[idx] ?? 'border-zinc-800 bg-zinc-900'}`}
                >
                  {/* Medal */}
                  <span className="text-3xl shrink-0">{MEDAL[idx]}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">{a.name}</p>
                    <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="text-xs truncate">{a.ward}</span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                      <div
                        className={`${scoreBarColor(a.score)} h-1.5 rounded-full`}
                        style={{ width: `${a.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-bold ${scoreToColor(a.score)}`}>{a.score}</p>
                    <div className="flex items-center gap-1 justify-end text-zinc-500 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs">{a.resolution_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Full Rankings ───────────────────────────────────────────── */}
        {rest.length > 0 && (
          <section>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
              All Rankings
            </p>

            <div className="flex flex-col gap-2">
              {rest.map((a, idx) => {
                const rank = idx + 4
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
                  >
                    {/* Rank number */}
                    <span className="text-zinc-600 font-mono text-sm w-6 shrink-0">#{rank}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                      <div className="flex items-center gap-1 text-zinc-600">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-xs truncate">{a.ward}</span>
                      </div>
                    </div>

                    {/* Resolutions */}
                    <div className="flex items-center gap-1 text-zinc-500 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs">{a.resolution_count}</span>
                    </div>

                    {/* Score */}
                    <p className={`text-lg font-bold shrink-0 ${scoreToColor(a.score)}`}>{a.score}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {list.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-3xl">🏆</p>
            <p className="text-white font-semibold">No authorities yet</p>
            <p className="text-zinc-500 text-sm">Rankings will appear once authorities are seeded.</p>
          </div>
        )}

      </main>
    </div>
  )
}
