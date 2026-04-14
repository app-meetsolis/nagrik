'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, ResolveIssueData } from '@/types/actions'

// Score reward per severity level
const SCORE_DELTA: Record<string, number> = {
  minor:    5,
  moderate: 10,
  critical: 15,
}

/**
 * Resolves an in_progress issue:
 * 1. Uploads resolution photo to Storage
 * 2. Sets issue status = 'resolved', records resolved_at
 * 3. Increments authority score + resolution_count
 * 4. Inserts an escalation_event record
 *
 * FormData fields: issueId (string), photo (File)
 */
export async function resolveIssue(
  formData: FormData
): Promise<ActionResult<ResolveIssueData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const issueId = formData.get('issueId') as string | null
  const file    = formData.get('photo')   as File   | null

  if (!issueId) return { success: false, error: 'Missing issueId', code: 'MISSING' }
  if (!file || file.size === 0) return { success: false, error: 'No photo provided', code: 'NO_FILE' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // 1. Find authority
  const { data: authority } = await db
    .from('authorities')
    .select('id, score, resolution_count')
    .eq('clerk_user_id', userId)
    .single() as { data: { id: string; score: number; resolution_count: number } | null; error: unknown }

  if (!authority) return { success: false, error: 'Authority record not found', code: 'NOT_AUTHORITY' }

  // 2. Fetch the issue (verify ownership + get severity)
  const { data: issue } = await db
    .from('issues')
    .select('id, ai_severity, status')
    .eq('id', issueId)
    .eq('authority_id', authority.id)
    .single() as { data: { id: string; ai_severity: string; status: string } | null; error: unknown }

  if (!issue) return { success: false, error: 'Issue not found or not assigned to you', code: 'NOT_FOUND' }
  if (issue.status === 'resolved') return { success: false, error: 'Issue already resolved', code: 'ALREADY_RESOLVED' }

  // 3. Upload resolution photo
  const path = `resolutions/${authority.id}/${issueId}.jpg`
  const { error: uploadError } = await db.storage
    .from('issue-photos')
    .upload(path, file, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) return { success: false, error: uploadError.message, code: 'UPLOAD_FAILED' }

  const { data: { publicUrl: resolutionPhotoUrl } } = db.storage
    .from('issue-photos')
    .getPublicUrl(path)

  // 4. Update issue to resolved
  await db
    .from('issues')
    .update({
      status:               'resolved',
      resolution_photo_url: resolutionPhotoUrl,
      resolved_at:          new Date().toISOString(),
    })
    .eq('id', issueId)

  // 5. Update authority score + resolution_count
  const delta    = SCORE_DELTA[issue.ai_severity] ?? 10
  const newScore = Math.min(100, authority.score + delta)

  await db
    .from('authorities')
    .update({
      score:            newScore,
      resolution_count: authority.resolution_count + 1,
    })
    .eq('id', authority.id)

  // 6. Record escalation event
  await db
    .from('escalation_events')
    .insert({
      issue_id:     issueId,
      authority_id: authority.id,
      event_type:   'resolution',
      score_delta:  delta,
    })

  return { success: true, data: { issueId, newScore } }
}
