// ============================================================
// Nagrik — Server Action Return Types
// Every server action returns ActionResult<T> — no exceptions
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

// onboard.ts results
export interface RegisterCitizenData   { redirectTo: 'citizen' }
export interface RegisterAuthorityData { redirectTo: 'authority' }

