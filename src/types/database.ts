// ============================================================
// Nagrik — Database Types (mirrors Supabase schema)
// ============================================================

export type WasteType =
  | 'wet_organic' | 'dry_paper' | 'dry_plastic' | 'dry_metal'
  | 'dry_glass' | 'e_waste' | 'hazardous' | 'textile' | 'non_recyclable'

export interface Ward {
  id: string
  name: string
  city: string
  score: number
  recycling_rate: number
  zone: string
  geojson_id: string | null
  created_at: string
}

export interface Citizen {
  id: string
  clerk_user_id: string
  name: string | null
  phone: string | null
  eco_points: number
  ward_id: string | null
  created_at: string
}

export interface WasteScan {
  id: string
  citizen_id: string | null
  ward_id: string | null
  collector_id: string | null
  photo_url: string
  waste_type: WasteType
  recyclable: boolean
  bin_color: string
  prep_steps: string[]
  tip: string | null
  points_earned: number
  pickup_status: 'pending' | 'collected'
  collected_at: string | null
  created_at: string
}

export interface RecyclingCenter {
  id: string
  name: string
  address: string
  ward_id: string | null
  lat: number
  lng: number
  phone: string | null
  rating: number
  status: 'open' | 'busy' | 'closed'
  hours: string | null
  accepted_types: string[]
  total_collections: number
  description: string | null
  created_at: string
}

export interface Authority {
  id: string
  clerk_user_id: string
  name: string
  ward_id: string | null
  score: number
  resolution_count: number
  escalation_count: number
  vehicle_number: string | null
  employee_id: string | null
  on_duty: boolean
  photo_url: string | null
  verified: boolean
  created_at: string
}

export interface Route {
  id: string
  collector_id: string | null
  name: string
  ward_id: string | null
  date: string
  status: 'active' | 'pending' | 'done'
  distance_km: number | null
  estimated_minutes: number | null
  created_at: string
}

export interface RouteStop {
  id: string
  route_id: string
  scan_id: string | null
  address: string
  status: 'pending' | 'current' | 'done'
  sort_order: number
}

export interface CitizenRequest {
  id: string
  citizen_id: string | null
  collector_id: string | null
  address: string
  ward_id: string | null
  waste_type: string
  urgency: 'high' | 'medium' | 'low'
  description: string | null
  image_url: string | null
  status: 'open' | 'accepted' | 'declined' | 'completed'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      wards: {
        Row: Ward
        Insert: Omit<Ward, 'id' | 'created_at'>
        Update: Partial<Omit<Ward, 'id' | 'created_at'>>
      }
      citizens: {
        Row: Citizen
        Insert: Omit<Citizen, 'id' | 'created_at'>
        Update: Partial<Omit<Citizen, 'id' | 'created_at'>>
      }
      waste_scans: {
        Row: WasteScan
        Insert: Omit<WasteScan, 'id' | 'created_at'>
        Update: Partial<Omit<WasteScan, 'id' | 'created_at'>>
      }
      recycling_centers: {
        Row: RecyclingCenter
        Insert: Omit<RecyclingCenter, 'id' | 'created_at'>
        Update: Partial<Omit<RecyclingCenter, 'id' | 'created_at'>>
      }
      authorities: {
        Row: Authority
        Insert: Omit<Authority, 'id' | 'created_at'>
        Update: Partial<Omit<Authority, 'id' | 'created_at'>>
      }
      routes: {
        Row: Route
        Insert: Omit<Route, 'id' | 'created_at'>
        Update: Partial<Omit<Route, 'id' | 'created_at'>>
      }
      route_stops: {
        Row: RouteStop
        Insert: Omit<RouteStop, 'id'>
        Update: Partial<Omit<RouteStop, 'id'>>
      }
      citizen_requests: {
        Row: CitizenRequest
        Insert: Omit<CitizenRequest, 'id' | 'created_at'>
        Update: Partial<Omit<CitizenRequest, 'id' | 'created_at'>>
      }
    }
  }
}
