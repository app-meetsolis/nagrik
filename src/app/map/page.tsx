import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { WardMapLoader } from './WardMapLoader'
import type { WardScore } from './WardMap'

export default async function MapPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const { data: wards } = await db
    .from('wards')
    .select('name, geojson_id, score')
    .order('name') as {
      data: Array<{ name: string; geojson_id: string; score: number }> | null
      error: unknown
    }

  const scoreMap: Record<string, WardScore> = {}
  for (const w of wards ?? []) {
    scoreMap[w.geojson_id] = { name: w.name, score: w.score }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">

      {/* Header */}
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
        <div className="ml-auto flex items-center gap-3 text-xs">
          {[
            { color: '#22c55e', label: 'Excellent 80+' },
            { color: '#86efac', label: 'Good 60–79'    },
            { color: '#fbbf24', label: 'Fair 40–59'    },
            { color: '#f97316', label: 'Poor 20–39'    },
            { color: '#ef4444', label: 'Critical <20'  },
          ].map(({ color, label }) => (
            <span key={label} className="hidden sm:flex items-center gap-1 text-zinc-400">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </header>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <WardMapLoader scoreMap={scoreMap} />
      </div>

    </div>
  )
}
