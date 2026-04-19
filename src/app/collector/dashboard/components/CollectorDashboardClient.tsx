'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle2, Clock, AlertTriangle, MapPin, Package, X, ChevronRight, User, Phone, Navigation, TrendingUp, Recycle, Flame, Star, Filter } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData, PickupUI, RouteUI, RequestUI } from '@/types/actions';

function openGoogleMaps(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address + ', Jaipur, Rajasthan')}`, '_blank');
}

const FALLBACK_PICKUPS: PickupUI[] = [
  { id: 'p1', citizen: 'Janvi Sharma', phone: '9876543210', address: '12, Shanti Nagar, Mansarovar', ward: 'Mansarovar', wasteType: 'Wet Organic', binColor: 'green', binColorHex: '#22C55E', status: 'in-progress', scheduledTime: '09:00 AM', weight: '4.2 kg', notes: 'Large bag near gate' },
  { id: 'p2', citizen: 'Rahul Verma', phone: '9123456789', address: '45, Vikas Path, Vaishali Nagar', ward: 'Vaishali Nagar', wasteType: 'Dry Plastic', binColor: 'blue', binColorHex: '#3B82F6', status: 'pending', scheduledTime: '10:30 AM', weight: '2.1 kg', notes: '' },
  { id: 'p3', citizen: 'Priya Singh', phone: '9988776655', address: '7, Lal Kothi, Civil Lines', ward: 'Civil Lines', wasteType: 'E-Waste', binColor: 'red', binColorHex: '#EF4444', status: 'pending', scheduledTime: '11:00 AM', weight: '1.5 kg', notes: 'Old electronics, handle carefully' },
  { id: 'p4', citizen: 'Mohan Das', phone: '9765432100', address: '23, Gandhi Nagar, Sanganer', ward: 'Sanganer', wasteType: 'Glass', binColor: 'blue', binColorHex: '#3B82F6', status: 'completed', scheduledTime: '08:00 AM', weight: '3.8 kg', notes: '' },
  { id: 'p5', citizen: 'Sunita Joshi', phone: '9654321098', address: '56, Pratap Nagar, Sanganer', ward: 'Sanganer', wasteType: 'Hazardous', binColor: 'red', binColorHex: '#EF4444', status: 'completed', scheduledTime: '08:30 AM', weight: '0.8 kg', notes: 'Chemical waste, use gloves' },
];

const FALLBACK_ROUTES: RouteUI[] = [
  {
    id: 'r1', name: 'Mansarovar Zone A', ward: 'Mansarovar', stops: 8, completed: 5, distance: '6.2 km', estimatedTime: '1h 20m', status: 'active',
    stops_list: [
      { address: '12, Shanti Nagar', status: 'done' },
      { address: '34, Ram Nagar', status: 'done' },
      { address: '56, Patel Marg', status: 'done' },
      { address: '78, Nehru Colony', status: 'done' },
      { address: '90, Vikas Marg', status: 'done' },
      { address: '102, Indira Nagar', status: 'current' },
      { address: '114, Gandhi Path', status: 'pending' },
      { address: '126, Subhash Nagar', status: 'pending' },
    ]
  },
  {
    id: 'r2', name: 'Vaishali Nagar Zone B', ward: 'Vaishali Nagar', stops: 6, completed: 0, distance: '4.8 km', estimatedTime: '1h 05m', status: 'pending',
    stops_list: [
      { address: '45, Vikas Path', status: 'pending' },
      { address: '67, Shyam Nagar', status: 'pending' },
      { address: '89, Laxmi Colony', status: 'pending' },
      { address: '11, Durga Marg', status: 'pending' },
      { address: '33, Saraswati Nagar', status: 'pending' },
      { address: '55, Hanuman Path', status: 'pending' },
    ]
  },
  {
    id: 'r3', name: 'Sanganer Zone C', ward: 'Sanganer', stops: 5, completed: 5, distance: '3.5 km', estimatedTime: '45m', status: 'done',
    stops_list: [
      { address: '23, Gandhi Nagar', status: 'done' },
      { address: '56, Pratap Nagar', status: 'done' },
      { address: '78, Nehru Marg', status: 'done' },
      { address: '90, Azad Colony', status: 'done' },
      { address: '12, Bhagat Singh Path', status: 'done' },
    ]
  },
];

const FALLBACK_REQUESTS: RequestUI[] = [
  { id: 'req1', citizen: 'Amit Gupta', phone: '9871234560', address: '33, Tilak Nagar, Jhotwara', ward: 'Jhotwara', wasteType: 'Bulk Waste', urgency: 'high', submittedAt: '2h ago', description: 'Large furniture items and old appliances need urgent pickup. Blocking the pathway.', imageAvailable: true },
  { id: 'req2', citizen: 'Kavita Meena', phone: '9765123456', address: '78, Shastri Nagar, Murlipura', ward: 'Murlipura', wasteType: 'Construction Debris', urgency: 'medium', submittedAt: '5h ago', description: 'Renovation waste including bricks and cement bags.', imageAvailable: false },
  { id: 'req3', citizen: 'Deepak Sharma', phone: '9654012345', address: '15, Vidhyadhar Nagar', ward: 'Vidhyadhar Nagar', wasteType: 'Medical Waste', urgency: 'high', submittedAt: '1h ago', description: 'Used syringes and medical packaging from home care patient.', imageAvailable: true },
  { id: 'req4', citizen: 'Neha Agarwal', phone: '9543901234', address: '62, Bani Park', ward: 'Bani Park', wasteType: 'Garden Waste', urgency: 'low', submittedAt: '1d ago', description: 'Tree branches and dry leaves from garden pruning.', imageAvailable: false },
];

const STATUS_CONFIG = {
  'in-progress': { label: 'In Progress', color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400' },
  'pending': { label: 'Pending', color: '#6B7280', bg: 'bg-zinc-500/10 text-zinc-400' },
  'completed': { label: 'Completed', color: '#22C55E', bg: 'bg-[#22C55E]/10 text-[#22C55E]' },
};

const URGENCY_CONFIG = {
  high: { label: 'Urgent', bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Medium', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const ROUTE_STATUS = {
  active: { label: 'Active', bg: 'bg-amber-500/10 text-amber-400' },
  pending: { label: 'Pending', bg: 'bg-zinc-500/10 text-zinc-400' },
  done: { label: 'Done', bg: 'bg-[#22C55E]/10 text-[#22C55E]' },
};

function Dialog({ open, onClose, children, isDark }: { open: boolean; onClose: () => void; children: React.ReactNode; isDark: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 lg:pb-0"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border overflow-hidden ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PickupDialog({ pickup, onClose, onStatusChange, isDark }: { pickup: PickupUI | null; onClose: () => void; onStatusChange: (id: string, status: 'in-progress' | 'completed') => void; isDark: boolean }) {
  if (!pickup) return null;
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';
  const cfg = STATUS_CONFIG[pickup.status];

  return (
    <Dialog open={!!pickup} onClose={onClose} isDark={isDark}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: pickup.binColorHex + '20' }}>
              <Truck className="w-5 h-5" style={{ color: pickup.binColorHex }} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>{pickup.wasteType}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: User, label: 'Citizen', value: pickup.citizen },
            { icon: Phone, label: 'Phone', value: pickup.phone },
            { icon: Clock, label: 'Scheduled', value: pickup.scheduledTime },
            { icon: Package, label: 'Est. Weight', value: pickup.weight },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={`rounded-xl p-3 border ${elevated}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${muted}`} />
                <p className={`text-xs ${muted}`}>{label}</p>
              </div>
              <p className={`text-sm font-semibold ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-3 border ${elevated} mb-4`}>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className={`w-3.5 h-3.5 ${muted}`} />
            <p className={`text-xs ${muted}`}>Address</p>
          </div>
          <p className={`text-sm font-semibold ${text}`}>{pickup.address}</p>
          <p className={`text-xs mt-0.5 ${muted}`}>Ward: {pickup.ward}</p>
        </div>

        {pickup.notes && (
          <div className="rounded-xl p-3 border border-amber-500/20 bg-amber-500/5 mb-4">
            <p className="text-xs text-amber-400 font-medium mb-1">⚠ Notes</p>
            <p className={`text-sm ${text}`}>{pickup.notes}</p>
          </div>
        )}

        <div className="flex gap-3">
          {pickup.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(pickup.id, pickup.status === 'pending' ? 'in-progress' : 'completed')}
              className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-11 text-sm transition-all duration-200"
            >
              {pickup.status === 'pending' ? 'Start Pickup' : 'Mark Complete'}
            </button>
          )}
          <button
            onClick={() => openGoogleMaps(pickup.address)}
            className={`flex-1 border rounded-xl h-11 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${isDark ? 'border-[#2A2A2A] text-zinc-300 hover:bg-[#1A1A1A]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Navigation className="w-4 h-4" /> Navigate
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function RouteDialog({ route, onClose, isDark }: { route: RouteUI | null; onClose: () => void; isDark: boolean }) {
  if (!route) return null;
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';
  const cfg = ROUTE_STATUS[route.status];
  const progress = Math.round((route.completed / route.stops) * 100);

  return (
    <Dialog open={!!route} onClose={onClose} isDark={isDark}>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className={`text-lg font-bold ${text}`}>{route.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
              <span className={`text-xs ${muted}`}>{route.ward}</span>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Stops', value: `${route.completed}/${route.stops}` },
            { label: 'Distance', value: route.distance },
            { label: 'Est. Time', value: route.estimatedTime },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl p-3 border text-center ${elevated}`}>
              <p className={`text-base font-bold ${text}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-4 border ${elevated} mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${text}`}>Route Progress</p>
            <p className="text-sm font-bold text-[#22C55E]">{progress}%</p>
          </div>
          <div className={`h-2 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-2 rounded-full bg-[#22C55E]"
            />
          </div>
        </div>

        <div>
          <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${muted}`}>Stops</p>
          <div className="space-y-2">
            {route.stops_list.map((stop, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${elevated}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  stop.status === 'done' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                  stop.status === 'current' ? 'bg-amber-500/20 text-amber-400' :
                  isDark ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-gray-200 text-gray-400'
                }`}>
                  {stop.status === 'done' ? '✓' : stop.status === 'current' ? '→' : i + 1}
                </div>
                <p className={`text-sm flex-1 ${stop.status === 'done' ? muted + ' line-through' : text}`}>{stop.address}</p>
                {stop.status === 'current' && <span className="text-xs text-amber-400 font-medium">Current</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function RequestDialog({ request, onClose, onAccept, onDecline, isDark }: { request: RequestUI | null; onClose: () => void; onAccept: (id: string) => void; onDecline: (id: string) => void; isDark: boolean }) {
  if (!request) return null;
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';
  const ucfg = URGENCY_CONFIG[request.urgency];

  return (
    <Dialog open={!!request} onClose={onClose} isDark={isDark}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className={`text-lg font-bold ${text}`}>{request.wasteType}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ucfg.bg}`}>{ucfg.label}</span>
              <span className={`text-xs ${muted}`}>{request.submittedAt}</span>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: User, label: 'Citizen', value: request.citizen },
            { icon: Phone, label: 'Phone', value: request.phone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={`rounded-xl p-3 border ${elevated}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${muted}`} />
                <p className={`text-xs ${muted}`}>{label}</p>
              </div>
              <p className={`text-sm font-semibold ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-3 border ${elevated} mb-4`}>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className={`w-3.5 h-3.5 ${muted}`} />
            <p className={`text-xs ${muted}`}>Address</p>
          </div>
          <p className={`text-sm font-semibold ${text}`}>{request.address}</p>
          <p className={`text-xs mt-0.5 ${muted}`}>Ward: {request.ward}</p>
        </div>

        <div className={`rounded-xl p-3 border ${elevated} mb-4`}>
          <p className={`text-xs ${muted} mb-1`}>Description</p>
          <p className={`text-sm ${text}`}>{request.description}</p>
        </div>

        {request.imageAvailable && (
          <div className="rounded-xl p-3 border border-[#22C55E]/20 bg-[#22C55E]/5 mb-4 flex items-center gap-2">
            <span className="text-sm">📷</span>
            <p className="text-sm text-[#22C55E] font-medium">Photo attached by citizen</p>
          </div>
        )}

        <button
          onClick={() => openGoogleMaps(request.address)}
          className={`w-full mb-3 border rounded-xl h-10 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${isDark ? 'border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
        >
          <Navigation className="w-4 h-4" /> Navigate to Location
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-11 text-sm transition-all duration-200"
          >
            Accept Request
          </button>
          <button
            onClick={() => onDecline(request.id)}
            className={`flex-1 border rounded-xl h-11 text-sm font-semibold transition-all duration-200 ${isDark ? 'border-[#2A2A2A] text-zinc-300 hover:bg-[#1A1A1A]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Decline
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface Props { data: CollectorDashboardData | null }

export default function CollectorDashboardClient({ data }: Props) {
  const { isDark } = useTheme();
  const [pickups, setPickups] = useState<PickupUI[]>(data?.pickups?.length ? data.pickups : FALLBACK_PICKUPS);
  const [requests, setRequests] = useState<RequestUI[]>(data?.requests?.length ? data.requests : FALLBACK_REQUESTS);
  const [selectedPickup, setSelectedPickup] = useState<PickupUI | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteUI | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestUI | null>(null);
  const [pickupFilter, setPickupFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const card = isDark ? 'bg-[#141414] border-[#1F1F1F] hover:border-[#2A2A2A]' : 'bg-white border-gray-200 hover:border-gray-300';

  const ROUTES = data?.routes?.length ? data.routes : FALLBACK_ROUTES;
  const collectorName = data?.collector.name ?? 'Rajesh Kumar';
  const wardName = data?.collector.ward_name ?? 'Mansarovar Ward';

  // Weekly pickups done: starts at 34 (realistic base) + any completions in this session
  const SESSION_BASE_COMPLETED = 34;
  const SESSION_BASE_TOTAL = 40;
  const sessionCompletedThisView = pickups.filter(p => p.status === 'completed').length;
  const sessionStartCompleted = FALLBACK_PICKUPS.filter(p => p.status === 'completed').length; // 2
  const weeklyPickupsDone = SESSION_BASE_COMPLETED + (sessionCompletedThisView - sessionStartCompleted);

  const handlePickupStatusChange = (id: string, status: 'in-progress' | 'completed') => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelectedPickup(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const handleAcceptRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelectedRequest(null);
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelectedRequest(null);
  };

  const todayPickups = pickups.length;
  const completedPickups = pickups.filter(p => p.status === 'completed').length;
  const inProgressPickups = pickups.filter(p => p.status === 'in-progress').length;
  const pendingPickups = pickups.filter(p => p.status === 'pending').length;
  const urgentRequests = requests.filter(r => r.urgency === 'high').length;

  const filteredPickups = pickupFilter === 'all' ? pickups : pickups.filter(p => p.status === pickupFilter);

  // Weight-derived metrics
  const sessionStartKg = FALLBACK_PICKUPS.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.weight), 0); // 4.6
  const completedWeightKg = pickups.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.weight), 0);
  const SESSION_BASE_KG = 127.4;
  const weeklyKgCollected = +(SESSION_BASE_KG + (completedWeightKg - sessionStartKg)).toFixed(1);
  const co2Saved = +(weeklyKgCollected * 0.52).toFixed(1);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${muted}`}>Good morning,</p>
            <h1 className={`text-2xl font-bold tracking-tight ${text}`}>{collectorName}</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>{wardName} · Today's shift</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold px-3 py-1.5 rounded-full">
              🟢 On Duty
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats — hero row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 mb-3">
        {/* Today's pickups progress */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4 border border-[#22C55E]/25 bg-[#22C55E]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <span className="text-xs text-[#22C55E] font-semibold">{todayPickups ? Math.round((completedPickups / todayPickups) * 100) : 0}%</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>
            <AnimatedCounter to={completedPickups} duration={800} />
            <span className="text-zinc-500 text-xl font-normal">/{todayPickups}</span>
          </p>
          <p className={`text-xs mt-0.5 ${muted}`}>Pickups done today</p>
          <div className="mt-2 h-1.5 rounded-full bg-[#22C55E]/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${todayPickups ? (completedPickups / todayPickups) * 100 : 0}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-1.5 rounded-full bg-[#22C55E]"
            />
          </div>
        </motion.div>

        {/* Kg collected */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4 border border-[#3B82F6]/25 bg-[#3B82F6]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <span className="text-xs text-[#3B82F6] font-semibold">↑ 8%</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>{weeklyKgCollected}<span className="text-zinc-500 text-base font-normal"> kg</span></p>
          <p className={`text-xs mt-0.5 ${muted}`}>Waste collected this week</p>
          <p className="text-xs text-[#3B82F6] mt-1 font-medium">≈ {co2Saved} kg CO₂ prevented</p>
        </motion.div>
      </motion.div>

      {/* Stats — metric pills */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-4 gap-2 mb-8">
        {[
          { label: 'In Progress', value: inProgressPickups, color: '#F59E0B', bg: 'border-amber-500/20 bg-amber-500/8' },
          { label: 'Pending', value: pendingPickups, color: '#6B7280', bg: 'border-zinc-500/20 bg-zinc-500/8' },
          { label: 'Urgent', value: urgentRequests, color: '#EF4444', bg: 'border-red-500/20 bg-red-500/8' },
          { label: 'Routes', value: ROUTES.length, color: '#A855F7', bg: 'border-purple-500/20 bg-purple-500/8' },
        ].map(({ label, value, color, bg }) => (
          <motion.div key={label} variants={fadeUp} className={`rounded-xl p-3 border ${bg} text-center`}>
            <p className="text-xl font-bold" style={{ color }}><AnimatedCounter to={value} duration={600} /></p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Pickups + Routes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Pickups */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs uppercase tracking-widest font-medium ${muted}`}>Assigned Pickups</p>
              <div className="flex items-center gap-1.5">
                <Filter className={`w-3.5 h-3.5 ${muted}`} />
                <select
                  value={pickupFilter}
                  onChange={(e) => setPickupFilter(e.target.value as typeof pickupFilter)}
                  className={`text-xs font-medium rounded-lg px-2 py-1 border outline-none transition-all ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-300' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              {filteredPickups.map((pickup) => {
                const cfg = STATUS_CONFIG[pickup.status];
                return (
                  <motion.button
                    key={pickup.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPickup(pickup)}
                    className={`w-full border rounded-xl overflow-hidden transition-all duration-200 text-left hover:scale-[1.005] ${card}`}
                  >
                    <div className="flex">
                      <div className="w-[3px] self-stretch flex-shrink-0 rounded-l-xl" style={{ backgroundColor: pickup.binColorHex }} />
                      <div className="flex-1 px-4 py-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold ${text} truncate`}>{pickup.citizen}</p>
                              <p className={`text-xs ${muted} truncate`}>{pickup.address}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                            <span className={`text-xs ${muted}`}>{pickup.scheduledTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: pickup.binColorHex + '18', color: pickup.binColorHex }}>
                              {pickup.wasteType}
                            </span>
                            <span className={`text-xs ${muted}`}>{pickup.weight}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${muted}`} />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Routes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${muted}`}>Today's Routes</p>
            <div className="space-y-2">
              {ROUTES.map((route: RouteUI) => {
                const cfg = ROUTE_STATUS[route.status];
                const progress = Math.round((route.completed / route.stops) * 100);
                return (
                  <motion.button
                    key={route.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full border rounded-xl px-4 py-4 transition-all duration-200 text-left hover:scale-[1.005] ${card}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{route.name}</p>
                        <p className={`text-xs ${muted}`}>{route.ward} · {route.distance} · {route.estimatedTime}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                        <div
                          className="h-1.5 rounded-full bg-[#22C55E] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${muted}`}>{route.completed}/{route.stops}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right — Requests + Performance */}
        <div className="space-y-6">
          {/* Citizen Requests */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs uppercase tracking-widest font-medium ${muted}`}>Citizen Requests</p>
              <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{urgentRequests} urgent</span>
            </div>
            <div className="space-y-2">
              {requests.map((req: RequestUI) => {
                const ucfg = URGENCY_CONFIG[req.urgency];
                return (
                  <motion.button
                    key={req.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full border rounded-xl px-4 py-3.5 transition-all duration-200 text-left hover:scale-[1.005] ${card}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${text} truncate`}>{req.citizen}</p>
                        <p className={`text-xs ${muted} truncate`}>{req.wasteType}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${ucfg.bg}`}>{ucfg.label}</span>
                    </div>
                    <p className={`text-xs mt-1.5 ${muted} truncate`}>{req.address}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${muted}`}>{req.submittedAt}</span>
                      {req.imageAvailable && <span className="text-xs text-[#22C55E]">📷 Photo</span>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Performance Summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${muted}`}>This Week</p>
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="space-y-4">
                {[
                  { icon: Recycle, label: 'Pickups Done', value: weeklyPickupsDone, total: SESSION_BASE_TOTAL, color: '#22C55E' },
                  { icon: Package, label: 'Kg Collected', value: Math.round(weeklyKgCollected), total: 150, color: '#3B82F6' },
                  { icon: TrendingUp, label: 'Efficiency', value: 92, total: 100, color: '#06B6D4', suffix: '%' },
                  { icon: Flame, label: 'Streak', value: 7, total: 7, color: '#F59E0B', suffix: ' days' },
                  { icon: Star, label: 'Citizen Rating', value: 4.8, total: 5, color: '#A855F7', suffix: '/5' },
                ].map(({ icon: Icon, label, value, total, color, suffix }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <p className={`text-xs font-medium ${text}`}>{label}</p>
                      </div>
                      <p className="text-xs font-bold" style={{ color }}>{value}{suffix ?? ''}</p>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / total) * 100}%` }}
                        transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <PickupDialog pickup={selectedPickup} onClose={() => setSelectedPickup(null)} onStatusChange={handlePickupStatusChange} isDark={isDark} />
      <RouteDialog route={selectedRoute} onClose={() => setSelectedRoute(null)} isDark={isDark} />
      <RequestDialog request={selectedRequest} onClose={() => setSelectedRequest(null)} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} isDark={isDark} />
    </div>
  );
}
