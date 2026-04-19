'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Zap, Clock, CheckCircle2, ChevronRight, Tag, Users } from 'lucide-react';
import { getUser, deductPoints, addCoupon, MOCK_SCANS } from '@/lib/storage';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'all' | 'transport' | 'utilities' | 'banking' | 'health' | 'civic';

interface Offer {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>;
  points: number;
  value: string;
  icon: string;
  provider: string;
  validDays: number;
  govtScheme: string;
  refreshDays: number;
  redeemedToday: number; // fake activity count
}

// ─── Offers data ──────────────────────────────────────────────────────────────

const ALL_OFFERS: Offer[] = [
  { id: 'metro-1',     title: '1 Metro Ride',              description: 'Single journey on any metro line',                     category: 'transport', points: 50,  value: '₹40 value',       icon: '🚇', provider: 'Jaipur Metro Rail Corp',    validDays: 30, govtScheme: 'Smart City Mission',                         refreshDays: 1,  redeemedToday: 47 },
  { id: 'bus-1',       title: 'RSRTC Bus Pass (1 Day)',     description: 'Unlimited city bus rides for one day',                 category: 'transport', points: 75,  value: '₹60 value',       icon: '🚌', provider: 'Rajasthan SRTC',            validDays: 7,  govtScheme: 'Urban Mobility Scheme',                      refreshDays: 3,  redeemedToday: 29 },
  { id: 'petrol-1',    title: 'Petrol Pump ₹25 Off',        description: 'Discount at HPCL/BPCL on min ₹500 fill',              category: 'transport', points: 90,  value: '₹25 off',         icon: '⛽', provider: 'HPCL Retail Outlet',        validDays: 15, govtScheme: 'Fuel Conservation Drive',                    refreshDays: 5,  redeemedToday: 18 },
  { id: 'electric-1',  title: 'Electricity Bill 5% Off',    description: 'Applied on your next JVVNL bill payment',             category: 'utilities', points: 100, value: 'Up to ₹120 off',  icon: '⚡', provider: 'JVVNL Jaipur',             validDays: 30, govtScheme: 'Swachh Bharat Mission',                      refreshDays: 7,  redeemedToday: 63 },
  { id: 'water-1',     title: 'Water Bill ₹50 Off',         description: 'Discount on PHED water supply bill',                  category: 'utilities', points: 80,  value: '₹50 off',         icon: '💧', provider: 'PHED Rajasthan',            validDays: 30, govtScheme: 'Nal Jal Yojana',                             refreshDays: 7,  redeemedToday: 41 },
  { id: 'jandhan-1',   title: 'Jan Dhan Fee Waiver',        description: 'Waive account maintenance fee for 3 months',          category: 'banking',   points: 120, value: '₹90 value',       icon: '🏦', provider: 'State Bank of India',       validDays: 60, govtScheme: 'Jan Dhan Yojana',                            refreshDays: 14, redeemedToday: 12 },
  { id: 'postoffice-1',title: 'Post Office RD Bonus',       description: '+0.25% interest on Recurring Deposit opening',        category: 'banking',   points: 200, value: 'Interest bonus',  icon: '📮', provider: 'India Post, Jaipur GPO',    validDays: 45, govtScheme: 'Postal Savings Scheme',                      refreshDays: 14, redeemedToday: 7  },
  { id: 'health-1',    title: 'Ayushman Health Checkup',    description: 'Free basic health checkup at empanelled hospital',    category: 'health',    points: 150, value: '₹300 value',      icon: '🏥', provider: 'Sawai Man Singh Hospital',  validDays: 60, govtScheme: 'Ayushman Bharat',                            refreshDays: 10, redeemedToday: 22 },
  { id: 'medicine-1',  title: 'Jan Aushadhi 10% Off',       description: 'Discount on generic medicines at Jan Aushadhi Kendra',category: 'health',    points: 60,  value: '10% discount',    icon: '💊', provider: 'BPPI Jan Aushadhi',         validDays: 15, govtScheme: 'PM Bhartiya Jan Aushadhi',                   refreshDays: 5,  redeemedToday: 55 },
  { id: 'tax-1',       title: 'Property Tax 2% Rebate',     description: 'Apply rebate on your annual JMC property tax',        category: 'civic',     points: 300, value: 'Up to ₹500 off',  icon: '🏛️', provider: 'Jaipur Municipal Corp',    validDays: 90, govtScheme: 'Urban Local Body Scheme',                    refreshDays: 30, redeemedToday: 5  },
  { id: 'doc-1',       title: 'Free Document Attestation',  description: '1 free attestation at ward office (any document)',    category: 'civic',     points: 180, value: '₹150 value',      icon: '📄', provider: 'Ward Office — Mansarovar',  validDays: 30, govtScheme: 'e-Governance Initiative',                    refreshDays: 10, redeemedToday: 9  },
  { id: 'soil-1',      title: 'Organic Compost (5 kg)',     description: 'Home delivery of compost made from collected waste',  category: 'civic',     points: 140, value: '₹180 value',      icon: '🌱', provider: 'JMC Composting Unit',       validDays: 30, govtScheme: 'Swachh Bharat Mission',                      refreshDays: 7,  redeemedToday: 34 },
];

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'all',       label: 'All',       emoji: '🛒' },
  { key: 'transport', label: 'Transport', emoji: '🚇' },
  { key: 'utilities', label: 'Utilities', emoji: '⚡' },
  { key: 'banking',   label: 'Banking',   emoji: '🏦' },
  { key: 'health',    label: 'Health',    emoji: '🏥' },
  { key: 'civic',     label: 'Civic',     emoji: '🏛️' },
];

// Live activity feed — rotates on screen
const ACTIVITY = [
  { name: 'Meera S.', action: 'redeemed Metro Ride', ago: '2m ago', pts: 50 },
  { name: 'Ravi K.',  action: 'redeemed Electricity 5% Off', ago: '5m ago', pts: 100 },
  { name: 'Sunita P.',action: 'redeemed Jan Aushadhi 10% Off', ago: '9m ago', pts: 60 },
  { name: 'Arjun M.', action: 'redeemed Ayushman Checkup', ago: '14m ago', pts: 150 },
  { name: 'Priya D.', action: 'redeemed Organic Compost', ago: '21m ago', pts: 140 },
  { name: 'Deepak V.',action: 'redeemed RSRTC Bus Pass', ago: '28m ago', pts: 75 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekNumber() { return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); }

function getFeaturedIds(): string[] {
  const groups = [['metro-1','electric-1','health-1'],['bus-1','water-1','jandhan-1'],['petrol-1','medicine-1','doc-1'],['soil-1','tax-1','postoffice-1']];
  return groups[weekNumber() % groups.length];
}

function getFlashIds(): string[] {
  const groups = [['metro-1','medicine-1'],['bus-1','water-1'],['electric-1','doc-1'],['health-1','petrol-1'],['jandhan-1','soil-1'],['tax-1','postoffice-1'],['metro-1','electric-1']];
  return groups[new Date().getDay()];
}

function msUntilMidnight() {
  const m = new Date(); m.setHours(24, 0, 0, 0); return m.getTime() - Date.now();
}
function fmtCountdown(ms: number) {
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

function genCode(offerId: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seed = offerId + Date.now().toString(36);
  let code = 'NGK-';
  for (let i = 0; i < 8; i++) code += chars[(seed.charCodeAt(i % seed.length) * (i + 7)) % chars.length];
  return code;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200';
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className={`rounded-2xl p-4 border animate-pulse ${isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200'}`}>
          <div className="flex gap-3 mb-3">
            <div className={`w-11 h-11 rounded-xl ${base}`} />
            <div className="flex-1 space-y-2 pt-1">
              <div className={`h-3.5 rounded-full w-2/3 ${base}`} />
              <div className={`h-2.5 rounded-full w-full ${base}`} />
            </div>
          </div>
          <div className={`h-2.5 rounded-full w-1/2 mb-3 ${base}`} />
          <div className="flex justify-between items-center">
            <div className={`h-5 rounded-full w-16 ${base}`} />
            <div className={`h-8 rounded-xl w-20 ${base}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Fake QR ─────────────────────────────────────────────────────────────────

function FakeQR({ code }: { code: string }) {
  const S = 19;
  const cells = Array.from({ length: S * S }, (_, i) => {
    const r = Math.floor(i / S), c = i % S;
    if ((r < 5 && c < 5) || (r < 5 && c >= S - 5) || (r >= S - 5 && c < 5)) return true;
    return (code.charCodeAt(i % code.length) ^ (i * 13 + r * 7)) % 2 === 0;
  });
  return (
    <div className="bg-white p-2.5 rounded-xl inline-block" style={{ display: 'grid', gridTemplateColumns: `repeat(${S}, 1fr)`, gap: 1.5, width: 156, height: 156 }}>
      {cells.map((f, i) => <div key={i} className="rounded-[1px]" style={{ backgroundColor: f ? '#0A0A0A' : 'transparent' }} />)}
    </div>
  );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────

interface CardProps { offer: Offer; isFeatured: boolean; isFlash: boolean; userPoints: number; countdown: string; onRedeem: (o: Offer) => void; isDark: boolean; }

function OfferCard({ offer, isFeatured, isFlash, userPoints, countdown, onRedeem, isDark }: CardProps) {
  const displayPoints = isFlash ? Math.round(offer.points * 0.8) : offer.points;
  const canAfford = userPoints >= displayPoints;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`relative rounded-2xl border p-4 flex flex-col gap-3 transition-colors duration-200 ${
        isFeatured
          ? isDark ? 'bg-gradient-to-br from-[#22C55E]/10 to-[#141414] border-[#22C55E]/30' : 'bg-gradient-to-br from-[#22C55E]/8 to-white border-[#22C55E]/25'
          : isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap justify-end">
        {isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">⭐ Featured</span>}
        {isFlash && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">⚡ Flash</span>}
      </div>

      {/* Icon + title */}
      <div className="flex items-start gap-3 pr-24">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>{offer.icon}</div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{offer.title}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{offer.description}</p>
        </div>
      </div>

      {/* Provider */}
      <p className={`text-[10px] px-2 py-1 rounded-lg ${isDark ? 'bg-[#1A1A1A] text-zinc-600' : 'bg-gray-50 text-gray-400'}`}>
        {offer.provider} · {offer.govtScheme}
      </p>

      {/* Redeemed today */}
      <div className="flex items-center gap-1">
        <Users className="w-3 h-3 text-zinc-500" />
        <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{offer.redeemedToday} people redeemed today</span>
      </div>

      {/* Points + CTA */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <div className="flex items-baseline gap-1.5">
            {isFlash && <span className={`text-xs line-through ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{offer.points}</span>}
            <span className={`text-xl font-bold font-tabular ${canAfford ? 'text-[#22C55E]' : isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{displayPoints}</span>
            <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>pts</span>
          </div>
          <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{offer.value} · valid {offer.validDays}d</p>
          {isFlash && <p className="text-[10px] text-orange-400">Resets in {countdown}</p>}
        </div>
        <button
          onClick={() => onRedeem({ ...offer, points: displayPoints })}
          disabled={!canAfford}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            canAfford ? 'bg-[#22C55E] hover:bg-[#16A34A] text-black' : isDark ? 'bg-[#1A1A1A] text-zinc-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Redeem <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ offer, userPoints, onClose, onConfirm, isDark }: { offer: Offer; userPoints: number; onClose: () => void; onConfirm: (o: Offer) => void; isDark: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{offer.icon} {offer.title}</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{offer.provider}</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#1A1A1A] text-zinc-500' : 'bg-gray-100 text-gray-500'}`}><X className="w-4 h-4" /></button>
        </div>

        <div className={`rounded-xl p-4 mb-5 space-y-2 ${isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-gray-50 border border-gray-200'}`}>
          {[
            { label: 'Your balance', value: `${userPoints} pts`, cls: 'text-[#22C55E] font-bold' },
            { label: 'Cost',         value: `−${offer.points} pts`, cls: `font-bold ${isDark ? 'text-white' : 'text-gray-900'}` },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className={isDark ? 'text-zinc-400' : 'text-gray-600'}>{r.label}</span>
              <span className={r.cls}>{r.value}</span>
            </div>
          ))}
          <div className={`pt-2 border-t flex justify-between text-sm font-semibold ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
            <span className={isDark ? 'text-zinc-400' : 'text-gray-600'}>After redemption</span>
            <span className="text-[#22C55E]">{userPoints - offer.points} pts</span>
          </div>
        </div>

        <div className={`flex items-start gap-2 mb-5 p-3 rounded-xl ${isDark ? 'bg-orange-500/5 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
          <Clock className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            Coupon valid for <span className="text-orange-400 font-semibold">{offer.validDays} days</span>. Cannot be transferred or re-issued.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 h-11 rounded-xl text-sm font-medium border ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>Cancel</button>
          <button onClick={() => onConfirm(offer)} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-black flex items-center justify-center gap-1.5">
            Confirm <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Coupon Screen ────────────────────────────────────────────────────────────

function CouponScreen({ coupon, onClose, isDark }: { coupon: { code: string; offer: Offer; expiresAt: number }; onClose: () => void; isDark: boolean }) {
  const expiry = new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border overflow-hidden ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
      >
        <div className="bg-[#22C55E] px-6 py-4 flex items-center gap-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}>
            <CheckCircle2 className="w-8 h-8 text-black" />
          </motion.div>
          <div>
            <p className="text-black font-bold text-base">Coupon Generated!</p>
            <p className="text-black/70 text-xs">Show this at the service counter</p>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className={`w-4 h-8 rounded-r-full ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F4F7F4]'}`} />
          <div className={`flex-1 border-t-2 border-dashed mx-1 ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`} />
          <div className={`w-4 h-8 rounded-l-full ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F4F7F4]'}`} />
        </div>

        <div className="px-6 pb-6 pt-2 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className={`text-xs uppercase tracking-widest mb-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{coupon.offer.icon} {coupon.offer.title}</p>
            <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{coupon.offer.provider}</p>
          </div>
          <FakeQR code={coupon.code} />
          <div className={`font-mono text-lg font-bold tracking-widest px-4 py-2 rounded-xl ${isDark ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-900'}`}>{coupon.code}</div>
          <div className={`w-full rounded-xl p-3 space-y-2 ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-50'}`}>
            {[
              { label: 'Scheme', val: coupon.offer.govtScheme, cls: isDark ? 'text-zinc-300' : 'text-gray-700' },
              { label: 'Value',  val: coupon.offer.value,      cls: 'text-[#22C55E]' },
              { label: 'Expires',val: expiry,                  cls: 'text-orange-400' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className={isDark ? 'text-zinc-500' : 'text-gray-500'}>{r.label}</span>
                <span className={`font-medium ${r.cls}`}>{r.val}</span>
              </div>
            ))}
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>
            <Tag className="w-3 h-3" /><span>Issued under Nagrik Eco Rewards Programme</span>
          </div>
          <button onClick={onClose} className="w-full h-11 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold text-sm">Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MarketplaceClient() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [category, setCategory] = useState<Category>('all');
  const [pendingOffer, setPendingOffer] = useState<Offer | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; offer: Offer; expiresAt: number } | null>(null);
  const [activityIdx, setActivityIdx] = useState(0);
  const [countdown, setCountdown] = useState(() => fmtCountdown(msUntilMidnight()));
  const [redeemedCounts, setRedeemedCounts] = useState<Record<string, number>>({});

  const featuredIds = getFeaturedIds();
  const flashIds    = getFlashIds();

  useEffect(() => {
    // Simulate API fetch
    const t = setTimeout(() => {
      const user = getUser();
      const stored = user?.ecoPoints ?? 0;
      const mockTotal = MOCK_SCANS.reduce((s, sc) => s + sc.points, 0);
      // Treat 0 as "no real data yet" — seed with mock total so marketplace is usable
      setUserPoints(stored > 0 ? stored : mockTotal);
      setLoading(false);
    }, 1400);

    // Rotate activity ticker every 4s
    const act = setInterval(() => setActivityIdx(i => (i + 1) % ACTIVITY.length), 4000);

    // Countdown refresh every minute
    const cdTimer = setInterval(() => setCountdown(fmtCountdown(msUntilMidnight())), 60_000);

    return () => { clearTimeout(t); clearInterval(act); clearInterval(cdTimer); };
  }, []);

  const filtered = category === 'all' ? ALL_OFFERS : ALL_OFFERS.filter(o => o.category === category);

  const handleRedeem = useCallback((offer: Offer) => setPendingOffer(offer), []);

  const handleConfirm = useCallback((offer: Offer) => {
    const code = genCode(offer.id);
    const expiresAt = Date.now() + offer.validDays * 86_400_000;
    deductPoints(offer.points);
    addCoupon({ id: `coupon-${Date.now()}`, offerId: offer.id, offerTitle: offer.title, code, pointsCost: offer.points, redeemedAt: Date.now(), expiresAt });
    setUserPoints(p => Math.max(0, p - offer.points));
    setRedeemedCounts(prev => ({ ...prev, [offer.id]: (prev[offer.id] ?? offer.redeemedToday) + 1 }));
    setPendingOffer(null);
    setActiveCoupon({ code, offer, expiresAt });
    toast.success(`${offer.icon} Coupon generated!`, {
      description: `${offer.title} · ${offer.value} · Valid ${offer.validDays} days`,
    });
  }, []);

  const activity = ACTIVITY[activityIdx];

  return (
    <>
      <div className="px-5 lg:px-8 py-6 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-[#22C55E]" />
              <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Eco Marketplace</h1>
            </div>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Redeem eco-points for real government services</p>
          </div>
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl px-3 py-2 text-right flex-shrink-0">
            {loading ? (
              <div className={`h-6 w-12 rounded-full animate-pulse mb-0.5 ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`} />
            ) : (
              <p className="text-[#22C55E] font-bold text-lg font-tabular">{userPoints}</p>
            )}
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>your points</p>
          </div>
        </motion.div>

        {/* Live activity ticker */}
        <AnimatePresence mode="wait">
          <motion.div key={activityIdx} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }}
            className={`mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200'}`}
          >
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-white">{activity.name}</span> {activity.action}
              <span className={`ml-2 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>· {activity.ago}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Flash sale banner */}
        <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap className="w-4 h-4 text-orange-400 flex-shrink-0" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-orange-300">Flash Deals — 20% off on 2 offers today</p>
            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Resets in <span className="text-orange-400 font-medium">{countdown}</span></p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                category === cat.key
                  ? 'bg-[#22C55E]/20 border-[#22C55E]/40 text-[#22C55E]'
                  : isDark ? 'bg-[#141414] border-[#2A2A2A] text-zinc-500' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton isDark={isDark} />
        ) : (
          <>
            {/* Featured */}
            {category === 'all' && (
              <div className="mb-5">
                <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>⭐ Featured This Week</p>
                <div className="space-y-3">
                  {ALL_OFFERS.filter(o => featuredIds.includes(o.id)).map(offer => (
                    <OfferCard key={offer.id} offer={{ ...offer, redeemedToday: redeemedCounts[offer.id] ?? offer.redeemedToday }}
                      isFeatured isFlash={flashIds.includes(offer.id)} userPoints={userPoints} countdown={countdown} onRedeem={handleRedeem} isDark={isDark} />
                  ))}
                </div>
              </div>
            )}

            {/* All / category offers */}
            <div>
              <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                {category === 'all' ? 'More Offers' : `${CATEGORIES.find(c => c.key === category)?.emoji} ${CATEGORIES.find(c => c.key === category)?.label}`}
              </p>
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.filter(o => category !== 'all' || !featuredIds.includes(o.id)).map(offer => (
                    <OfferCard key={offer.id} offer={{ ...offer, redeemedToday: redeemedCounts[offer.id] ?? offer.redeemedToday }}
                      isFeatured={false} isFlash={flashIds.includes(offer.id)} userPoints={userPoints} countdown={countdown} onRedeem={handleRedeem} isDark={isDark} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <p className={`text-center text-xs mt-8 ${isDark ? 'text-zinc-700' : 'text-gray-400'}`}>
              Offers refresh weekly · Powered by Swachh Bharat Mission
            </p>
          </>
        )}
      </div>

      <AnimatePresence>
        {pendingOffer && <ConfirmModal offer={pendingOffer} userPoints={userPoints} onClose={() => setPendingOffer(null)} onConfirm={handleConfirm} isDark={isDark} />}
        {activeCoupon && <CouponScreen coupon={activeCoupon} onClose={() => setActiveCoupon(null)} isDark={isDark} />}
      </AnimatePresence>
    </>
  );
}
