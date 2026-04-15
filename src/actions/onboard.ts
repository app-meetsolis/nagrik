'use server'

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, RegisterCitizenData, RegisterAuthorityData } from '@/types/actions'

// Never exported — stays server-only, never reaches the client bundle.
const AUTHORITY_CODE = 'NAGRIK2025'

// ── Citizen registration ─────────────────────────────────────────────────────

export async function registerCitizen(
  name: string,
  phone: string,
): Promise<ActionResult<RegisterCitizenData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not signed in' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const { error } = await db
    .from('citizens')
    .upsert(
      { clerk_user_id: userId, name: name.trim(), phone: phone.trim() },
      { onConflict: 'clerk_user_id' },
    )

  if (error) return { success: false, error: 'Could not save profile' }

  const client = await clerkClient()
  await client.users.updateUser(userId, { publicMetadata: { role: 'citizen' } })

  return { success: true, data: { redirectTo: 'citizen' } }
}

// ── Authority code verification ──────────────────────────────────────────────
// Separate action so step 1 validates in isolation — no name/ward required yet.

export async function verifyAuthorityCode(
  code: string,
): Promise<ActionResult<{ valid: true }>> {
  if (code.trim() !== AUTHORITY_CODE)
    return { success: false, error: 'Invalid authority code', code: 'BAD_CODE' }
  return { success: true, data: { valid: true } }
}

// ── Authority registration ───────────────────────────────────────────────────

export async function registerAuthority(
  name: string,
  wardId: string,
): Promise<ActionResult<RegisterAuthorityData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not signed in' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const { error } = await db
    .from('authorities')
    .upsert(
      {
        clerk_user_id:    userId,
        name:             name.trim(),
        ward_id:          wardId,
        score:            70,
        resolution_count: 0,
        escalation_count: 0,
        verified:         false,
      },
      { onConflict: 'clerk_user_id' },
    )

  if (error) return { success: false, error: 'Could not save profile' }

  const client = await clerkClient()
  await client.users.updateUser(userId, { publicMetadata: { role: 'authority' } })

  return { success: true, data: { redirectTo: 'authority' } }
}
