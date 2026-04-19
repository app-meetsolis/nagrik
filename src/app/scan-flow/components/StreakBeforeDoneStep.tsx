'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Flame, Home, MapPin } from 'lucide-react';

interface Props {
  onStartAfterPhoto: () => void;
}

export default function StreakBeforeDoneStep({ onStartAfterPhoto }: Props) {
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
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center"
          >
            <Flame className="w-12 h-12 text-orange-400" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Before Photo Saved!</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Now go clean the area. Come back with the{' '}
            <span className="text-orange-400 font-semibold">after photo</span> to earn{' '}
            <span className="text-orange-400 font-bold text-base">3× points</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] border border-orange-500/20 rounded-2xl p-5 mb-5 space-y-4"
        >
          <p className="text-xs text-orange-400/70 uppercase tracking-widest font-medium">Anti-Fraud Verification</p>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">2-Hour Time Lock</p>
              <p className="text-xs text-zinc-500 mt-0.5">After photo must be submitted at least 2 hours later to prevent fake cleanups</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Location Must Change 100m+</p>
              <p className="text-xs text-zinc-500 mt-0.5">Your next scan must be from a different spot — prevents loop fraud</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm text-white font-medium">AI Freshness Scan</p>
              <p className="text-xs text-zinc-500 mt-0.5">AI analyses photo metadata and image quality to detect staged waste</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <button
            onClick={onStartAfterPhoto}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Flame className="w-4 h-4" />
            I've Cleaned It — Upload After Photo
          </button>
          <Link
            href="/citizen-dashboard"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white font-medium rounded-xl h-11 flex items-center justify-center gap-1.5 text-sm transition-all duration-200"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            Return to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
