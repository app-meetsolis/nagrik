'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, Star, X, Navigation, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { RecyclingCentreUI } from '@/types/actions';

const statusConfig = {
  open: { label: 'Open', color: '#22C55E', bg: 'bg-[#22C55E]/10', icon: CheckCircle },
  busy: { label: 'Busy', color: '#F59E0B', bg: 'bg-amber-500/10', icon: AlertCircle },
  closed: { label: 'Closed', color: '#EF4444', bg: 'bg-red-500/10', icon: X },
};

interface Props { centres: RecyclingCentreUI[] }

export default function MapClient({ centres }: Props) {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<RecyclingCentreUI | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'nearby'>('all');

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A]' : 'bg-gray-50';

  const filtered = centres.filter((c) => {
    if (filter === 'open') return c.status === 'open';
    if (filter === 'nearby') return parseFloat(c.distance) < 2;
    return true;
  });

  return (
    <div className="px-5 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${text}`}>Recycling Centres</h1>
            <p className={`text-xs ${muted}`}>{centres.filter(c => c.status === 'open').length} open near Jaipur</p>
          </div>
        </div>
      </motion.div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`relative h-44 rounded-2xl border overflow-hidden mb-5 ${card}`}
      >
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0F1A0F]' : 'bg-[#E8F5E9]'}`}>
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#22C55E" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {centres.slice(0, 4).map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300 }}
              onClick={() => setSelected(c)}
              className="absolute"
              style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 35}%` }}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg ${
                c.status === 'open' ? 'bg-[#22C55E] border-white' : c.status === 'busy' ? 'bg-amber-500 border-white' : 'bg-red-500 border-white'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
            </motion.button>
          ))}
        </div>
        <div className={`absolute bottom-3 left-3 right-3 flex items-center gap-2 text-xs ${muted}`}>
          <Navigation className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Tap a pin or card to view details</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="flex gap-2 mb-4">
        {(['all', 'open', 'nearby'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 capitalize border ${
              filter === f
                ? 'bg-[#22C55E] text-black border-[#22C55E]'
                : `${isDark ? 'bg-[#141414] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'} hover:border-[#22C55E]/40`
            }`}
          >
            {f === 'all' ? 'All' : f === 'open' ? '✅ Open' : '📍 Nearby'}
          </button>
        ))}
      </motion.div>

      {/* Centre Cards */}
      <div className="space-y-3">
        {filtered.map((centre, idx) => {
          const sc = statusConfig[centre.status];
          const StatusIcon = sc.icon;
          return (
            <motion.button
              key={centre.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              onClick={() => setSelected(centre)}
              className={`w-full border rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01] ${card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${text} truncate`}>{centre.name}</p>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg}`} style={{ color: sc.color }}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {sc.label}
                    </span>
                  </div>
                  <p className={`text-xs ${muted} mb-2 truncate`}>{centre.address}</p>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-xs ${muted}`}><MapPin className="w-3 h-3" />{centre.distance}</span>
                    <span className={`flex items-center gap-1 text-xs ${muted}`}><Clock className="w-3 h-3" />{centre.hours.split('–')[0].trim()}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{centre.rating}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${muted} flex-shrink-0 mt-1`} />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {centre.accepts.slice(0, 3).map((a) => (
                  <span key={a} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{a}</span>
                ))}
                {centre.accepts.length > 3 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>+{centre.accepts.length - 3}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`text-lg font-bold ${text}`}>{selected.name}</h2>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[selected.status].bg}`} style={{ color: statusConfig[selected.status].color }}>
                      {statusConfig[selected.status].label}
                    </span>
                  </div>
                  <p className={`text-sm ${muted}`}>{selected.address}</p>
                </div>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${elevated} ${muted} flex-shrink-0`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-sm ${muted} mb-4 leading-relaxed`}>{selected.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: Clock, label: 'Hours', value: selected.hours },
                  { icon: Phone, label: 'Phone', value: selected.phone },
                  { icon: MapPin, label: 'Distance', value: selected.distance },
                  { icon: Star, label: 'Rating', value: `${selected.rating} / 5.0` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className={`rounded-xl p-3 border ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#22C55E]" />
                      <p className={`text-xs ${muted}`}>{label}</p>
                    </div>
                    <p className={`text-sm font-semibold ${text}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className={`text-xs ${muted} mb-2`}>Accepts</p>
                <div className="flex flex-wrap gap-2">
                  {selected.accepts.map((a) => (
                    <span key={a} className="text-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 px-2.5 py-1 rounded-full font-medium">{a}</span>
                  ))}
                </div>
              </div>

              <motion.a
                href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#22C55E] text-black font-semibold rounded-xl text-sm hover:bg-[#16A34A] transition-colors duration-200"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
