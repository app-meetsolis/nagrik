'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { SUBMIT_WARD_DELTA, clampScore } from '@/lib/score'
import type { ActionResult, SubmitIssueData } from '@/types/actions'
import type { IssueCategory, IssueSeverity } from '@/types/database'

interface SubmitIssueInput {
  photoUrl:  string
  wardId:    string | null
  wardName:  string | null
  category:  IssueCategory
  severity:  IssueSeverity
}

export async function submitIssue(
  input: SubmitIssueInput
): Promise<ActionResult<SubmitIssueData>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const supabase = createServiceClient()

  // 1. Upsert citizen record (idempotent — safe to call on every submission)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: citizen, error: citizenErr } = await db
    .from('citizens')
    .upsert({ clerk_user_id: userId }, { onConflict: 'clerk_user_id' })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (citizenErr || !citizen) {
    return { success: false, error: 'Failed to create citizen record', code: 'CITIZEN_UPSERT' }
  }

  // 2. Find an authority assigned to this ward
  //    authorities table is created in Story 2.1 — graceful fallback if absent
  let authorityId:   string | null = null
  let authorityName: string        = 'Ward Authority'

  if (input.wardId) {
    try {
      const { data: authority } = await db
        .from('authorities')
        .select('id, name')
        .eq('ward_id', input.wardId)
        .limit(1)
        .single() as { data: { id: string; name: string } | null; error: unknown }

      if (authority) {
        authorityId   = authority.id
        authorityName = authority.name
      }
    } catch {
      // Table may not exist yet — continue with nulls
    }
  }

  // 3. Insert the issue
  const { data: issue, error: issueErr } = await db
    .from('issues')
    .insert({
      citizen_id:   citizen.id,
      ward_id:      input.wardId,
      authority_id: authorityId,
      photo_url:    input.photoUrl,
      ai_category:  input.category,
      ai_severity:  input.severity,
      status:       'pending',
      resolution_photo_url: null,
      resolved_at:  null,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (issueErr || !issue) {
    return { success: false, error: issueErr?.message ?? 'Failed to submit issue', code: 'INSERT' }
  }

  // 4. Degrade ward score — new issue means the ward is in worse shape
  if (input.wardId) {
    const { data: ward } = await db
      .from('wards')
      .select('score')
      .eq('id', input.wardId)
      .single() as { data: { score: number } | null; error: unknown }

    if (ward) {
      const delta        = SUBMIT_WARD_DELTA[input.severity] ?? -2
      const newWardScore = clampScore(ward.score + delta)
      await db.from('wards').update({ score: newWardScore }).eq('id', input.wardId)
    }
  }

  return {
    success: true,
    data: {
      issueId:       issue.id,
      authorityName,
      wardName:      input.wardName ?? 'Your ward',
    },
  }
}
