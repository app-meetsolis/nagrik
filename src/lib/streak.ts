export interface StreakBeforeState {
  beforeTimestamp: number;
  beforeLat: number | null;
  beforeLng: number | null;
}

export interface LastLocation {
  lat: number;
  lng: number;
}

const STREAK_BEFORE_KEY = 'nagrik_streak_before';
const LAST_LOCATION_KEY = 'nagrik_last_location';
const STREAK_COUNT_KEY = 'nagrik_streak_count';

export function getStreakBefore(): StreakBeforeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const r = localStorage.getItem(STREAK_BEFORE_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

export function saveStreakBefore(s: StreakBeforeState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STREAK_BEFORE_KEY, JSON.stringify(s));
}

export function clearStreakBefore(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STREAK_BEFORE_KEY);
}

export function getLastLocation(): LastLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const r = localStorage.getItem(LAST_LOCATION_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

export function saveLastLocation(lat: number, lng: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify({ lat, lng }));
}

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getStreakCount(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(STREAK_COUNT_KEY) ?? '0');
}

export function incrementStreak(): number {
  const n = getStreakCount() + 1;
  if (typeof window !== 'undefined') localStorage.setItem(STREAK_COUNT_KEY, String(n));
  return n;
}

export function resetStreak(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STREAK_COUNT_KEY, '0');
  clearStreakBefore();
}
