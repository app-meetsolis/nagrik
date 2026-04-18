'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle2, Clock, AlertTriangle, MapPin, Package, X, ChevronRight, User, Phone, Navigation } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData, PickupUI } from '@/types/actions';

const FALLBACK: PickupUI[] = [
  { id: 'p1', citizen: 'Janvi Sharma', phone: '9876543210', address: '12, Shanti Nagar, Mansarovar', ward: 'Mansarovar', wasteType: 'Wet Organic', binColor: 'green', binColorHex: '#22C55E', status: 'in-progress', scheduledTime: '09:00 AM', weight: '4.2 kg', notes: 'Large bag near gate' },
  { id: 'p2', citizen: 'Rahul Verma', phone: '9123456789', address: '45, Vikas Path, Vaishali Nagar', ward: 'Vaishali Nagar', wasteType: 'Dry Plastic', binColor: 'blue', binColorHex: '#3B82F6', status: 'pending', scheduledTime: '10:30 AM', weight: '2.1 kg', notes: '' },
  { id: 'p3', citizen: 'Priya Singh', phone: '9988776655', address: '7, Lal Kothi, Civil Lines', ward: 'Civil Lines', wasteType: 'E-Waste', binColor: 'red', binColorHex: '#EF4444', status: 'pending', scheduledTime: '11:00 AM', weight: '1.5 kg', notes: 'Old electronics — handle carefully' },
  { id: 'p4', citizen: 'Mohan Das', phone: '9765432100', address: '23, Gandhi Nagar, Sanganer', ward: 'Sanganer', wasteType: 'Glass', binColor: 'blue', binColorHex: '#3B82F6', status: 'completed', scheduledTime: '08:00 AM', weight: '3.8 kg', notes: '' },
  { id: 'p5', citizen: 'Sunita Joshi', phone: '9654321098', address: '56, Pratap Nagar, Sanganer', ward: 'Sanganer', wasteType: 'Hazardous', binColor: 'red', binColorHex: '#EF4444', status: 'completed', scheduledTime: '08:30 AM', weight: '0.8 kg', notes: 'Chemical waste — use gloves' },
];

const STATUS = {
  'in-progress': { label: 'In Progress', bg: 'bg-amber-500/10 text-amber-400' },
  pending:       { label: 'Pending',     bg: 'bg-zinc-500/10 text-zinc-400' },
  completed:     { label: 'Completed',   bg: 'bg-[#22C55E]/10 text-[#22C55E]' },
};

type Filter = 'all' | 'pending' | 'in-progress' | 'completed';

interface Props { data: CollectorDashboardData | null }

export default function PickupsClient({ data }: Props) {
  const { isDark } = useTheme();
  const pickups = data?.pickups ?? FALLBACK;
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<PickupUI | null>(null);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  const total = pickups.length;
  const completed = pickups.filter(p => p.status === 'completed').length;
  const pending = pickups.filter(p => p.status === 'pending').length;
  const inProgress = pickups.filter(p => p.status === 'in-progress').length;

  const filtered = filter === 'all' ? pickups : pickups.filter(p => p.status === filter);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
          <Truck className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Pickups</h1>
          <p className={`text-xs ${muted}`}>Today&apos;s assigned collections</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: Truck,       label: 'Total',       value: total,      color: '#22C55E' },
          { icon: CheckCircle2,label: 'Completed',   value: completed,  color: '#22C55E' },
          { icon: AlertTriangle,label:'In Progress', value: inProgress, color: '#F59E0B' },
          { icon: Clock,       label: 'Pending',     value: pending,    color: '#6B7280' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`border rounded-xl p-3 ${card}`}>
            <Icon className="w-4 h-4 mb-1.5" style={{ color }} />
            <p className="text-lg font-bold" style={{ color }}><AnimatedCounter to={value} duration={600} /></p>
            <p className={`text-[10px] ${muted} mt-0.5`}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'in-progress', 'completed'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border capitalize ${
              filter === f
                ? 'bg-[#22C55E] text-black border-[#22C55E]'
                : `${isDark ? 'bg-[#141414] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'} hover:border-[#22C55E]/40`
            }`}
          >
            {f === 'in-progress' ? 'In Progress' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((p, idx) => {
          const cfg = STATUS[p.status];
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              onClick={() => setSelected(p)}
              className={`w-full border rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:scale-[1.005] ${card}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.binColorHex }} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${text} truncate`}>{p.citizen}</p>
                    <p className={`text-xs ${muted} truncate`}>{p.address}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                  <span className={`text-xs ${muted}`}>{p.scheduledTime}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-[#1A1A1A] text-zinc-400' : 'bg-gray-100 text-gray-600'}`}>{p.wasteType}</span>
                <ChevronRight className={`w-4 h-4 ${muted}`} />
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className={`border rounded-2xl p-10 text-center ${card}`}>
            <p className="text-3xl mb-3">📭</p>
            <p className={`text-sm font-semibold ${text} mb-1`}>No pickups</p>
            <p className={`text-xs ${muted}`}>Try a different filter</p>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selected.binColorHex + '20' }}>
                    <Truck className="w-5 h-5" style={{ color: selected.binColorHex }} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${text}`}>{selected.wasteType}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS[selected.status].bg}`}>{STATUS[selected.status].label}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: User,    label: 'Citizen',   value: selected.citizen },
                  { icon: Phone,   label: 'Phone',     value: selected.phone || '—' },
                  { icon: Clock,   label: 'Scheduled', value: selected.scheduledTime },
                  { icon: Package, label: 'Weight',    value: selected.weight },
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

              {selected.notes && (
                <div className="rounded-xl p-3 border border-amber-500/20 bg-amber-500/5 mb-4">
                  <p className="text-xs text-amber-400 font-medium mb-1">⚠ Notes</p>
                  <p className={`text-sm ${text}`}>{selected.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                {selected.status !== 'completed' && (
                  <button className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-11 text-sm transition-all duration-200">
                    {selected.status === 'pending' ? 'Start Pickup' : 'Mark Complete'}
                  </button>
                )}
                <button className={`flex-1 border rounded-xl h-11 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${isDark ? 'border-[#2A2A2A] text-zinc-300 hover:bg-[#1A1A1A]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  <Navigation className="w-4 h-4" /> Navigate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
