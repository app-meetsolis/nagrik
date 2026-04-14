'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'

/**
 * Moves a pending issue to in_progress.
 * Only the assigned authority can do this.
 */
export async function markInProgress(issueId: string): Promise<ActionResult<void>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const { data: authority } = await db
    .from('authorities')
    .select('id')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string } | null; error: unknown }

  if (!authority) return { success: false, error: 'Authority record not found', code: 'NOT_AUTHORITY' }

  const { error } = await db
    .from('issues')
    .update({ status: 'in_progress' })
    .eq('id', issueId)
    .eq('authority_id', authority.id)
    .eq('status', 'pending')   // guard: only pending → in_progress

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}
