// ============================================================
// Nagrik — Server Action Return Types
// ============================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// classifyWaste result
export interface ClassifyWasteData {
  wasteType: 'wet_organic' | 'dry_paper' | 'dry_plastic' | 'dry_metal' | 'dry_glass' | 'e_waste' | 'hazardous' | 'textile' | 'non_recyclable'
  recyclable: boolean
  binColor: 'green' | 'blue' | 'red' | 'grey'
  prepSteps: string[]
  tip: string
  isWaste: boolean
}

// logWasteScan result
export interface LogWasteScanData {
  scanId: string
  pointsEarned: number
  totalEcoPoints: number
}

// confirmPickup result
export interface ConfirmPickupData {
  scanId: string
  newCollectorScore: number
}

// onboard results
export interface RegisterCitizenData   { citizenId: string }
export interface RegisterCollectorData { collectorId: string }
export type CheckUserResult = 'citizen' | 'collector' | null

// upload result
export interface UploadScanImageData { url: string }

// dashboard result
export interface ScanRowUI {
  id: string
  wasteType: string
  binColor: string
  binColorHex: string
  binLabel: string
  recyclable: boolean
  points: number
  status: 'pending' | 'collected'
  ward: string
  timestamp: number
}

export interface DashboardData {
  citizen: { name: string; eco_points: number; ward_name: string }
  stats: { total_scans: number; recyclable_count: number; ward_recycling_rate: number }
  recent_scans: ScanRowUI[]
}

// leaderboard result
export interface LeaderboardCitizen {
  rank: number
  id: string
  name: string
  ward: string
  ecoPoints: number
  totalScans: number
  recyclableRate: number
  badge: string
  streak: number
}

export interface LeaderboardWard {
  rank: number
  id: string
  name: string
  zone: string
  totalPoints: number
  activeCitizens: number
  avgScans: number
  recyclingRate: number
}

export interface LeaderboardData {
  citizens: LeaderboardCitizen[]
  wards: LeaderboardWard[]
}

// map result
export interface RecyclingCentreUI {
  id: string
  name: string
  address: string
  ward: string
  distance: string
  phone: string
  hours: string
  rating: number
  status: 'open' | 'busy' | 'closed'
  accepts: string[]
  totalCollections: number
  lat: number
  lng: number
  description: string
}

// collector dashboard result
export interface PickupUI {
  id: string
  citizen: string
  phone: string
  address: string
  ward: string
  wasteType: string
  binColor: string
  binColorHex: string
  status: 'pending' | 'in-progress' | 'completed'
  scheduledTime: string
  weight: string
  notes: string
}

export interface RouteUI {
  id: string
  name: string
  ward: string
  stops: number
  completed: number
  distance: string
  estimatedTime: string
  status: 'active' | 'pending' | 'done'
  stops_list: { address: string; status: 'done' | 'pending' | 'current' }[]
}

export interface RequestUI {
  id: string
  citizen: string
  phone: string
  address: string
  ward: string
  wasteType: string
  urgency: 'high' | 'medium' | 'low'
  submittedAt: string
  description: string
  imageAvailable: boolean
}

export interface CollectorDashboardData {
  collector: { name: string; ward_name: string }
  pickups: PickupUI[]
  routes: RouteUI[]
  requests: RequestUI[]
}
