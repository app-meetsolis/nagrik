'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Recycle, TrendingUp, Flame, Star, Award, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData } from '@/types/actions';

const DAILY = [
  { day: 'Mon', pickups: 12, target: 15 },
  { day: 'Tue', pickups: 15, target: 15 },
  { day: 'Wed', pickups: 9,  target: 15 },
  { day: 'Thu', pickups: 14, target: 15 },
  { day: 'Fri', pickups: 11, target: 15 },
  { day: 'Sat', pickups: 13, target: 15 },
  { day: 'Sun', pickups: 8,  target: 15 },
];

const PERF = [
  { icon: Recycle,   label: 'Pickups Done',    value: 34, total: 40,  suffix: '',    color: '#22C55E' },
  { icon: TrendingUp,label: 'Efficiency',       value: 92, total: 100, suffix: '%',   color: '#3B82F6' },
  { icon: Flame,     label: 'Day Streak',       value: 7,  total: 7,   suffix: ' days', color: '#F59E0B' },
  { icon: Star,      label: 'Citizen Rating',   value: 4.8,total: 5,   suffix: '/5',  color: '#A855F7' },
];

interface Props { data: CollectorDashboardData | null }

export default function ReportsClient({ data }: Props) {
  const { isDark } = useTheme();
  const collectorName = data?.collector.name ?? 'Rajesh Kumar';
  const totalPickupsToday = data?.pickups.length ?? 5;
  const completedToday = data?.pickups.filter(p => p.status === 'completed').length ?? 2;

  const card = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';

  const maxPickups = Math.max(...DAILY.map(d => d.pickups));

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Reports</h1>
          <p className={`text-xs ${muted}`}>{collectorName}&apos;s performance</p>
        </div>
      </motion.div>

      {/* Today summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: CheckCircle2, label: 'Completed Today', value: completedToday, color: '#22C55E' },
          { icon: BarChart3,    label: 'Total Today',     value: totalPickupsToday, color: '#3B82F6' },
          { icon: Award,        label: 'Weekly Pickups',  value: 34, color: '#A855F7' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`border rounded-xl p-3 ${card}`}>
            <Icon className="w-4 h-4 mb-1.5" style={{ color }} />
            <p className="text-xl font-bold" style={{ color }}><AnimatedCounter to={value} duration={700} /></p>
            <p className={`text-[10px] ${muted} mt-0.5`}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Weekly bar chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className={`border rounded-2xl p-5 mb-6 ${card}`}>
        <div className="flex items-center justify-between mb-5">
          <p className={`text-sm font-semibold ${text}`}>This Week</p>
          <span className="text-xs text-[#22C55E] font-semibold bg-[#22C55E]/10 px-2.5 py-1 rounded-full">82 / 105 target</span>
        </div>
        <div className="flex items-end gap-2 h-28">
          {DAILY.map(({ day, pickups }, idx) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                className="w-full rounded-t-md bg-[#22C55E]/80 min-h-[4px]"
                initial={{ height: 0 }}
                animate={{ height: `${(pickups / maxPickups) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.07, ease: 'easeOut' }}
              />
              <span className={`text-[10px] ${muted}`}>{day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-inherit">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]/80" />
            <span className={`text-xs ${muted}`}>Pickups</span>
          </div>
          <div className={`text-xs ${muted}`}>Target: 15/day</div>
        </div>
      </motion.div>

      {/* Performance bars */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`border rounded-2xl p-5 mb-6 ${card}`}>
        <p className={`text-sm font-semibold ${text} mb-5`}>Performance Metrics</p>
        <div className="space-y-5">
          {PERF.map(({ icon: Icon, label, value, total, suffix, color }, idx) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <p className={`text-xs font-medium ${text}`}>{label}</p>
                </div>
                <p className="text-xs font-bold" style={{ color }}>{value}{suffix}</p>
              </div>
              <div className={`h-1.5 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.08, ease: 'easeOut' }}
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent highlights */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className={`border rounded-2xl p-5 ${card}`}>
        <p className={`text-sm font-semibold ${text} mb-4`}>Recent Highlights</p>
        <div className="space-y-3">
          {[
            { icon: '🏆', title: 'Top Collector',   desc: 'Ranked #1 in Mansarovar Ward this week',  time: '2 days ago' },
            { icon: '🔥', title: '7-Day Streak',     desc: 'Completed pickups every day this week',   time: '1 day ago' },
            { icon: '⭐', title: 'Perfect Rating',   desc: 'Received 5-star review from 3 citizens',  time: '3 days ago' },
            { icon: '♻️', title: '100 Scans Logged', desc: 'Milestone: 100 waste scans confirmed',    time: '5 days ago' },
          ].map(({ icon, title, desc, time }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${text}`}>{title}</p>
                <p className={`text-xs ${muted} mt-0.5`}>{desc}</p>
              </div>
              <span className={`text-[10px] ${muted} flex-shrink-0`}>{time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
