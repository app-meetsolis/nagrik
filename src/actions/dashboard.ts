'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, DashboardData, ScanRowUI } from '@/types/actions'
import { WASTE_TYPE_LABELS, BIN_COLOR_HEX, BIN_LABELS } from '@/lib/wasteTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export async function getCitizenDashboard(): Promise<ActionResult<DashboardData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { data: citizen, error: cErr } = await db()
    .from('citizens')
    .select('id, name, eco_points, ward_id, wards(name, recycling_rate)')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (cErr || !citizen) return { success: false, error: 'Citizen not found', code: 'NOT_FOUND' }

  const { data: scans } = await db()
    .from('waste_scans')
    .select('id, waste_type, bin_color, recyclable, points_earned, pickup_status, created_at, wards(name)')
    .eq('citizen_id', citizen.id)
    .order('created_at', { ascending: false })
    .limit(8)

  const ward = citizen.wards as { name: string; recycling_rate: number } | null
  const scanRows = (scans ?? []) as Array<{
    id: string; waste_type: string; bin_color: string; recyclable: boolean
    points_earned: number; pickup_status: string; created_at: string
    wards: { name: string } | null
  }>

  const recent_scans: ScanRowUI[] = scanRows.map(s => ({
    id: s.id,
    wasteType: WASTE_TYPE_LABELS[s.waste_type] ?? s.waste_type,
    binColor: s.bin_color,
    binColorHex: BIN_COLOR_HEX[s.bin_color] ?? '#6B7280',
    binLabel: BIN_LABELS[s.bin_color] ?? 'Grey Bin',
    recyclable: s.recyclable,
    points: s.points_earned,
    status: s.pickup_status as 'pending' | 'collected',
    ward: s.wards?.name ?? ward?.name ?? 'Unknown',
    timestamp: new Date(s.created_at).getTime(),
  }))

  return {
    success: true,
    data: {
      citizen: {
        name: citizen.name ?? 'Citizen',
        eco_points: citizen.eco_points ?? 0,
        ward_name: ward?.name ?? 'Jaipur',
      },
      stats: {
        total_scans: scanRows.length,
        recyclable_count: scanRows.filter(s => s.recyclable).length,
        ward_recycling_rate: ward?.recycling_rate ?? 60,
      },
      recent_scans,
    },
  }
}
