export interface ScanRecord {
  id: string;
  wasteType: string;
  binColor: string;
  binColorHex: string;
  binLabel: string;
  recyclable: boolean;
  points: number;
  status: 'pending' | 'collected';
  ward: string;
  timestamp: number;
  imageDataUrl?: string;
}

export interface UserData {
  name: string;
  phone: string;
  role: 'citizen' | 'collector';
  ward: string;
  ecoPoints: number;
  totalScans: number;
}

const USER_KEY = 'nagrik_user';
const SCANS_KEY = 'nagrik_scans';

export function getUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getScans(): ScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addScan(scan: ScanRecord): void {
  if (typeof window === 'undefined') return;
  const existing = getScans();
  localStorage.setItem(SCANS_KEY, JSON.stringify([scan, ...existing]));
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SCANS_KEY);
}

export const MOCK_SCANS: ScanRecord[] = [
  { id: 'scan-001', wasteType: 'Wet Organic', binColor: 'green', binColorHex: '#22C55E', binLabel: 'Green Bin', recyclable: true, points: 10, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 2 * 60 * 1000 },
  { id: 'scan-002', wasteType: 'Dry Plastic', binColor: 'blue', binColorHex: '#3B82F6', binLabel: 'Blue Bin', recyclable: true, points: 10, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 60 * 60 * 1000 },
  { id: 'scan-003', wasteType: 'E-Waste', binColor: 'red', binColorHex: '#EF4444', binLabel: 'Red Bin', recyclable: false, points: 15, status: 'pending', ward: 'Mansarovar', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
  { id: 'scan-004', wasteType: 'Dry Paper', binColor: 'blue', binColorHex: '#3B82F6', binLabel: 'Blue Bin', recyclable: true, points: 10, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 24 * 60 * 60 * 1000 },
  { id: 'scan-005', wasteType: 'Non-Recyclable', binColor: 'grey', binColorHex: '#6B7280', binLabel: 'Grey Bin', recyclable: false, points: 2, status: 'pending', ward: 'Mansarovar', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: 'scan-006', wasteType: 'Glass Bottle', binColor: 'blue', binColorHex: '#3B82F6', binLabel: 'Blue Bin', recyclable: true, points: 10, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { id: 'scan-007', wasteType: 'Hazardous', binColor: 'red', binColorHex: '#EF4444', binLabel: 'Red Bin', recyclable: false, points: 15, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  { id: 'scan-008', wasteType: 'Metal Can', binColor: 'blue', binColorHex: '#3B82F6', binLabel: 'Blue Bin', recyclable: true, points: 10, status: 'collected', ward: 'Mansarovar', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
];

export interface CouponRecord {
  id: string;
  offerId: string;
  offerTitle: string;
  code: string;
  pointsCost: number;
  redeemedAt: number;
  expiresAt: number;
}

const COUPONS_KEY = 'nagrik_coupons';

export function getCoupons(): CouponRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COUPONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addCoupon(coupon: CouponRecord): void {
  if (typeof window === 'undefined') return;
  const existing = getCoupons();
  localStorage.setItem(COUPONS_KEY, JSON.stringify([coupon, ...existing]));
}

export function deductPoints(amount: number): void {
  if (typeof window === 'undefined') return;
  const user = getUser();
  if (!user) return;
  user.ecoPoints = Math.max(0, (user.ecoPoints ?? 0) - amount);
  saveUser(user);
}

export function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
