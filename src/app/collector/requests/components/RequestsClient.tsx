'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, X, MapPin, User, Phone, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData, RequestUI } from '@/types/actions';

const FALLBACK: RequestUI[] = [
  { id: 'req1', citizen: 'Amit Gupta',    phone: '9871234560', address: '33, Tilak Nagar, Jhotwara, Jaipur',          ward: 'Jhotwara',         wasteType: 'Bulk Waste',          urgency: 'high',   submittedAt: '2h ago', description: 'Large furniture items blocking pathway. Urgent removal needed.',       imageAvailable: true  },
  { id: 'req2', citizen: 'Kavita Meena',  phone: '9765123456', address: '78, Shastri Nagar, Murlipura, Jaipur',       ward: 'Murlipura',        wasteType: 'Construction Debris', urgency: 'medium', submittedAt: '5h ago', description: 'Renovation waste — bricks and cement bags from recent remodelling.',  imageAvailable: false },
  { id: 'req3', citizen: 'Deepak Sharma', phone: '9654012345', address: '15, Vidhyadhar Nagar, Jaipur',                ward: 'Vidhyadhar Nagar', wasteType: 'Medical Waste',       urgency: 'high',   submittedAt: '1h ago', description: 'Used syringes and medical packaging. Needs safe disposal.',          imageAvailable: true  },
  { id: 'req4', citizen: 'Neha Agarwal',  phone: '9543901234', address: '62, Bani Park, Jaipur',                      ward: 'Bani Park',        wasteType: 'Garden Waste',        urgency: 'low',    submittedAt: '1d ago', description: 'Tree branches and dry leaves from garden pruning.',                  imageAvailable: false },
  { id: 'req5', citizen: 'Suresh Yadav',  phone: '9432012345', address: '19, Malviya Nagar, Jaipur',                  ward: 'Malviya Nagar',    wasteType: 'E-Waste',             urgency: 'medium', submittedAt: '3h ago', description: 'Old TV and computer parts from office renovation.',                  imageAvailable: true  },
];

const URGENCY = {
  high:   { label: 'Urgent', bg: 'bg-red-500/10 text-red-400 border-red-500/20',       accent: '#EF4444' },
  medium: { label: 'Medium', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', accent: '#F59E0B' },
  low:    { label: 'Low',    bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',    accent: '#6B7280' },
};

type UrgencyFilter = 'all' | 'high' | 'medium' | 'low';

function openGoogleMaps(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
}

interface Props { data: CollectorDashboardData | null }

export default function RequestsClient({ data }: Props) {
  const { isDark } = useTheme();
  const [requests, setRequests] = useState<RequestUI[]>(data?.requests?.length ? data.requests : FALLBACK);
  const [filter, setFilter]   = useState<UrgencyFilter>('all');
  const [selected, setSelected] = useState<RequestUI | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  const urgentCount = requests.filter(r => r.urgency === 'high').length;
  const mediumCount = requests.filter(r => r.urgency === 'medium').length;
  const lowCount    = requests.filter(r => r.urgency === 'low').length;

  const filtered = filter === 'all' ? requests : requests.filter(r => r.urgency === filter);

  const handleAccept = (id: string) => {
    setAccepted(prev => [...prev, id]);
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== id));
      setAccepted(prev => prev.filter(x => x !== id));
    }, 600);
    setSelected(null);
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Citizen Requests</h1>
          <p className={`text-xs ${muted}`}>{requests.length} open request{requests.length !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {/* Hero stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl p-4 border border-red-500/25 bg-red-500/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-xs text-red-400 font-semibold">priority</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}><AnimatedCounter to={urgentCount} duration={700} /></p>
          <p className={`text-xs mt-0.5 ${muted}`}>Urgent requests</p>
          <p className="text-xs text-red-400 mt-1 font-medium">Needs immediate action</p>
        </div>

        <div className="rounded-2xl p-4 border border-[#22C55E]/25 bg-[#22C55E]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <span className="text-xs text-[#22C55E] font-semibold">today</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>12</p>
          <p className={`text-xs mt-0.5 ${muted}`}>Resolved today</p>
          <p className="text-xs text-[#22C55E] mt-1 font-medium">↑ 3 more than yesterday</p>
        </div>
      </motion.div>

      {/* Metric pills */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Urgent', value: urgentCount, color: '#EF4444', bg: 'border-red-500/20 bg-red-500/8' },
          { label: 'Medium', value: mediumCount, color: '#F59E0B', bg: 'border-amber-500/20 bg-amber-500/8' },
          { label: 'Low',    value: lowCount,    color: '#6B7280', bg: 'border-zinc-500/20 bg-zinc-500/8' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-3 border ${bg} text-center`}>
            <p className="text-xl font-bold" style={{ color }}><AnimatedCounter to={value} duration={600} /></p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'high', 'medium', 'low'] as UrgencyFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              filter === f
                ? 'bg-[#22C55E] text-black border-[#22C55E]'
                : `${isDark ? 'bg-[#141414] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'} hover:border-[#22C55E]/40`
            }`}
          >
            {f === 'all' ? 'All' : f === 'high' ? '🔴 Urgent' : f === 'medium' ? '🟡 Medium' : '⚪ Low'}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-2">
        {filtered.map((req, idx) => {
          const ucfg = URGENCY[req.urgency];
          const isAccepted = accepted.includes(req.id);
          return (
            <motion.button
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isAccepted ? 0 : 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              onClick={() => setSelected(req)}
              className={`w-full border rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] ${card}`}
            >
              <div className="flex">
                <div className="w-[3px] self-stretch flex-shrink-0" style={{ backgroundColor: ucfg.accent }} />
                <div className="flex-1 px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${text} truncate`}>{req.citizen}</p>
                      <p className={`text-xs ${muted}`}>{req.wasteType}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${ucfg.bg}`}>{ucfg.label}</span>
                  </div>
                  <p className={`text-xs ${muted} mb-2 truncate`}>{req.address}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${muted}`}>{req.submittedAt}</span>
                    {req.imageAvailable && <span className="text-xs text-[#22C55E]">📷 Photo</span>}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className={`border rounded-2xl p-10 text-center ${card}`}>
            <p className="text-3xl mb-3">✅</p>
            <p className={`text-sm font-semibold ${text} mb-1`}>All clear!</p>
            <p className={`text-xs ${muted}`}>No requests in this category</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 lg:pb-0"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className={`text-lg font-bold ${text}`}>{selected.wasteType}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${URGENCY[selected.urgency].bg}`}>{URGENCY[selected.urgency].label}</span>
                    <span className={`text-xs ${muted}`}>{selected.submittedAt}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: User,  label: 'Citizen', value: selected.citizen },
                  { icon: Phone, label: 'Phone',   value: selected.phone || '—' },
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
                <p className={`text-sm font-semibold ${text}`}>{selected.address}</p>
                <p className={`text-xs mt-0.5 ${muted}`}>Ward: {selected.ward}</p>
              </div>

              <div className={`rounded-xl p-3 border ${elevated} mb-4`}>
                <p className={`text-xs ${muted} mb-1`}>Description</p>
                <p className={`text-sm ${text}`}>{selected.description}</p>
              </div>

              {selected.imageAvailable && (
                <div className="rounded-xl p-3 border border-[#22C55E]/20 bg-[#22C55E]/5 mb-4 flex items-center gap-2">
                  <span className="text-sm">📷</span>
                  <p className="text-sm text-[#22C55E] font-medium">Photo attached by citizen</p>
                </div>
              )}

              {/* Navigate button */}
              <button
                onClick={() => openGoogleMaps(selected.address)}
                className={`w-full mb-3 border rounded-xl h-10 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${isDark ? 'border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
              >
                <Navigation className="w-4 h-4" /> Navigate to Location
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(selected.id)}
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-11 text-sm transition-all duration-200"
                >
                  Accept Request
                </button>
                <button
                  onClick={() => handleDecline(selected.id)}
                  className={`flex-1 border rounded-xl h-11 text-sm font-semibold transition-all duration-200 ${isDark ? 'border-[#2A2A2A] text-zinc-300 hover:bg-[#1A1A1A]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  Decline
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
