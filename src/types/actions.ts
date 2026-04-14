// ============================================================
// Nagrik — Server Action Return Types
// Every server action returns ActionResult<T> — no exceptions
// ============================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// submitIssue result
export interface SubmitIssueData {
  issueId: string
  authorityName: string
  wardName: string
}

// categorizePhoto result
export interface CategorizePhotoData {
  category: 'garbage' | 'pothole' | 'drainage' | 'streetlight' | 'other'
  severity: 'minor' | 'moderate' | 'critical'
  isValidCivicIssue: boolean
}

// resolveIssue result
export interface ResolveIssueData {
  issueId: string
  newScore: number
}

// updateAuthorityScore result
export interface UpdateScoreData {
  authorityId: string
  newScore: number
}
