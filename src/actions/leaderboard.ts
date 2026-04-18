'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, LeaderboardData, LeaderboardCitizen, LeaderboardWard } from '@/types/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

function getBadge(points: number): string {
  if (points >= 500) return '🥇'
  if (points >= 200) return '🥈'
  if (points >= 50)  return '🥉'
  return '🌱'
}

export async function getLeaderboard(): Promise<ActionResult<LeaderboardData>> {
  const [citizensRes, wardsRes, scanCountsRes] = await Promise.all([
    db()
      .from('citizens')
      .select('id, name, eco_points, ward_id, wards(name)')
      .not('name', 'is', null)
      .order('eco_points', { ascending: false })
      .limit(20),
    db()
      .from('wards')
      .select('id, name, city, score, recycling_rate, zone')
      .order('score', { ascending: false })
      .limit(20),
    db()
      .from('waste_scans')
      .select('citizen_id, recyclable'),
  ])

  type RawScan = { citizen_id: string | null; recyclable: boolean }
  const allScans: RawScan[] = scanCountsRes.data ?? []

  const scanMap: Record<string, { total: number; recyclable: number }> = {}
  allScans.forEach(s => {
    if (!s.citizen_id) return
    if (!scanMap[s.citizen_id]) scanMap[s.citizen_id] = { total: 0, recyclable: 0 }
    scanMap[s.citizen_id].total++
    if (s.recyclable) scanMap[s.citizen_id].recyclable++
  })

  const citizens: LeaderboardCitizen[] = (citizensRes.data ?? []).map((c: {
    id: string; name: string; eco_points: number
    wards: { name: string } | null
  }, i: number) => {
    const stats = scanMap[c.id] ?? { total: 0, recyclable: 0 }
    const recyclableRate = stats.total > 0 ? Math.round((stats.recyclable / stats.total) * 100) : 0
    return {
      rank: i + 1,
      id: c.id,
      name: c.name,
      ward: c.wards?.name ?? 'Unknown',
      ecoPoints: c.eco_points,
      totalScans: stats.total,
      recyclableRate,
      badge: getBadge(c.eco_points),
      streak: 0,
    }
  })

  // Citizen counts per ward
  const wardCitizenMap: Record<string, number> = {}
  const wardScanMap: Record<string, number> = {}
  ;(citizensRes.data ?? []).forEach((c: { id: string; ward_id: string | null }) => {
    if (!c.ward_id) return
    wardCitizenMap[c.ward_id] = (wardCitizenMap[c.ward_id] ?? 0) + 1
    wardScanMap[c.ward_id] = (wardScanMap[c.ward_id] ?? 0) + (scanMap[c.id]?.total ?? 0)
  })

  const wards: LeaderboardWard[] = (wardsRes.data ?? []).map((w: {
    id: string; name: string; city: string; score: number; recycling_rate: number; zone: string
  }, i: number) => {
    const citizens = wardCitizenMap[w.id] ?? 0
    const totalScans = wardScanMap[w.id] ?? 0
    return {
      rank: i + 1,
      id: w.id,
      name: w.name,
      zone: w.zone ?? 'Central',
      totalPoints: w.score,
      activeCitizens: citizens,
      avgScans: citizens > 0 ? Math.round((totalScans / citizens) * 10) / 10 : 0,
      recyclingRate: w.recycling_rate ?? 60,
    }
  })

  return { success: true, data: { citizens, wards } }
}
