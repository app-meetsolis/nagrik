import { createServiceClient } from '@/lib/supabase/server'
import { MapPageClient } from './MapPageClient'
import type { WardScore, RecyclingCenterInfo } from './WardMap'

export default async function MapPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const [{ data: wards }, { data: rawCenters }] = await Promise.all([
    db
      .from('wards')
      .select('name, geojson_id, recycling_rate')
      .order('recycling_rate', { ascending: false }) as Promise<{
        data: Array<{ name: string; geojson_id: string; recycling_rate: number }> | null
        error: unknown
      }>,
    db
      .from('recycling_centers')
      .select('id, name, address, lat, lng, accepted_types, open_hours') as Promise<{
        data: Array<{
          id: string; name: string; address: string
          lat: number; lng: number
          accepted_types: string[]; open_hours: string | null
        }> | null
        error: unknown
      }>,
  ])

  const scoreMap: Record<string, WardScore> = {}
  for (const w of wards ?? []) {
    scoreMap[w.geojson_id] = { name: w.name, recycling_rate: w.recycling_rate }
  }

  const centers: RecyclingCenterInfo[] = rawCenters ?? []

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MapPageClient scoreMap={scoreMap} wards={wards ?? []} centers={centers} />
    </div>
  )
}
