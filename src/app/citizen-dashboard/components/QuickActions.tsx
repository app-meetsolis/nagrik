'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, MapPin, Trophy, ClipboardList } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ACTIONS = [
  {
    key: 'action-scan',
    icon: Camera,
    label: 'Scan Waste',
    href: '/scan-flow',
    accent: true,
    description: 'Identify & earn points',
  },
  {
    key: 'action-map',
    icon: MapPin,
    label: 'Find Centers',
    href: '/map',
    accent: false,
    description: 'Nearby drop points',
  },
  {
    key: 'action-leaderboard',
    icon: Trophy,
    label: 'Leaderboard',
    href: '/leaderboard',
    accent: false,
    description: 'See your ranking',
  },
  {
    key: 'action-scans',
    icon: ClipboardList,
    label: 'My Scans',
    href: '/my-scans',
    accent: false,
    description: 'Scan history',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function QuickActions() {
  const { isDark } = useTheme();

  return (
    <div>
      <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Quick Actions</p>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.key} variants={item}>
              <Link
                href={action.href}
                className={`block border rounded-2xl p-4 transition-all duration-200 group hover:scale-[1.02] ${
                  action.accent
                    ? isDark
                      ? 'bg-[#141414] border-[#22C55E]/30 hover:border-[#22C55E]/50'
                      : 'bg-white border-[#22C55E]/30 hover:border-[#22C55E]/50'
                    : isDark
                    ? 'bg-[#141414] border-[#1F1F1F] hover:border-[#2A2A2A] hover:bg-[#1A1A1A]'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${
                  action.accent ? 'bg-[#22C55E]/15' : isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${action.accent ? 'text-[#22C55E]' : isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-gray-500 group-hover:text-gray-700'}`} />
                </div>
                <p className={`text-sm font-semibold mb-0.5 ${action.accent ? 'text-[#22C55E]' : isDark ? 'text-white' : 'text-gray-900'}`}>
                  {action.label}
                </p>
                <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-500'}`}>{action.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
