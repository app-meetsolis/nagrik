'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import type { DashboardData, ScanRowUI } from '@/types/actions';
import { MOCK_SCANS, getUser } from '@/lib/storage';
import HeroStatsCard from './HeroStatsCard';
import QuickActions from './QuickActions';
import RecentScans from './RecentScans';

interface Props {
  data: DashboardData;
}

function toScanRecord(s: ScanRowUI) {
  return {
    id: s.id,
    wasteType: s.wasteType,
    binColor: s.binColor,
    binColorHex: s.binColorHex,
    binLabel: s.binLabel,
    recyclable: s.recyclable,
    points: s.points,
    status: s.status,
    ward: s.ward,
    timestamp: s.timestamp,
  };
}

export default function CitizenDashboardClient({ data }: Props) {
  const { isDark } = useTheme();
  const [localName, setLocalName] = useState<string | null>(null);
  const [localPoints, setLocalPoints] = useState<number | null>(null);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setLocalName(user.name);
      setLocalPoints(user.ecoPoints ?? 0);
    }
  }, []);

  const displayName = localName ?? data.citizen.name;

  const scans = data.recent_scans.length > 0
    ? data.recent_scans.map(toScanRecord)
    : MOCK_SCANS;

  // When DB is unreachable, derive stats from the displayed scans (MOCK_SCANS fallback)
  const effectiveTotal = data.stats.total_scans > 0 ? data.stats.total_scans : scans.length;
  const effectiveRecyclable = data.stats.total_scans > 0
    ? data.stats.recyclable_count
    : scans.filter(s => s.recyclable).length;
  const recyclableRate = effectiveTotal > 0 ? Math.round((effectiveRecyclable / effectiveTotal) * 100) : 0;

  // If no real points exist yet, show points total from displayed scans so metrics aren't all zero
  const mockPoints = MOCK_SCANS.reduce((sum, s) => sum + s.points, 0);
  // Treat 0 same as null — a brand-new user has no real points yet
  const resolvedPoints = (localPoints !== null && localPoints > 0)
    ? localPoints
    : data.citizen.eco_points > 0 ? data.citizen.eco_points : mockPoints;
  const displayPoints = resolvedPoints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="px-5 lg:px-8 py-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Welcome back,</p>
          <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {displayName.split(' ')[0]}
          </p>
        </div>
        <div className="bg-[#22C55E]/10 text-[#22C55E] text-sm font-semibold px-3 py-1.5 rounded-full border border-[#22C55E]/20">
          ⭐ {displayPoints} pts
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-1 space-y-6">
          <HeroStatsCard
            ecoPoints={displayPoints}
            totalScans={effectiveTotal}
            recyclableRate={recyclableRate}
            wardRate={Math.round(data.stats.ward_recycling_rate)}
          />
          <div className="hidden lg:block">
            <QuickActions />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="mt-6 lg:mt-0 lg:hidden">
            <QuickActions />
          </div>
          <div className="mt-6 lg:mt-0">
            <RecentScans scans={scans.slice(0, 8)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
