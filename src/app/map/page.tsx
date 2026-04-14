import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { MapPageClient } from './MapPageClient'
import type { WardScore } from './WardMap'

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
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">

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
      </header>

      {/* Client section (map + toggle + cards) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MapPageClient scoreMap={scoreMap} wards={wards ?? []} />
      </div>

    </div>
  )
}
