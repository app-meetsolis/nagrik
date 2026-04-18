'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { clampScore } from '@/lib/score'
import type { ActionResult, LogWasteScanData } from '@/types/actions'
import type { WasteType } from '@/types/database'

interface LogWasteScanInput {
  photoUrl:     string
  wardId:       string | null
  wasteType:    WasteType
  recyclable:   boolean
  binColor:     string
  prepSteps:    string[]
  tip:          string
  pointsEarned: number
}

export async function logWasteScan(
  input: LogWasteScanInput
): Promise<ActionResult<LogWasteScanData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Upsert citizen record (idempotent)
  const { data: citizen, error: citizenErr } = await db
    .from('citizens')
    .upsert({ clerk_user_id: userId }, { onConflict: 'clerk_user_id' })
    .select('id, eco_points')
    .single() as { data: { id: string; eco_points: number } | null; error: { message: string } | null }

  if (citizenErr || !citizen) {
    return { success: false, error: 'Failed to create citizen record', code: 'CITIZEN_UPSERT' }
  }

  // Find collector (authority) for this ward
  let collectorId: string | null = null
  if (input.wardId) {
    try {
      const { data: authority } = await db
        .from('authorities')
        .select('id')
        .eq('ward_id', input.wardId)
        .limit(1)
        .single() as { data: { id: string } | null; error: unknown }

      if (authority) collectorId = authority.id
    } catch {
      // No authority for ward — continue
    }
  }

  // Insert waste_scan row
  const { data: scan, error: scanErr } = await db
    .from('waste_scans')
    .insert({
      citizen_id:    citizen.id,
      ward_id:       input.wardId,
      collector_id:  collectorId,
      photo_url:     input.photoUrl,
      waste_type:    input.wasteType,
      recyclable:    input.recyclable,
      bin_color:     input.binColor,
      prep_steps:    input.prepSteps,
      tip:           input.tip,
      points_earned: input.pointsEarned,
      pickup_status: 'pending',
    })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (scanErr || !scan) {
    return { success: false, error: scanErr?.message ?? 'Failed to log scan', code: 'INSERT' }
  }

  // Increment citizen eco_points
  const newEcoPoints = citizen.eco_points + input.pointsEarned
  await db
    .from('citizens')
    .update({ eco_points: newEcoPoints })
    .eq('id', citizen.id)

  // Increment ward recycling_rate by +1 if recyclable (clamped 0–100)
  if (input.recyclable && input.wardId) {
    const { data: ward } = await db
      .from('wards')
      .select('recycling_rate')
      .eq('id', input.wardId)
      .single() as { data: { recycling_rate: number } | null; error: unknown }

    if (ward) {
      await db
        .from('wards')
        .update({ recycling_rate: clampScore(ward.recycling_rate + 1) })
        .eq('id', input.wardId)
    }
  }

  return {
    success: true,
    data: {
      scanId:         scan.id,
      pointsEarned:   input.pointsEarned,
      totalEcoPoints: newEcoPoints,
    },
  }
}
