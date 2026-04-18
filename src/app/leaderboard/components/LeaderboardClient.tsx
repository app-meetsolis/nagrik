'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, TrendingUp, Leaf, Scan } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { LeaderboardData, LeaderboardCitizen, LeaderboardWard } from '@/types/actions';

// Fallback mock data if DB returns nothing
const MOCK_CITIZENS: LeaderboardCitizen[] = [
  { rank: 1, id: '1', name: 'Priya Sharma',  ward: 'Vaishali Nagar', ecoPoints: 1240, totalScans: 124, recyclableRate: 91, badge: '🥇', streak: 21 },
  { rank: 2, id: '2', name: 'Arjun Mehta',   ward: 'Mansarovar',     ecoPoints: 1105, totalScans: 110, recyclableRate: 88, badge: '🥈', streak: 14 },
  { rank: 3, id: '3', name: 'Sunita Patel',  ward: 'Jagatpura',      ecoPoints: 980,  totalScans: 98,  recyclableRate: 85, badge: '🥉', streak: 9  },
  { rank: 4, id: '4', name: 'Rahul Gupta',   ward: 'Malviya Nagar',  ecoPoints: 870,  totalScans: 87,  recyclableRate: 82, badge: '⭐', streak: 7  },
  { rank: 5, id: '5', name: 'Kavita Singh',  ward: 'Sanganer',       ecoPoints: 760,  totalScans: 76,  recyclableRate: 79, badge: '⭐', streak: 5  },
  { rank: 6, id: '6', name: 'Janvi',         ward: 'Mansarovar',     ecoPoints: 470,  totalScans: 47,  recyclableRate: 75, badge: '🌱', streak: 3  },
  { rank: 7, id: '7', name: 'Deepak Joshi',  ward: 'Pratap Nagar',   ecoPoints: 420,  totalScans: 42,  recyclableRate: 71, badge: '🌱', streak: 2  },
  { rank: 8, id: '8', name: 'Meena Kumari',  ward: 'Sodala',         ecoPoints: 380,  totalScans: 38,  recyclableRate: 68, badge: '🌱', streak: 1  },
  { rank: 9, id: '9', name: 'Vikram Rao',    ward: 'Shyam Nagar',    ecoPoints: 310,  totalScans: 31,  recyclableRate: 65, badge: '🌱', streak: 0  },
  { rank: 10,id:'10', name: 'Anita Verma',   ward: 'Bani Park',      ecoPoints: 270,  totalScans: 27,  recyclableRate: 62, badge: '🌱', streak: 0  },
];

const MOCK_WARDS: LeaderboardWard[] = [
  { rank: 1, id: 'w1', name: 'Vaishali Nagar', zone: 'West',      totalPoints: 184, activeCitizens: 142, avgScans: 9.2, recyclingRate: 89 },
  { rank: 2, id: 'w2', name: 'Mansarovar',     zone: 'West',      totalPoints: 162, activeCitizens: 128, avgScans: 8.7, recyclingRate: 86 },
  { rank: 3, id: 'w3', name: 'Jagatpura',      zone: 'South',     totalPoints: 148, activeCitizens: 115, avgScans: 8.1, recyclingRate: 83 },
  { rank: 4, id: 'w4', name: 'Malviya Nagar',  zone: 'South',     totalPoints: 131, activeCitizens: 108, avgScans: 7.6, recyclingRate: 80 },
  { rank: 5, id: 'w5', name: 'Sanganer',       zone: 'South-West',totalPoints: 115, activeCitizens: 97,  avgScans: 7.1, recyclingRate: 77 },
  { rank: 6, id: 'w6', name: 'Pratap Nagar',   zone: 'North',     totalPoints: 98,  activeCitizens: 84,  avgScans: 6.5, recyclingRate: 74 },
  { rank: 7, id: 'w7', name: 'Sodala',         zone: 'East',      totalPoints: 84,  activeCitizens: 76,  avgScans: 6.0, recyclingRate: 71 },
  { rank: 8, id: 'w8', name: 'Shyam Nagar',    zone: 'North-East',totalPoints: 72,  activeCitizens: 68,  avgScans: 5.5, recyclingRate: 68 },
];

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface Props { data: LeaderboardData | null }

export default function LeaderboardClient({ data }: Props) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<'citizens' | 'wards'>('citizens');
  const [selectedCitizen, setSelectedCitizen] = useState<LeaderboardCitizen | null>(null);
  const [selectedWard, setSelectedWard] = useState<LeaderboardWard | null>(null);

  const CITIZENS = (data?.citizens?.length ?? 0) > 0 ? data!.citizens : MOCK_CITIZENS;
  const WARDS    = (data?.wards?.length ?? 0) > 0    ? data!.wards    : MOCK_WARDS;

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const elevated = isDark ? 'bg-[#1A1A1A]' : 'bg-gray-50';

  return (
    <div className="px-5 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${text}`}>Leaderboard</h1>
            <p className={`text-xs ${muted}`}>April 2026 · Jaipur</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className={`flex rounded-xl p-1 mb-5 ${isDark ? 'bg-[#141414] border border-[#1F1F1F]' : 'bg-gray-100'}`}
      >
        {(['citizens', 'wards'] as const).map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
              tab === t ? 'bg-[#22C55E] text-black shadow-sm' : muted
            }`}
          >
            {t === 'citizens' ? '👤 Citizens' : '🏘️ Wards'}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'citizens' && (
          <motion.div
            key="podium"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
            className="flex items-end justify-center gap-3 mb-5"
          >
            {[CITIZENS[1], CITIZENS[0], CITIZENS[2]].filter(Boolean).map((c, i) => {
              const heights = ['h-20', 'h-28', 'h-16'];
              const sizes = ['w-14', 'w-16', 'w-14'];
              const delays = [0.15, 0.05, 0.25];
              return (
                <motion.button
                  key={c.rank}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delays[i], duration: 0.4, type: 'spring', stiffness: 200 }}
                  onClick={() => setSelectedCitizen(c)}
                  className={`flex flex-col items-center gap-1.5 ${sizes[i]}`}
                >
                  <span className="text-2xl">{c.badge}</span>
                  <div
                    className={`w-full ${heights[i]} rounded-t-xl flex flex-col items-center justify-end pb-2 border transition-all duration-200 hover:scale-105 ${card}`}
                    style={{ borderColor: rankColors[c.rank - 1] + '40', background: isDark ? `${rankColors[c.rank - 1]}10` : `${rankColors[c.rank - 1]}15` }}
                  >
                    <p className={`text-xs font-bold ${text} text-center leading-tight px-1`}>{c.name.split(' ')[0]}</p>
                    <p className="text-xs text-[#22C55E] font-semibold">{c.ecoPoints}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'citizens' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {tab === 'citizens'
            ? CITIZENS.map((c, idx) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                onClick={() => setSelectedCitizen(c)}
                className={`w-full border rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] text-left ${card}`}
              >
                <span className="text-lg w-6 text-center">{c.badge}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${text} truncate`}>{c.name}</p>
                  <p className={`text-xs ${muted}`}>{c.ward}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#22C55E]">{c.ecoPoints}</p>
                  <p className={`text-xs ${muted}`}>pts</p>
                </div>
              </motion.button>
            ))
            : WARDS.map((w, idx) => (
              <motion.button
                key={w.id}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                onClick={() => setSelectedWard(w)}
                className={`w-full border rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] text-left ${card}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${elevated}`} style={{ color: w.rank <= 3 ? rankColors[w.rank - 1] : undefined }}>
                  {w.rank <= 3 ? ['🥇', '🥈', '🥉'][w.rank - 1] : `#${w.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${text} truncate`}>{w.name}</p>
                  <p className={`text-xs ${muted}`}>{w.zone} Zone · {w.activeCitizens} citizens</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#22C55E]">{w.totalPoints}</p>
                  <p className={`text-xs ${muted}`}>pts</p>
                </div>
              </motion.button>
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Citizen Detail Modal */}
      <AnimatePresence>
        {selectedCitizen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={() => setSelectedCitizen(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCitizen.badge}</span>
                  <div>
                    <h2 className={`text-lg font-bold ${text}`}>{selectedCitizen.name}</h2>
                    <p className={`text-sm ${muted}`}>{selectedCitizen.ward} · Rank #{selectedCitizen.rank}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCitizen(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${elevated} ${muted}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: Star,      label: 'Eco Points',  value: selectedCitizen.ecoPoints,      color: '#22C55E', suffix: '' },
                  { icon: Scan,      label: 'Total Scans', value: selectedCitizen.totalScans,     color: '#3B82F6', suffix: '' },
                  { icon: Leaf,      label: 'Recyclable',  value: selectedCitizen.recyclableRate, color: '#10B981', suffix: '%' },
                  { icon: TrendingUp,label: 'Day Streak',  value: selectedCitizen.streak,         color: '#F59E0B', suffix: 'd' },
                ].map(({ icon: Icon, label, value, color, suffix }) => (
                  <div key={label} className={`rounded-xl p-3 border ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                      <p className={`text-xs ${muted}`}>{label}</p>
                    </div>
                    <p className="text-xl font-bold" style={{ color }}>
                      <AnimatedCounter to={value} duration={600} suffix={suffix} />
                    </p>
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-3 border ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-xs ${muted} mb-2`}>Recyclable Rate Progress</p>
                <div className={`h-2 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedCitizen.recyclableRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-[#22C55E]"
                  />
                </div>
                <p className={`text-xs ${muted} mt-1 text-right`}>{selectedCitizen.recyclableRate}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ward Detail Modal */}
      <AnimatePresence>
        {selectedWard && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={() => setSelectedWard(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedWard.rank <= 3 ? ['🥇', '🥈', '🥉'][selectedWard.rank - 1] : `#${selectedWard.rank}`}</span>
                    <h2 className={`text-lg font-bold ${text}`}>{selectedWard.name}</h2>
                  </div>
                  <p className={`text-sm ${muted}`}>{selectedWard.zone} Zone</p>
                </div>
                <button onClick={() => setSelectedWard(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${elevated} ${muted}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Points',        value: selectedWard.totalPoints,    suffix: '', color: '#22C55E' },
                  { label: 'Active Citizens',      value: selectedWard.activeCitizens, suffix: '', color: '#3B82F6' },
                  { label: 'Avg Scans/Citizen',    value: selectedWard.avgScans,       suffix: '', color: '#F59E0B' },
                  { label: 'Recyclable Rate',      value: selectedWard.recyclingRate,  suffix: '%',color: '#10B981' },
                ].map(({ label, value, suffix, color }) => (
                  <div key={label} className={`rounded-xl p-3 border ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-xs ${muted} mb-1`}>{label}</p>
                    <p className="text-xl font-bold" style={{ color }}>
                      <AnimatedCounter to={value} duration={700} suffix={suffix} />
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
