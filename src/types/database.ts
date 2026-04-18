// ============================================================
// Nagrik — Database Types
// Mirrors the Supabase schema exactly
// ============================================================

export type WasteType =
  | 'wet_organic'
  | 'dry_paper'
  | 'dry_plastic'
  | 'dry_metal'
  | 'dry_glass'
  | 'e_waste'
  | 'hazardous'
  | 'textile'
  | 'non_recyclable'

export interface Ward {
  id: string
  name: string
  city: string
  score: number
  recycling_rate: number
  geojson_id: string | null
  created_at: string
}

export interface Citizen {
  id: string
  clerk_user_id: string
  name:  string | null
  phone: string | null
  eco_points: number
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
  lat: number
  lng: number
  accepted_types: WasteType[]
  ward_id: string | null
  open_hours: string | null
  created_at: string
}

// Authority type — table created in Story 2.1
export interface Authority {
  id: string
  clerk_user_id: string
  name: string
  ward_id: string
  score: number
  resolution_count: number
  escalation_count: number
  photo_url: string | null
  verified: boolean
  created_at: string
}

// Supabase Database type wrapper for createClient generics
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
    }
  }
}
