import { MapPin, Leaf, Recycle } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'

const MEDAL = ['🥇', '🥈', '🥉']

const CITIZEN_RANK_STYLE: Record<number, string> = {
  0: 'border-yellow-200 bg-yellow-50',
  1: 'border-slate-200  bg-slate-50',
  2: 'border-orange-200 bg-orange-50',
}

function recyclingColor(rate: number) {
  if (rate >= 70) return 'text-green-600'
  if (rate >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function recyclingBarColor(rate: number) {
  if (rate >= 70) return 'bg-green-500'
  if (rate >= 40) return 'bg-amber-400'
  return 'bg-red-500'
}

export default async function LeaderboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const [{ data: citizens }, { data: wards }] = await Promise.all([
    db
      .from('citizens')
      .select('id, name, eco_points')
      .order('eco_points', { ascending: false })
      .limit(20) as Promise<{
        data: Array<{ id: string; name: string | null; eco_points: number }> | null
        error: unknown
      }>,
    db
      .from('wards')
      .select('id, name, recycling_rate')
      .order('recycling_rate', { ascending: false }) as Promise<{
        data: Array<{ id: string; name: string; recycling_rate: number }> | null
        error: unknown
      }>,
  ])

  const citizenList = (citizens ?? []).filter(c => c.name)
  const wardList    = wards ?? []

  const topCitizens = citizenList.slice(0, 3)
  const restCitizens = citizenList.slice(3)
  const topWards    = wardList.slice(0, 3)
  const restWards   = wardList.slice(3)

  return (
    <div className="flex flex-col">
      <main className="flex-1 px-4 pt-5 pb-20 md:pb-8 flex flex-col gap-8">

        {/* ── Top Citizens ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-green-600" />
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Top Citizens</p>
          </div>

          {topCitizens.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topCitizens.map((c, idx) => (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 flex items-center gap-4 ${CITIZEN_RANK_STYLE[idx] ?? 'border-slate-200 bg-white'}`}
                >
                  <span className="text-3xl shrink-0">{MEDAL[idx]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-bold text-base truncate">{c.name}</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (c.eco_points / (topCitizens[0]?.eco_points || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-green-600">{c.eco_points}</p>
                    <p className="text-xs text-slate-400">pts</p>
                  </div>
                </div>
              ))}

              {restCitizens.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <span className="text-slate-300 font-mono text-sm w-6 shrink-0">#{idx + 4}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-semibold truncate">{c.name}</p>
                  </div>
                  <p className="text-base font-bold text-green-600 shrink-0">{c.eco_points}</p>
                  <p className="text-xs text-slate-400 shrink-0">pts</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Leaf className="w-8 h-8 text-slate-200" />
              <p className="text-slate-400 text-sm">No citizens have scanned waste yet.</p>
            </div>
          )}
        </section>

        {/* ── Top Wards ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Recycle className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Ward Recycling Rate</p>
          </div>

          <div className="flex flex-col gap-3">
            {topWards.map((w, idx) => (
              <div
                key={w.id}
                className={`rounded-2xl border p-4 flex items-center gap-4 ${CITIZEN_RANK_STYLE[idx] ?? 'border-slate-200 bg-white'}`}
              >
                <span className="text-3xl shrink-0">{MEDAL[idx]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-base truncate">{w.name}</p>
                  <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="text-xs">Jaipur</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`${recyclingBarColor(w.recycling_rate)} h-1.5 rounded-full`}
                      style={{ width: `${w.recycling_rate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold ${recyclingColor(w.recycling_rate)}`}>{w.recycling_rate}%</p>
                </div>
              </div>
            ))}

            {restWards.map((w, idx) => (
              <div key={w.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-slate-300 font-mono text-sm w-6 shrink-0">#{idx + 4}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm font-semibold truncate">{w.name}</p>
                </div>
                <p className={`text-base font-bold shrink-0 ${recyclingColor(w.recycling_rate)}`}>{w.recycling_rate}%</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
