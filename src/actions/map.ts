'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, RecyclingCentreUI } from '@/types/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

export async function getRecyclingCentres(): Promise<ActionResult<RecyclingCentreUI[]>> {
  const { data, error } = await db()
    .from('recycling_centers')
    .select('id, name, address, ward_id, lat, lng, phone, rating, status, hours, accepted_types, total_collections, description')
    .order('rating', { ascending: false })

  if (error) return { success: false, error: error.message, code: 'DB' }

  // Batch-fetch ward names
  const wardIds = [...new Set((data ?? []).map((c: { ward_id: string | null }) => c.ward_id).filter(Boolean))]
  const wardMap: Record<string, string> = {}
  if (wardIds.length > 0) {
    const { data: wards } = await db().from('wards').select('id, name').in('id', wardIds)
    for (const w of (wards ?? [])) {
      wardMap[w.id] = w.name
    }
  }

  const centres: RecyclingCentreUI[] = (data ?? []).map((c: {
    id: string; name: string; address: string; ward_id: string | null; lat: number; lng: number
    phone: string | null; rating: number; status: string; hours: string | null
    accepted_types: string[]; total_collections: number; description: string | null
  }) => ({
    id: c.id,
    name: c.name,
    address: c.address,
    ward: c.ward_id ? (wardMap[c.ward_id] ?? 'Jaipur') : 'Jaipur',
    distance: '—',
    phone: c.phone ?? '',
    hours: c.hours ?? '',
    rating: Number(c.rating) || 4.0,
    status: (c.status as 'open' | 'busy' | 'closed') || 'open',
    accepts: c.accepted_types ?? [],
    totalCollections: c.total_collections ?? 0,
    lat: Number(c.lat),
    lng: Number(c.lng),
    description: c.description ?? '',
  }))

  return { success: true, data: centres }
}
