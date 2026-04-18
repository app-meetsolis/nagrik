'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Filter, X, Recycle, AlertTriangle, Clock, Star, ChevronDown } from 'lucide-react';
import { getTimeAgo, MOCK_SCANS } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { ScanRowUI } from '@/types/actions';

type FilterType = 'all' | 'recyclable' | 'non-recyclable' | 'pending' | 'collected';

const BIN_ICONS: Record<string, string> = { green: '🟢', blue: '🔵', red: '🔴', grey: '⚫' };

interface Props { initialScans: ScanRowUI[] }

export default function MyScansClient({ initialScans }: Props) {
  const { isDark } = useTheme();
  const scans = initialScans.length > 0 ? initialScans : MOCK_SCANS.map(s => ({
    id: s.id, wasteType: s.wasteType, binColor: s.binColor, binColorHex: s.binColorHex,
    binLabel: s.binLabel, recyclable: s.recyclable, points: s.points,
    status: s.status, ward: s.ward, timestamp: s.timestamp,
  }));

  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<ScanRowUI | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  const filtered = scans.filter((s) => {
    if (filter === 'recyclable')     return s.recyclable;
    if (filter === 'non-recyclable') return !s.recyclable;
    if (filter === 'pending')        return s.status === 'pending';
    if (filter === 'collected')      return s.status === 'collected';
    return true;
  });

  const totalPoints = scans.reduce((sum, s) => sum + s.points, 0);
  const recyclableCount = scans.filter((s) => s.recyclable).length;
  const pendingCount = scans.filter((s) => s.status === 'pending').length;

  const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Scans' },
    { value: 'recyclable', label: '♻️ Recyclable' },
    { value: 'non-recyclable', label: '🚫 Non-Recyclable' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'collected', label: '✅ Collected' },
  ];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${text}`}>My Scans</h1>
            <p className={`text-xs ${muted}`}>{scans.length} total scans</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            filter !== 'all'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              : isDark ? 'bg-[#141414] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        {[
          { label: 'Total Points', value: totalPoints, color: '#22C55E', icon: Star },
          { label: 'Recyclable', value: recyclableCount, color: '#3B82F6', icon: Recycle },
          { label: 'Pending', value: pendingCount, color: '#F59E0B', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`border rounded-xl p-3 ${card}`}>
            <Icon className="w-4 h-4 mb-1.5" style={{ color }} />
            <p className="text-lg font-bold" style={{ color }}>
              <AnimatedCounter to={value} duration={600} />
            </p>
            <p className={`text-[10px] ${muted} mt-0.5`}>{label}</p>
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className={`border rounded-xl p-2 ${card}`}>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter(opt.value); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    filter === opt.value ? 'bg-[#22C55E]/10 text-[#22C55E]' : text
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`border rounded-2xl p-8 text-center ${card}`}>
          <p className="text-3xl mb-3">📭</p>
          <p className={`text-sm font-semibold ${text} mb-1`}>No scans found</p>
          <p className={`text-xs ${muted}`}>Try a different filter</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-2">
          {filtered.map((scan, idx) => (
            <motion.button
              key={scan.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              onClick={() => setSelected(scan)}
              className={`w-full border rounded-xl px-4 py-3 text-left transition-all duration-200 hover:scale-[1.01] ${card}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: scan.binColorHex }} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${text} truncate`}>{scan.wasteType}</p>
                    <p className={`text-xs ${muted}`}>{scan.binLabel} · {getTimeAgo(scan.timestamp)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-[#22C55E]">+{scan.points}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    scan.status === 'collected' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {scan.status === 'collected' ? 'Collected' : 'Pending'}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: selected.binColorHex + '20' }}>
                    {BIN_ICONS[selected.binColor] ?? '🗑️'}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${text}`}>{selected.wasteType}</h2>
                    <p className={`text-sm ${muted}`}>{selected.binLabel}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Points Earned', value: `+${selected.points}`, color: '#22C55E' },
                  { label: 'Status', value: selected.status === 'collected' ? '✅ Collected' : '⏳ Pending', color: selected.status === 'collected' ? '#22C55E' : '#F59E0B' },
                  { label: 'Ward', value: selected.ward, color: isDark ? '#FAFAFA' : '#111827' },
                  { label: 'Scanned', value: getTimeAgo(selected.timestamp), color: isDark ? '#A1A1AA' : '#6B7280' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl p-3 border ${elevated}`}>
                    <p className={`text-xs ${muted} mb-1`}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-3 border ${elevated} flex items-center gap-3`}>
                {selected.recyclable ? (
                  <>
                    <Recycle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                    <div>
                      <p className={`text-sm font-semibold ${text}`}>Recyclable Item</p>
                      <p className={`text-xs ${muted}`}>This item can be processed and reused</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className={`text-sm font-semibold ${text}`}>Non-Recyclable</p>
                      <p className={`text-xs ${muted}`}>Requires special disposal handling</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
