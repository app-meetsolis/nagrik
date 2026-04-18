'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, RegisterCitizenData, RegisterCollectorData, CheckUserResult } from '@/types/actions'

const COLLECTOR_CODE = 'NAGRIK2024'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export async function checkExistingUser(): Promise<CheckUserResult> {
  const { userId } = await auth()
  if (!userId) return null

  const { data: citizen } = await db()
    .from('citizens')
    .select('id, name')
    .eq('clerk_user_id', userId)
    .not('name', 'is', null)
    .maybeSingle()

  if (citizen?.name) return 'citizen'

  const { data: authority } = await db()
    .from('authorities')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (authority) return 'collector'

  return null
}

export async function registerCitizen(
  name: string,
  phone: string,
): Promise<ActionResult<RegisterCitizenData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated', code: 'AUTH' }

  const { data, error } = await db()
    .from('citizens')
    .upsert(
      { clerk_user_id: userId, name, phone, eco_points: 0 },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Registration failed', code: 'DB' }
  }

  return { success: true, data: { citizenId: data.id } }
}

export async function registerCollector(
  accessCode: string,
): Promise<ActionResult<RegisterCollectorData>> {
  if (accessCode !== COLLECTOR_CODE) {
    return { success: false, error: 'Invalid access code', code: 'INVALID_CODE' }
  }

  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated', code: 'AUTH' }

  const { data: ward } = await db()
    .from('wards')
    .select('id')
    .eq('geojson_id', 'ward_2')
    .maybeSingle()

  const { data, error } = await db()
    .from('authorities')
    .upsert(
      {
        clerk_user_id: userId,
        name: 'Rajesh Kumar',
        ward_id: ward?.id ?? null,
        score: 70,
        verified: true,
        on_duty: true,
      },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Registration failed', code: 'DB' }
  }

  return { success: true, data: { collectorId: data.id } }
}

export async function verifyAuthorityCode(
  code: string,
): Promise<ActionResult<{ verified: true }>> {
  if (code !== COLLECTOR_CODE) {
    return { success: false, error: 'Invalid access code', code: 'INVALID_CODE' }
  }
  return { success: true, data: { verified: true } }
}

export async function registerAuthority(
  name: string,
  wardId: string,
): Promise<ActionResult<{ authorityId: string }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated', code: 'AUTH' }

  const { data, error } = await db()
    .from('authorities')
    .upsert(
      { clerk_user_id: userId, name, ward_id: wardId, score: 70, verified: true, on_duty: true },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Registration failed', code: 'DB' }
  }

  return { success: true, data: { authorityId: data.id } }
}
