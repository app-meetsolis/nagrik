// ============================================================
// Nagrik — Database Types
// Mirrors the Supabase schema exactly
// ============================================================

export type IssueStatus = 'pending' | 'in_progress' | 'resolved'
export type IssueCategory = 'garbage' | 'pothole' | 'drainage' | 'streetlight' | 'other'
export type IssueSeverity = 'minor' | 'moderate' | 'critical'

export interface Ward {
  id: string
  name: string
  city: string
  score: number
  geojson_id: string | null
  created_at: string
}

export interface Citizen {
  id: string
  clerk_user_id: string
  created_at: string
}

export interface Issue {
  id: string
  citizen_id: string | null
  ward_id: string | null
  authority_id: string | null
  photo_url: string
  ai_category: IssueCategory
  ai_severity: IssueSeverity
  status: IssueStatus
  resolution_photo_url: string | null
  created_at: string
  resolved_at: string | null
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

export interface EscalationEvent {
  id: string
  issue_id: string
  authority_id: string
  event_type: 'resolution' | 'escalation'
  score_delta: number
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
      issues: {
        Row: Issue
        Insert: Omit<Issue, 'id' | 'created_at'>
        Update: Partial<Omit<Issue, 'id' | 'created_at'>>
      }
      authorities: {
        Row: Authority
        Insert: Omit<Authority, 'id' | 'created_at'>
        Update: Partial<Omit<Authority, 'id' | 'created_at'>>
      }
      escalation_events: {
        Row: EscalationEvent
        Insert: Omit<EscalationEvent, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
