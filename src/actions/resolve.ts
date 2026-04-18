'use server'

import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import { clampScore } from '@/lib/score'
import type { ActionResult, ConfirmPickupData } from '@/types/actions'

export async function confirmPickup(
  scanId: string
): Promise<ActionResult<ConfirmPickupData>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Find authority/collector by session id
  const { data: authority } = await db
    .from('authorities')
    .select('id, score, resolution_count, ward_id')
    .eq('id', session.id)
    .single() as { data: { id: string; score: number; resolution_count: number; ward_id: string | null } | null; error: unknown }

  if (!authority) return { success: false, error: 'Authority record not found', code: 'NOT_AUTHORITY' }

  // Fetch the scan — verify collector_id matches or ward matches
  const { data: scan } = await db
    .from('waste_scans')
    .select('id, pickup_status, ward_id')
    .eq('id', scanId)
    .single() as { data: { id: string; pickup_status: string; ward_id: string | null } | null; error: unknown }

  if (!scan) return { success: false, error: 'Scan not found', code: 'NOT_FOUND' }
  if (scan.pickup_status === 'collected') return { success: false, error: 'Already collected', code: 'ALREADY_COLLECTED' }

  // Verify this collector owns the scan's ward
  if (scan.ward_id && scan.ward_id !== authority.ward_id) {
    return { success: false, error: 'This pickup is not in your ward', code: 'WRONG_WARD' }
  }

  // Mark collected
  await db
    .from('waste_scans')
    .update({
      pickup_status: 'collected',
      collected_at:  new Date().toISOString(),
    })
    .eq('id', scanId)

  // Increment authority score +5 flat
  const newScore = clampScore(authority.score + 5)
  await db
    .from('authorities')
    .update({
      score:            newScore,
      resolution_count: authority.resolution_count + 1,
    })
    .eq('id', authority.id)

  return { success: true, data: { scanId, newCollectorScore: newScore } }
}
