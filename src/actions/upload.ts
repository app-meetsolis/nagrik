'use server'

import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, UploadScanImageData } from '@/types/actions'

export interface UploadPhotoData {
  url: string
  wardId: string | null
  wardName: string | null
}

/**
 * Uploads an issue photo to Supabase Storage.
 *
 * FormData fields:
 *   photo     — File / Blob (image/jpeg)
 *   geojsonId — string | null  (nearest ward from GPS, e.g. 'ward_3')
 */
export async function uploadIssuePhoto(
  formData: FormData
): Promise<ActionResult<UploadPhotoData>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const file = formData.get('photo') as File | null
  if (!file || file.size === 0) return { success: false, error: 'No photo provided', code: 'NO_FILE' }

  const geojsonId = (formData.get('geojsonId') as string | null) ?? null
  const supabase  = createServiceClient()
  const path      = `${session.clerkUserId}/${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('issue-photos')
    .upload(path, file, { contentType: 'image/jpeg', upsert: false })

  if (uploadError) return { success: false, error: uploadError.message, code: 'UPLOAD_FAILED' }

  const { data: { publicUrl } } = supabase.storage.from('issue-photos').getPublicUrl(path)

  // Resolve ward UUID from geojsonId
  let wardId: string | null   = null
  let wardName: string | null = null

  if (geojsonId) {
    const { data: ward } = await supabase
      .from('wards')
      .select('id, name')
      .eq('geojson_id', geojsonId)
      .single() as { data: { id: string; name: string } | null; error: unknown }

    if (ward) {
      wardId   = ward.id
      wardName = ward.name
    }
  }

  return { success: true, data: { url: publicUrl, wardId, wardName } }
}

export async function uploadScanImage(
  formData: FormData
): Promise<ActionResult<UploadScanImageData>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { success: false, error: 'No file provided', code: 'NO_FILE' }

  const supabase = createServiceClient()
  const path = `${session.clerkUserId}/${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('scan-photos')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })

  if (uploadError) return { success: false, error: uploadError.message, code: 'UPLOAD_FAILED' }

  const { data: { publicUrl } } = supabase.storage.from('scan-photos').getPublicUrl(path)

  return { success: true, data: { url: publicUrl } }
}
