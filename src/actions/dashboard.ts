'use server'

import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, DashboardData, ScanRowUI } from '@/types/actions'
import { WASTE_TYPE_LABELS, BIN_COLOR_HEX, BIN_LABELS } from '@/lib/wasteTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export async function getCitizenDashboard(): Promise<ActionResult<DashboardData>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  // Query only columns guaranteed to exist (eco_points, ward_id may not exist if migration 003 hasn't run)
  const { data: citizen, error: cErr } = await db()
    .from('citizens')
    .select('id, name')
    .eq('id', session.id)
    .maybeSingle()

  if (cErr || !citizen) {
    console.error('[getCitizenDashboard] Citizen not found. session.id:', session.id, 'error:', cErr?.message)
    return { success: false, error: 'Citizen not found', code: 'NOT_FOUND' }
  }

  // Try to get ward info — gracefully handle if ward_id column doesn't exist
  let wardName = 'Mansarovar'
  let wardRecyclingRate = 60
  try {
    const { data: citizenWard } = await db()
      .from('citizens')
      .select('ward_id')
      .eq('id', session.id)
      .maybeSingle()

    if (citizenWard?.ward_id) {
      const { data: ward } = await db()
        .from('wards')
        .select('name, recycling_rate')
        .eq('id', citizenWard.ward_id)
        .maybeSingle()
      if (ward) {
        wardName = ward.name
        wardRecyclingRate = ward.recycling_rate ?? 60
      }
    }
  } catch {
    // ward_id column may not exist — use defaults
  }

  // Try to get eco_points — may not exist if migration 003 wasn't run
  let ecoPoints = 0
  try {
    const { data: pts } = await db()
      .from('citizens')
      .select('eco_points')
      .eq('id', session.id)
      .maybeSingle()
    if (pts?.eco_points != null) ecoPoints = pts.eco_points
  } catch {
    // eco_points column may not exist
  }

  // Fetch scans — only use columns that exist on waste_scans
  const { data: scans } = await db()
    .from('waste_scans')
    .select('id, waste_type, bin_color, recyclable, points_earned, pickup_status, created_at')
    .eq('citizen_id', citizen.id)
    .order('created_at', { ascending: false })
    .limit(8)

  const scanRows = (scans ?? []) as Array<{
    id: string; waste_type: string; bin_color: string; recyclable: boolean
    points_earned: number; pickup_status: string; created_at: string
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
    ward: wardName,
    timestamp: new Date(s.created_at).getTime(),
  }))

  return {
    success: true,
    data: {
      citizen: {
        name: citizen.name ?? 'Citizen',
        eco_points: ecoPoints,
        ward_name: wardName,
      },
      stats: {
        total_scans: scanRows.length,
        recyclable_count: scanRows.filter(s => s.recyclable).length,
        ward_recycling_rate: wardRecyclingRate,
      },
      recent_scans,
    },
  }
}
