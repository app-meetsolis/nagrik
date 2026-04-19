'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ChevronRight, Navigation, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData, RouteUI } from '@/types/actions';

const FALLBACK: RouteUI[] = [
  {
    id: 'r1', name: 'Mansarovar Zone A', ward: 'Mansarovar', stops: 8, completed: 5,
    distance: '6.2 km', estimatedTime: '1h 20m', status: 'active',
    stops_list: [
      { address: '12, Shanti Nagar, Mansarovar, Jaipur', status: 'done' },
      { address: '34, Ram Nagar, Mansarovar, Jaipur', status: 'done' },
      { address: '56, Patel Marg, Mansarovar, Jaipur', status: 'done' },
      { address: '78, Nehru Colony, Mansarovar, Jaipur', status: 'done' },
      { address: '90, Vikas Marg, Mansarovar, Jaipur', status: 'done' },
      { address: '102, Indira Nagar, Mansarovar, Jaipur', status: 'current' },
      { address: '114, Gandhi Path, Mansarovar, Jaipur', status: 'pending' },
      { address: '126, Subhash Nagar, Mansarovar, Jaipur', status: 'pending' },
    ],
  },
  {
    id: 'r2', name: 'Vaishali Nagar Zone B', ward: 'Vaishali Nagar', stops: 6, completed: 0,
    distance: '4.8 km', estimatedTime: '1h 05m', status: 'pending',
    stops_list: [
      { address: '45, Vikas Path, Vaishali Nagar, Jaipur', status: 'pending' },
      { address: '67, Shyam Nagar, Vaishali Nagar, Jaipur', status: 'pending' },
      { address: '89, Laxmi Colony, Vaishali Nagar, Jaipur', status: 'pending' },
      { address: '11, Durga Marg, Vaishali Nagar, Jaipur', status: 'pending' },
      { address: '33, Saraswati Nagar, Vaishali Nagar, Jaipur', status: 'pending' },
      { address: '55, Hanuman Path, Vaishali Nagar, Jaipur', status: 'pending' },
    ],
  },
  {
    id: 'r3', name: 'Sanganer Zone C', ward: 'Sanganer', stops: 5, completed: 5,
    distance: '3.5 km', estimatedTime: '45m', status: 'done',
    stops_list: [
      { address: '23, Gandhi Nagar, Sanganer, Jaipur', status: 'done' },
      { address: '56, Pratap Nagar, Sanganer, Jaipur', status: 'done' },
      { address: '78, Nehru Marg, Sanganer, Jaipur', status: 'done' },
      { address: '90, Azad Colony, Sanganer, Jaipur', status: 'done' },
      { address: '12, Bhagat Singh Path, Sanganer, Jaipur', status: 'done' },
    ],
  },
  {
    id: 'r4', name: 'Jhotwara Zone D', ward: 'Jhotwara', stops: 7, completed: 2,
    distance: '5.1 km', estimatedTime: '1h 10m', status: 'pending',
    stops_list: [
      { address: '33, Tilak Nagar, Jhotwara, Jaipur', status: 'done' },
      { address: '55, Rajiv Nagar, Jhotwara, Jaipur', status: 'done' },
      { address: '77, Hari Nagar, Jhotwara, Jaipur', status: 'pending' },
      { address: '99, Shiv Colony, Jhotwara, Jaipur', status: 'pending' },
      { address: '11, Lal Path, Jhotwara, Jaipur', status: 'pending' },
      { address: '22, Mohan Nagar, Jhotwara, Jaipur', status: 'pending' },
      { address: '44, Sukh Nagar, Jhotwara, Jaipur', status: 'pending' },
    ],
  },
];

const ROUTE_STATUS = {
  active:  { label: 'Active',  bg: 'bg-amber-500/10 text-amber-400',   border: 'border-amber-500/20' },
  pending: { label: 'Pending', bg: 'bg-zinc-500/10 text-zinc-400',     border: 'border-zinc-500/20' },
  done:    { label: 'Done',    bg: 'bg-[#22C55E]/10 text-[#22C55E]',   border: 'border-[#22C55E]/20' },
};

const ROUTE_ACCENT = {
  active:  '#F59E0B',
  pending: '#6B7280',
  done:    '#22C55E',
};

function openGoogleMaps(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
}

interface Props { data: CollectorDashboardData | null }

export default function RoutesClient({ data }: Props) {
  const { isDark } = useTheme();
  const routes = data?.routes?.length ? data.routes : FALLBACK;
  const [selected, setSelected] = useState<RouteUI | null>(null);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  const totalStops    = routes.reduce((s, r) => s + r.stops, 0);
  const doneStops     = routes.reduce((s, r) => s + r.completed, 0);
  const totalDistance = routes.reduce((s, r) => s + parseFloat(r.distance), 0).toFixed(1);
  const activeCount   = routes.filter(r => r.status === 'active').length;
  const doneCount     = routes.filter(r => r.status === 'done').length;

  const currentStop = (route: RouteUI) => route.stops_list.find(s => s.status === 'current' || s.status === 'pending');

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

      {/* Hero stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl p-4 border border-[#22C55E]/25 bg-[#22C55E]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
            <span className="text-xs text-[#22C55E] font-semibold">{totalStops ? Math.round((doneStops / totalStops) * 100) : 0}%</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>
            <AnimatedCounter to={doneStops} duration={700} />
            <span className="text-zinc-500 text-xl font-normal">/{totalStops}</span>
          </p>
          <p className={`text-xs mt-0.5 ${muted}`}>Stops completed today</p>
          <div className="mt-2 h-1.5 rounded-full bg-[#22C55E]/15">
            <motion.div initial={{ width: 0 }} animate={{ width: `${totalStops ? (doneStops / totalStops) * 100 : 0}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} className="h-1.5 rounded-full bg-[#22C55E]" />
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-[#3B82F6]/25 bg-[#3B82F6]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <span className="text-xs text-[#3B82F6] font-semibold">today</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>{totalDistance}<span className="text-zinc-500 text-base font-normal"> km</span></p>
          <p className={`text-xs mt-0.5 ${muted}`}>Total route distance</p>
          <p className="text-xs text-[#3B82F6] mt-1 font-medium">{routes.length} zones assigned</p>
        </div>
      </motion.div>

      {/* Metric pills */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Active',  value: activeCount,       color: '#F59E0B', bg: 'border-amber-500/20 bg-amber-500/8' },
          { label: 'Done',    value: doneCount,         color: '#22C55E', bg: 'border-[#22C55E]/20 bg-[#22C55E]/8' },
          { label: 'Pending', value: routes.length - activeCount - doneCount, color: '#6B7280', bg: 'border-zinc-500/20 bg-zinc-500/8' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-3 border ${bg} text-center`}>
            <p className="text-xl font-bold" style={{ color }}><AnimatedCounter to={value} duration={600} /></p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Route cards */}
      <div className="space-y-3">
        {routes.map((route, idx) => {
          const cfg = ROUTE_STATUS[route.status];
          const accent = ROUTE_ACCENT[route.status];
          const progress = route.stops > 0 ? Math.round((route.completed / route.stops) * 100) : 0;
          const next = currentStop(route);
          return (
            <motion.button
              key={route.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              onClick={() => setSelected(route)}
              className={`w-full border rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] ${card}`}
            >
              <div className="flex">
                <div className="w-[3px] self-stretch flex-shrink-0" style={{ backgroundColor: accent }} />
                <div className="flex-1 p-4">
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
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: accent }} />
                    </div>
                    <span className={`text-xs font-medium ${muted}`}>{route.completed}/{route.stops}</span>
                  </div>
                  {next && route.status !== 'done' && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
                      <p className="text-xs truncate" style={{ color: accent }}>Next: {next.address.split(',')[0]}</p>
                    </div>
                  )}
                </div>
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
                    { label: 'Stops',     value: `${selected.completed}/${selected.stops}` },
                    { label: 'Distance',  value: selected.distance },
                    { label: 'Est. Time', value: selected.estimatedTime },
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

                {/* Navigate to current/next stop */}
                {(() => {
                  const next = currentStop(selected);
                  return next && selected.status !== 'done' ? (
                    <button
                      onClick={() => openGoogleMaps(next.address)}
                      className="w-full mb-4 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-11 text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate to Next Stop
                    </button>
                  ) : null;
                })()}

                <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${muted}`}>Stops</p>
                <div className="space-y-2">
                  {selected.stops_list.map((stop, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${elevated}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        stop.status === 'done'    ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                        stop.status === 'current' ? 'bg-amber-500/20 text-amber-400' :
                        isDark ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {stop.status === 'done' ? '✓' : stop.status === 'current' ? '→' : i + 1}
                      </div>
                      <p className={`text-sm flex-1 ${stop.status === 'done' ? muted + ' line-through' : text}`}>{stop.address.split(',')[0]}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {stop.status === 'current' && <span className="text-xs text-amber-400 font-medium">Current</span>}
                        {(stop.status === 'current' || stop.status === 'pending') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openGoogleMaps(stop.address); }}
                            className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center hover:bg-[#3B82F6]/20 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#3B82F6]" />
                          </button>
                        )}
                      </div>
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
