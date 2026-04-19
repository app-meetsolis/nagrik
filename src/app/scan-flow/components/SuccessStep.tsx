'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, ClipboardList, Flame, Home } from 'lucide-react';
import { ScanResult } from '@/lib/mockResults';
import AnimatedCounter from '@/components/AnimatedCounter';
import { getUser } from '@/lib/storage';

interface SuccessStepProps {
  result: ScanResult;
  onScanAgain: () => void;
  streakBonus?: boolean;
  streakCount?: number;
}

const SUMMARY_ROWS = (result: ScanResult, totalPoints: number, displayPoints: number) => [
  {
    key: 'row-points-earned',
    label: 'Points Earned',
    value: `+${displayPoints}`,
    valueClass: 'text-[#22C55E] font-bold',
  },
  {
    key: 'row-total-points',
    label: 'Total Eco-Points',
    value: totalPoints.toString(),
    valueClass: 'text-white font-medium',
  },
  {
    key: 'row-waste-type',
    label: 'Waste Type',
    value: result.wasteType,
    valueClass: 'text-white font-medium',
  },
  {
    key: 'row-bin-color',
    label: 'Bin Color',
    value: `${result.binColor === 'blue' ? '🔵' : result.binColor === 'green' ? '🟢' : result.binColor === 'red' ? '🔴' : '⚫'} ${result.binLabel}`,
    valueClass: 'text-white font-medium',
  },
  { key: 'row-ward', label: 'Ward', value: 'Mansarovar', valueClass: 'text-white font-medium' },
];

export default function SuccessStep({ result, onScanAgain, streakBonus, streakCount }: SuccessStepProps) {
  const user = getUser();
  const totalPoints = user?.ecoPoints ?? 47;
  const displayPoints = streakBonus ? result.points * 3 : result.points;

  const whatsappText = encodeURIComponent(
    `🌿 I just helped clean Mansarovar! Earned ${displayPoints} eco-points${streakBonus ? ' (🔥 3× Streak Bonus!)' : ''} on Nagrik — India's civic waste app. Join me in making our city cleaner! #Nagrik #SwachhBharat`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Streak Bonus Banner */}
        {streakBonus && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mb-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/10 border border-orange-500/40 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <Flame className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-orange-300 font-bold text-sm">🔥 Streak Bonus Unlocked!</p>
              <p className="text-xs text-zinc-500">
                {streakCount && streakCount > 1 ? `${streakCount} cleanups completed · ` : ''}3× points awarded for cleaning the spot
              </p>
            </div>
          </motion.div>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${
              streakBonus
                ? 'bg-orange-500/10 border-orange-500/40'
                : 'bg-[#22C55E]/10 border-[#22C55E] animate-pulse-glow'
            }`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.25 }}
            >
              {streakBonus ? (
                <Flame className="w-12 h-12 text-orange-400" />
              ) : (
                <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            {streakBonus ? 'Cleanup Verified!' : 'Scan Logged!'}
          </h1>
          <p className="text-sm text-zinc-500">
            {streakBonus
              ? 'AI confirmed your cleanup. Mansarovar is cleaner 🌱'
              : "Well done, you're making a difference 🌱"}
          </p>
        </motion.div>

        {/* Points counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          className="text-center mb-5"
        >
          <span className={`text-4xl font-bold font-tabular ${streakBonus ? 'text-orange-400' : 'text-[#22C55E] text-glow-green'}`}>
            +<AnimatedCounter to={displayPoints} duration={600} />
          </span>
          {streakBonus && (
            <span className="ml-2 text-lg text-zinc-500 line-through font-tabular">+{result.points}</span>
          )}
          <p className="text-xs text-zinc-600 mt-1">eco-points added to your account</p>
        </motion.div>

        {/* Summary rows */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 mb-4"
        >
          {SUMMARY_ROWS(result, totalPoints, displayPoints).map((row, i) => (
            <div
              key={row.key}
              className={`flex justify-between py-2.5 ${i < SUMMARY_ROWS(result, totalPoints, displayPoints).length - 1 ? 'border-b border-[#1F1F1F]' : ''}`}
            >
              <span className="text-sm text-zinc-500">{row.label}</span>
              <span className={`text-sm ${row.valueClass}`}>{row.value}</span>
            </div>
          ))}
        </motion.div>

        {/* WhatsApp share */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mb-4"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/50 text-[#25D366] font-semibold rounded-xl h-11 flex items-center justify-center gap-2 text-sm transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </a>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="space-y-3"
        >
          <button
            onClick={onScanAgain}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Camera className="w-4 h-4" />
            Scan More Waste
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/my-scans"
              className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white font-medium rounded-xl h-11 flex items-center justify-center gap-1.5 text-sm transition-all duration-200"
            >
              <ClipboardList className="w-4 h-4 text-zinc-500" />
              My Scans
            </Link>
            <Link
              href="/citizen-dashboard"
              className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white font-medium rounded-xl h-11 flex items-center justify-center gap-1.5 text-sm transition-all duration-200"
            >
              <Home className="w-4 h-4 text-zinc-500" />
              Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
