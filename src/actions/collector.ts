'use server'

import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, CollectorDashboardData, PickupUI, RouteUI, RequestUI } from '@/types/actions'
import { WASTE_TYPE_LABELS, BIN_COLOR_HEX } from '@/lib/wasteTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (d >= 1) return `${d}d ago`
  if (h >= 1) return `${h}h ago`
  return 'just now'
}

export async function getCollectorDashboard(): Promise<ActionResult<CollectorDashboardData>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  // Fetch authority without embedded join
  const { data: authority } = await db()
    .from('authorities')
    .select('id, name, ward_id')
    .eq('id', session.id)
    .maybeSingle()

  if (!authority) return { success: false, error: 'Collector not found', code: 'NOT_FOUND' }

  // Fetch ward name separately
  let wardName = 'Unknown Ward'
  if (authority.ward_id) {
    const { data: ward } = await db()
      .from('wards')
      .select('name')
      .eq('id', authority.ward_id)
      .maybeSingle()
    if (ward) wardName = ward.name
  }

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [scansRes, routesRes, requestsRes] = await Promise.all([
    db()
      .from('waste_scans')
      .select('id, waste_type, bin_color, pickup_status, created_at, citizen_id, ward_id')
      .eq('ward_id', authority.ward_id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
    db()
      .from('routes')
      .select('id, name, status, distance_km, estimated_minutes, ward_id')
      .eq('collector_id', authority.id)
      .eq('date', todayStart.toISOString().split('T')[0])
      .order('created_at', { ascending: true }),
    db()
      .from('citizen_requests')
      .select('id, waste_type, urgency, description, image_url, created_at, citizen_id, ward_id')
      .eq('ward_id', authority.ward_id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Batch-fetch citizen names for scans and requests
  const citizenIds = [
    ...new Set([
      ...(scansRes.data ?? []).map((s: { citizen_id: string | null }) => s.citizen_id),
      ...(requestsRes.data ?? []).map((r: { citizen_id: string | null }) => r.citizen_id),
    ].filter(Boolean))
  ]
  const citizenMap: Record<string, { name: string; phone: string }> = {}
  if (citizenIds.length > 0) {
    const { data: citizens } = await db().from('citizens').select('id, name, phone').in('id', citizenIds)
    for (const c of (citizens ?? [])) {
      citizenMap[c.id] = { name: c.name ?? 'Unknown', phone: c.phone ?? '' }
    }
  }

  // Batch-fetch route stops
  const routeIds = (routesRes.data ?? []).map((r: { id: string }) => r.id)
  const stopsMap: Record<string, Array<{ id: string; address: string; status: string; sort_order: number }>> = {}
  if (routeIds.length > 0) {
    const { data: stops } = await db()
      .from('route_stops')
      .select('id, route_id, address, status, sort_order')
      .in('route_id', routeIds)
      .order('sort_order', { ascending: true })
    for (const s of (stops ?? [])) {
      if (!stopsMap[s.route_id]) stopsMap[s.route_id] = []
      stopsMap[s.route_id].push(s)
    }
  }

  const pickups: PickupUI[] = (scansRes.data ?? []).map((s: {
    id: string; waste_type: string; bin_color: string; pickup_status: string; created_at: string
    citizen_id: string | null; ward_id: string | null
  }) => ({
    id: s.id,
    citizen: s.citizen_id ? (citizenMap[s.citizen_id]?.name ?? 'Unknown') : 'Unknown',
    phone: s.citizen_id ? (citizenMap[s.citizen_id]?.phone ?? '') : '',
    address: wardName,
    ward: wardName,
    wasteType: WASTE_TYPE_LABELS[s.waste_type] ?? s.waste_type,
    binColor: s.bin_color,
    binColorHex: BIN_COLOR_HEX[s.bin_color] ?? '#6B7280',
    status: s.pickup_status === 'collected' ? 'completed' : 'pending',
    scheduledTime: fmtTime(s.created_at),
    weight: '—',
    notes: '',
  }))

  const routes: RouteUI[] = (routesRes.data ?? []).map((r: {
    id: string; name: string; status: string; distance_km: number | null
    estimated_minutes: number | null; ward_id: string | null
  }) => {
    const stops = stopsMap[r.id] ?? []
    const completed = stops.filter(s => s.status === 'done').length
    const mins = r.estimated_minutes ?? 0
    return {
      id: r.id,
      name: r.name,
      ward: wardName,
      stops: stops.length,
      completed,
      distance: r.distance_km ? `${r.distance_km} km` : '—',
      estimatedTime: mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '—',
      status: r.status as 'active' | 'pending' | 'done',
      stops_list: stops.map(s => ({ address: s.address, status: s.status as 'done' | 'pending' | 'current' })),
    }
  })

  const requests: RequestUI[] = (requestsRes.data ?? []).map((r: {
    id: string; waste_type: string; urgency: string; description: string | null
    image_url: string | null; created_at: string
    citizen_id: string | null; ward_id: string | null
  }) => ({
    id: r.id,
    citizen: r.citizen_id ? (citizenMap[r.citizen_id]?.name ?? 'Unknown') : 'Unknown',
    phone: r.citizen_id ? (citizenMap[r.citizen_id]?.phone ?? '') : '',
    address: wardName,
    ward: wardName,
    wasteType: r.waste_type,
    urgency: r.urgency as 'high' | 'medium' | 'low',
    submittedAt: timeAgo(r.created_at),
    description: r.description ?? '',
    imageAvailable: !!r.image_url,
  }))

  return {
    success: true,
    data: {
      collector: { name: authority.name, ward_name: wardName },
      pickups,
      routes,
      requests,
    },
  }
}

export async function updatePickupStatus(
  scanId: string,
  status: 'in-progress' | 'completed',
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const update: Record<string, string | null> = {
    pickup_status: status === 'completed' ? 'collected' : 'pending',
  }
  if (status === 'completed') update.collected_at = new Date().toISOString()

  const { error } = await db().from('waste_scans').update(update).eq('id', scanId)
  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}

export async function acceptRequest(requestId: string): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { error } = await db()
    .from('citizen_requests')
    .update({ status: 'accepted', collector_id: session.id })
    .eq('id', requestId)

  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}

export async function declineRequest(requestId: string): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { error } = await db()
    .from('citizen_requests').update({ status: 'declined' }).eq('id', requestId)

  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}
