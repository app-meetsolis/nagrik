import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { WardMapLoader } from './WardMapLoader'
import type { WardScore } from './WardMap'

function scoreToColor(score: number) {
  if (score >= 80) return { bg: 'bg-green-500/15',  text: 'text-green-400',  bar: 'bg-green-500',  label: 'Excellent' }
  if (score >= 60) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', bar: 'bg-emerald-400', label: 'Good'      }
  if (score >= 40) return { bg: 'bg-amber-500/15',  text: 'text-amber-400',  bar: 'bg-amber-400',  label: 'Fair'      }
  if (score >= 20) return { bg: 'bg-orange-500/15', text: 'text-orange-400', bar: 'bg-orange-400', label: 'Poor'      }
  return               { bg: 'bg-red-500/15',    text: 'text-red-400',    bar: 'bg-red-500',    label: 'Critical'  }
}

const LEGEND = [
  { color: '#22c55e', label: '80+  Excellent' },
  { color: '#86efac', label: '60–79  Good'    },
  { color: '#fbbf24', label: '40–59  Fair'    },
  { color: '#f97316', label: '20–39  Poor'    },
  { color: '#ef4444', label: '<20  Critical'  },
]

export default async function MapPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const { data: wards } = await db
    .from('wards')
    .select('name, geojson_id, score')
    .order('score', { ascending: false }) as {
      data: Array<{ name: string; geojson_id: string; score: number }> | null
      error: unknown
    }

  const scoreMap: Record<string, WardScore> = {}
  for (const w of wards ?? []) {
    scoreMap[w.geojson_id] = { name: w.name, score: w.score }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="h-4 w-px bg-zinc-700" />
        <h1 className="text-white font-semibold text-sm">Jaipur Ward Health Map</h1>
      </header>

      {/* ── Bubble Map ─────────────────────────────────────────────── */}
      <section className="relative" style={{ height: '52vh' }}>
        <WardMapLoader scoreMap={scoreMap} />

        {/* Floating legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-900/90 backdrop-blur rounded-xl px-3 py-2 flex flex-col gap-1 border border-zinc-800">
          {LEGEND.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Score Cards Grid ───────────────────────────────────────── */}
      <section className="px-4 pt-5 pb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
          Ward Rankings · sorted by score
        </p>

        <div className="grid grid-cols-2 gap-3">
          {(wards ?? []).map((ward, idx) => {
            const { bg, text, bar, label } = scoreToColor(ward.score)
            const pct = ward.score          // 0–100 directly maps to %

            return (
              <div
                key={ward.geojson_id}
                className={`${bg} rounded-2xl p-3 flex flex-col gap-2 border border-zinc-800`}
              >
                {/* Rank + name */}
                <div className="flex items-start justify-between gap-1">
                  <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                    {label}
                  </span>
                </div>

                <p className="text-white text-sm font-semibold leading-tight">{ward.name}</p>

                {/* Score bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className={`${bar} h-1.5 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className={`text-xl font-bold ${text}`}>{ward.score}</p>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
