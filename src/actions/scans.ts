'use server'

import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, ScanRowUI } from '@/types/actions'
import { WASTE_TYPE_LABELS, BIN_COLOR_HEX, BIN_LABELS } from '@/lib/wasteTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export type ScanFilter = 'all' | 'recyclable' | 'non-recyclable' | 'pending' | 'collected'

export async function getUserScans(filter: ScanFilter = 'all'): Promise<ActionResult<ScanRowUI[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  let query = db()
    .from('waste_scans')
    .select('id, waste_type, bin_color, recyclable, points_earned, pickup_status, created_at, ward_id')
    .eq('citizen_id', session.id)
    .order('created_at', { ascending: false })

  if (filter === 'recyclable')     query = query.eq('recyclable', true)
  if (filter === 'non-recyclable') query = query.eq('recyclable', false)
  if (filter === 'pending')        query = query.eq('pickup_status', 'pending')
  if (filter === 'collected')      query = query.eq('pickup_status', 'collected')

  const { data: scans, error } = await query

  if (error) return { success: false, error: error.message, code: 'DB' }

  // Collect unique ward IDs and batch-fetch ward names
  const wardIds = [...new Set((scans ?? []).map((s: { ward_id: string | null }) => s.ward_id).filter(Boolean))]
  const wardMap: Record<string, string> = {}
  if (wardIds.length > 0) {
    const { data: wards } = await db().from('wards').select('id, name').in('id', wardIds)
    for (const w of (wards ?? [])) {
      wardMap[w.id] = w.name
    }
  }

  const rows: ScanRowUI[] = (scans ?? []).map((s: {
    id: string; waste_type: string; bin_color: string; recyclable: boolean
    points_earned: number; pickup_status: string; created_at: string
    ward_id: string | null
  }) => ({
    id: s.id,
    wasteType: WASTE_TYPE_LABELS[s.waste_type] ?? s.waste_type,
    binColor: s.bin_color,
    binColorHex: BIN_COLOR_HEX[s.bin_color] ?? '#6B7280',
    binLabel: BIN_LABELS[s.bin_color] ?? 'Grey Bin',
    recyclable: s.recyclable,
    points: s.points_earned,
    status: s.pickup_status as 'pending' | 'collected',
    ward: s.ward_id ? (wardMap[s.ward_id] ?? 'Unknown') : 'Unknown',
    timestamp: new Date(s.created_at).getTime(),
  }))

  return { success: true, data: rows }
}
