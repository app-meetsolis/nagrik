'use server'

import { auth } from '@clerk/nextjs/server'
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
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { data: authority } = await db()
    .from('authorities')
    .select('id, name, ward_id, wards(name)')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!authority) return { success: false, error: 'Collector not found', code: 'NOT_FOUND' }

  const wardName = (authority.wards as { name: string } | null)?.name ?? 'Unknown Ward'
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [scansRes, routesRes, requestsRes] = await Promise.all([
    db()
      .from('waste_scans')
      .select('id, waste_type, bin_color, pickup_status, created_at, citizens(name, phone), wards(name)')
      .eq('ward_id', authority.ward_id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
    db()
      .from('routes')
      .select('id, name, status, distance_km, estimated_minutes, wards(name), route_stops(id, address, status, sort_order)')
      .eq('collector_id', authority.id)
      .eq('date', todayStart.toISOString().split('T')[0])
      .order('created_at', { ascending: true }),
    db()
      .from('citizen_requests')
      .select('id, waste_type, urgency, description, image_url, created_at, citizens(name, phone), wards(name)')
      .eq('ward_id', authority.ward_id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const pickups: PickupUI[] = (scansRes.data ?? []).map((s: {
    id: string; waste_type: string; bin_color: string; pickup_status: string; created_at: string
    citizens: { name: string; phone: string } | null
    wards: { name: string } | null
  }) => ({
    id: s.id,
    citizen: s.citizens?.name ?? 'Unknown',
    phone: s.citizens?.phone ?? '',
    address: s.wards?.name ?? wardName,
    ward: s.wards?.name ?? wardName,
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
    estimated_minutes: number | null; wards: { name: string } | null
    route_stops: { id: string; address: string; status: string; sort_order: number }[]
  }) => {
    const stops = [...(r.route_stops ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const completed = stops.filter(s => s.status === 'done').length
    const mins = r.estimated_minutes ?? 0
    return {
      id: r.id,
      name: r.name,
      ward: r.wards?.name ?? wardName,
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
    citizens: { name: string; phone: string } | null
    wards: { name: string } | null
  }) => ({
    id: r.id,
    citizen: r.citizens?.name ?? 'Unknown',
    phone: r.citizens?.phone ?? '',
    address: r.wards?.name ?? wardName,
    ward: r.wards?.name ?? wardName,
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
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const update: Record<string, string | null> = {
    pickup_status: status === 'completed' ? 'collected' : 'pending',
  }
  if (status === 'completed') update.collected_at = new Date().toISOString()

  const { error } = await db().from('waste_scans').update(update).eq('id', scanId)
  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}

export async function acceptRequest(requestId: string): Promise<ActionResult<void>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { data: authority } = await db()
    .from('authorities').select('id').eq('clerk_user_id', userId).maybeSingle()
  if (!authority) return { success: false, error: 'Not a collector', code: 'NOT_COLLECTOR' }

  const { error } = await db()
    .from('citizen_requests')
    .update({ status: 'accepted', collector_id: authority.id })
    .eq('id', requestId)

  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}

export async function declineRequest(requestId: string): Promise<ActionResult<void>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthenticated', code: 'AUTH' }

  const { error } = await db()
    .from('citizen_requests').update({ status: 'declined' }).eq('id', requestId)

  if (error) return { success: false, error: error.message, code: 'DB' }
  return { success: true, data: undefined }
}
