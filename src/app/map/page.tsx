import { createServiceClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/PublicNav'
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
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden">

      <PublicNav />

      {/* Client section (map + toggle + cards) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MapPageClient scoreMap={scoreMap} wards={wards ?? []} />
      </div>

    </div>
  )
}
