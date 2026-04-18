'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Camera, ClipboardList, Home } from 'lucide-react';
import { ScanResult } from '@/lib/mockResults';
import AnimatedCounter from '@/components/AnimatedCounter';
import { getUser } from '@/lib/storage';

interface SuccessStepProps {
  result: ScanResult;
  onScanAgain: () => void;
}

const SUMMARY_ROWS = (result: ScanResult, totalPoints: number) => [
  { key: 'row-points-earned', label: 'Points Earned', value: `+${result.points}`, valueClass: 'text-[#22C55E] font-bold' },
  { key: 'row-total-points', label: 'Total Eco-Points', value: totalPoints.toString(), valueClass: 'text-white font-medium' },
  { key: 'row-waste-type', label: 'Waste Type', value: result.wasteType, valueClass: 'text-white font-medium' },
  {
    key: 'row-bin-color',
    label: 'Bin Color',
    value: `${result.binColor === 'blue' ? '🔵' : result.binColor === 'green' ? '🟢' : result.binColor === 'red' ? '🔴' : '⚫'} ${result.binLabel}`,
    valueClass: 'text-white font-medium',
  },
  { key: 'row-ward', label: 'Ward', value: 'Mansarovar', valueClass: 'text-white font-medium' },
];

export default function SuccessStep({ result, onScanAgain }: SuccessStepProps) {
  const user = getUser();
  const totalPoints = user?.ecoPoints ?? 47;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E] flex items-center justify-center animate-pulse-glow"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.25 }}
            >
              <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Scan Logged!</h1>
          <p className="text-sm text-zinc-500">Well done, you&#39;re making a difference 🌱</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          className="text-center mb-5"
        >
          <span className="text-4xl font-bold text-[#22C55E] text-glow-green font-tabular">
            +<AnimatedCounter to={result.points} duration={600} />
          </span>
          <p className="text-xs text-zinc-600 mt-1">eco-points added to your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 mb-5"
        >
          {SUMMARY_ROWS(result, totalPoints).map((row, i) => (
            <div
              key={row.key}
              className={`flex justify-between py-2.5 ${i < SUMMARY_ROWS(result, totalPoints).length - 1 ? 'border-b border-[#1F1F1F]' : ''}`}
            >
              <span className="text-sm text-zinc-500">{row.label}</span>
              <span className={`text-sm ${row.valueClass}`}>{row.value}</span>
            </div>
          ))}
        </motion.div>

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
