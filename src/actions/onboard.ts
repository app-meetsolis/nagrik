'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getSession, setSession } from '@/lib/session'
import type { ActionResult, RegisterCitizenData, RegisterCollectorData, CheckUserResult } from '@/types/actions'

const COLLECTOR_CODE = 'NAGRIK2024'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export async function checkExistingUser(): Promise<CheckUserResult> {
  const session = await getSession()
  if (!session) return null
  return session.role
}

export async function registerCitizen(
  name: string,
  phone: string,
): Promise<ActionResult<RegisterCitizenData>> {
  // Generate a simple unique ID for this user
  const clerkUserId = `citizen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const { data, error } = await db()
    .from('citizens')
    .upsert(
      { clerk_user_id: clerkUserId, name, phone },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Registration failed', code: 'DB' }
  }

  // Set session cookie
  await setSession({ role: 'citizen', id: data.id, clerkUserId })

  return { success: true, data: { citizenId: data.id } }
}

export async function registerCollector(
  accessCode: string,
): Promise<ActionResult<RegisterCollectorData>> {
  if (accessCode !== COLLECTOR_CODE) {
    return { success: false, error: 'Invalid access code', code: 'INVALID_CODE' }
  }

  const clerkUserId = `collector_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const { data: ward } = await db()
    .from('wards')
    .select('id')
    .eq('geojson_id', 'ward_2')
    .maybeSingle()

  const { data, error } = await db()
    .from('authorities')
    .upsert(
      {
        clerk_user_id: clerkUserId,
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

  // Set session cookie
  await setSession({ role: 'collector', id: data.id, clerkUserId })

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
  const session = await getSession()
  const clerkUserId = session?.clerkUserId ?? `authority_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const { data, error } = await db()
    .from('authorities')
    .upsert(
      { clerk_user_id: clerkUserId, name, ward_id: wardId, score: 70, verified: true, on_duty: true },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Registration failed', code: 'DB' }
  }

  await setSession({ role: 'collector', id: data.id, clerkUserId })
  return { success: true, data: { authorityId: data.id } }
}
