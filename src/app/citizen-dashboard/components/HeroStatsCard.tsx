'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/context/ThemeContext';

interface HeroStatsCardProps {
  ecoPoints: number;
  totalScans: number;
  recyclableRate: number;
  wardRate: number;
}

export default function HeroStatsCard({ ecoPoints, totalScans, recyclableRate, wardRate }: HeroStatsCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className={`rounded-2xl p-6 border ${
        isDark
          ? 'bg-gradient-to-br from-[#22C55E]/10 via-[#141414] to-[#141414] border-[#22C55E]/20'
          : 'bg-gradient-to-br from-[#22C55E]/10 via-white to-white border-[#22C55E]/20'
      }`}
    >
      {/* Main eco-points */}
      <div className="text-center mb-5">
        <div className="text-5xl font-bold text-[#22C55E] font-tabular text-glow-green">
          <AnimatedCounter to={ecoPoints} duration={1000} />
        </div>
        <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Eco-Points</p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#22C55E]/10 mb-4" />

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className={`text-lg font-bold font-tabular ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AnimatedCounter to={totalScans} duration={800} />
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Total Scans</p>
        </div>
        <div className={`text-center border-x ${isDark ? 'border-[#1F1F1F]' : 'border-gray-200'}`}>
          <p className={`text-lg font-bold font-tabular ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AnimatedCounter to={recyclableRate} duration={900} suffix="%" />
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Recyclable</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold font-tabular ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AnimatedCounter to={wardRate} duration={1000} suffix="%" />
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Ward Rate</p>
        </div>
      </div>
    </motion.div>
  );
}
