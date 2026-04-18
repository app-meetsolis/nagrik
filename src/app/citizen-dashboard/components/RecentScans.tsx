'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Recycle, AlertTriangle } from 'lucide-react';
import { ScanRecord, getTimeAgo } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';

interface RecentScansProps {
  scans: ScanRecord[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

const BIN_ICONS: Record<string, string> = {
  green: '🟢',
  blue: '🔵',
  red: '🔴',
  grey: '⚫',
};

export default function RecentScans({ scans }: RecentScansProps) {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F] hover:border-[#2A2A2A]' : 'bg-white border-gray-200 hover:border-gray-300';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs uppercase tracking-widest font-medium ${muted}`}>Recent Scans</p>
        <Link href="/my-scans" className="text-xs text-[#22C55E] hover:text-[#4ADE80] transition-colors">
          View all →
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className={`border rounded-2xl p-8 text-center ${card}`}>
          <p className="text-3xl mb-3">📸</p>
          <p className={`text-sm font-semibold ${text} mb-1`}>No scans yet</p>
          <p className={`text-xs ${muted} mb-4`}>Tap the camera button to scan your first waste item</p>
          <Link
            href="/scan-flow"
            className="inline-flex items-center gap-1.5 bg-[#22C55E]/10 text-[#22C55E] text-xs font-medium px-4 py-2 rounded-full border border-[#22C55E]/20 hover:bg-[#22C55E]/20 transition-all duration-200"
          >
            Start Scanning
          </Link>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {scans.map((scan) => (
            <motion.button
              key={scan.id}
              variants={item}
              onClick={() => setSelected(scan)}
              className={`w-full border rounded-xl px-4 py-3 transition-all duration-200 text-left hover:scale-[1.01] ${card}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: scan.binColorHex }}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${text} truncate`}>{scan.wasteType}</p>
                    <p className={`text-xs ${muted}`}>{scan.binLabel}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-[#22C55E]">+{scan.points} pts</span>
                  <span className={`text-xs ${muted}`}>{getTimeAgo(scan.timestamp)}</span>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    scan.status === 'collected' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {scan.status === 'collected' ? 'Collected' : 'Pending'}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

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
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: selected.binColorHex + '20' }}
                  >
                    {BIN_ICONS[selected.binColor] ?? '🗑️'}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${text}`}>{selected.wasteType}</h2>
                    <p className={`text-sm ${muted}`}>{selected.binLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${elevated} ${muted}`}
                >
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
