'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData, RouteUI } from '@/types/actions';

const FALLBACK: RouteUI[] = [
  {
    id: 'r1', name: 'Mansarovar Zone A', ward: 'Mansarovar', stops: 8, completed: 5,
    distance: '6.2 km', estimatedTime: '1h 20m', status: 'active',
    stops_list: [
      { address: '12, Shanti Nagar', status: 'done' }, { address: '34, Ram Nagar', status: 'done' },
      { address: '56, Patel Marg', status: 'done' }, { address: '78, Nehru Colony', status: 'done' },
      { address: '90, Vikas Marg', status: 'done' }, { address: '102, Indira Nagar', status: 'current' },
      { address: '114, Gandhi Path', status: 'pending' }, { address: '126, Subhash Nagar', status: 'pending' },
    ],
  },
  {
    id: 'r2', name: 'Vaishali Nagar Zone B', ward: 'Vaishali Nagar', stops: 6, completed: 0,
    distance: '4.8 km', estimatedTime: '1h 05m', status: 'pending',
    stops_list: [
      { address: '45, Vikas Path', status: 'pending' }, { address: '67, Shyam Nagar', status: 'pending' },
      { address: '89, Laxmi Colony', status: 'pending' }, { address: '11, Durga Marg', status: 'pending' },
      { address: '33, Saraswati Nagar', status: 'pending' }, { address: '55, Hanuman Path', status: 'pending' },
    ],
  },
  {
    id: 'r3', name: 'Sanganer Zone C', ward: 'Sanganer', stops: 5, completed: 5,
    distance: '3.5 km', estimatedTime: '45m', status: 'done',
    stops_list: [
      { address: '23, Gandhi Nagar', status: 'done' }, { address: '56, Pratap Nagar', status: 'done' },
      { address: '78, Nehru Marg', status: 'done' }, { address: '90, Azad Colony', status: 'done' },
      { address: '12, Bhagat Singh Path', status: 'done' },
    ],
  },
];

const ROUTE_STATUS = {
  active:  { label: 'Active',  bg: 'bg-amber-500/10 text-amber-400' },
  pending: { label: 'Pending', bg: 'bg-zinc-500/10 text-zinc-400' },
  done:    { label: 'Done',    bg: 'bg-[#22C55E]/10 text-[#22C55E]' },
};

interface Props { data: CollectorDashboardData | null }

export default function RoutesClient({ data }: Props) {
  const { isDark } = useTheme();
  const routes = data?.routes ?? FALLBACK;
  const [selected, setSelected] = useState<RouteUI | null>(null);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  const totalStops = routes.reduce((s, r) => s + r.stops, 0);
  const doneStops  = routes.reduce((s, r) => s + r.completed, 0);
  const activeCount = routes.filter(r => r.status === 'active').length;
  const doneCount   = routes.filter(r => r.status === 'done').length;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Routes</h1>
          <p className={`text-xs ${muted}`}>Today&apos;s collection routes</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Routes',  value: routes.length,  color: '#22C55E' },
          { label: 'Active',  value: activeCount,    color: '#F59E0B' },
          { label: 'Done',    value: doneCount,      color: '#22C55E' },
          { label: 'Stops ✓', value: doneStops,      color: '#3B82F6' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl p-3 ${card}`}>
            <p className="text-lg font-bold" style={{ color }}><AnimatedCounter to={value} duration={600} /></p>
            <p className={`text-[10px] ${muted} mt-0.5`}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Overall progress bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className={`border rounded-xl p-4 mb-6 ${card}`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-sm font-medium ${text}`}>Overall Progress</p>
          <p className="text-sm font-bold text-[#22C55E]">{totalStops > 0 ? Math.round((doneStops / totalStops) * 100) : 0}%</p>
        </div>
        <div className={`h-2 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalStops > 0 ? (doneStops / totalStops) * 100 : 0}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            className="h-2 rounded-full bg-[#22C55E]"
          />
        </div>
        <p className={`text-xs mt-1.5 ${muted}`}>{doneStops} of {totalStops} stops completed</p>
      </motion.div>

      {/* Route cards */}
      <div className="space-y-3">
        {routes.map((route, idx) => {
          const cfg = ROUTE_STATUS[route.status];
          const progress = route.stops > 0 ? Math.round((route.completed / route.stops) * 100) : 0;
          return (
            <motion.button
              key={route.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              onClick={() => setSelected(route)}
              className={`w-full border rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.005] ${card}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${text} truncate`}>{route.name}</p>
                  <p className={`text-xs ${muted}`}>{route.ward} · {route.distance} · {route.estimatedTime}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                  <ChevronRight className={`w-4 h-4 ${muted}`} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                  <div className="h-1.5 rounded-full bg-[#22C55E] transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <span className={`text-xs font-medium ${muted}`}>{route.completed}/{route.stops}</span>
              </div>
            </motion.button>
          );
        })}
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
              className={`w-full max-w-md rounded-2xl border overflow-hidden ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className={`text-lg font-bold ${text}`}>{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROUTE_STATUS[selected.status].bg}`}>{ROUTE_STATUS[selected.status].label}</span>
                      <span className={`text-xs ${muted}`}>{selected.ward}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Stops',    value: `${selected.completed}/${selected.stops}` },
                    { label: 'Distance', value: selected.distance },
                    { label: 'Est. Time',value: selected.estimatedTime },
                  ].map(({ label, value }) => (
                    <div key={label} className={`rounded-xl p-3 border text-center ${elevated}`}>
                      <p className={`text-base font-bold ${text}`}>{value}</p>
                      <p className={`text-xs mt-0.5 ${muted}`}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className={`rounded-xl p-4 border ${elevated} mb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${text}`}>Progress</p>
                    <p className="text-sm font-bold text-[#22C55E]">
                      {selected.stops > 0 ? Math.round((selected.completed / selected.stops) * 100) : 0}%
                    </p>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.stops > 0 ? (selected.completed / selected.stops) * 100 : 0}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-2 rounded-full bg-[#22C55E]"
                    />
                  </div>
                </div>

                <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${muted}`}>Stops</p>
                <div className="space-y-2">
                  {selected.stops_list.map((stop, i) => (
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
