/**
 * Nagrik Score Engine
 *
 * Ward scores represent civic health (0–100).
 * Authority scores represent responsiveness (0–100).
 *
 * Scores move in two moments:
 *   SUBMIT  — a citizen files an issue     → ward degrades
 *   RESOLVE — an authority fixes the issue → ward + authority both improve
 */

/** Ward score delta when a NEW issue is submitted (negative — ward gets worse) */
export const SUBMIT_WARD_DELTA: Record<string, number> = {
  minor:    -1,
  moderate: -2,
  critical: -4,
}

/** Ward score delta when an issue is RESOLVED (positive — ward recovers) */
export const RESOLVE_WARD_DELTA: Record<string, number> = {
  minor:    1,
  moderate: 2,
  critical: 3,
}

/** Authority score delta on RESOLUTION (reward for speed + action) */
export const AUTHORITY_SCORE_DELTA: Record<string, number> = {
  minor:    5,
  moderate: 10,
  critical: 15,
}

/** Clamp any score to the valid 0–100 range */
export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}
