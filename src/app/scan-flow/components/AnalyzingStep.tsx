'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  streakMode?: boolean;
  streakPhase?: 'before' | 'after';
}

export default function AnalyzingStep({ streakMode, streakPhase }: Props) {
  const baseSteps = [
    { label: 'Detecting waste material', delay: 0 },
    { label: 'Classifying by type', delay: 0.5 },
    { label: 'Determining correct bin', delay: 1 },
  ];

  const freshnessSteps = [
    { label: 'Scanning photo metadata & EXIF data', delay: 1.5 },
    { label: 'Verifying GPS signature & location hash', delay: 2.2 },
    { label: 'AI freshness scan — detecting staged waste', delay: 3.0 },
    { label: '✅ Photo authenticated — genuine waste confirmed', delay: 3.8, done: true },
  ];

  const showFreshness = streakMode;
  const allSteps = showFreshness ? [...baseSteps, ...freshnessSteps] : baseSteps;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-full ${showFreshness ? 'bg-orange-500/10' : 'bg-[#22C55E]/10'}`}
          />
          <div className={`absolute inset-0 rounded-full border-2 ${showFreshness ? 'border-orange-500/20' : 'border-[#22C55E]/20'}`} />
          <div className={`absolute inset-0 rounded-full border-2 border-transparent animate-spin ${showFreshness ? 'border-t-orange-400' : 'border-t-[#22C55E]'}`} />
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent ${showFreshness ? 'border-b-orange-300/50' : 'border-b-[#10B981]/50'}`}
            style={{ animation: 'spin 1.5s linear infinite reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-4 h-4 rounded-full flex items-center justify-center ${showFreshness ? 'bg-orange-500/30' : 'bg-[#22C55E]/30'}`}
            >
              <div className={`w-2 h-2 rounded-full ${showFreshness ? 'bg-orange-400' : 'bg-[#22C55E]'}`} />
            </motion.div>
          </div>
        </div>

        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white font-semibold text-base mb-1"
          >
            {showFreshness && streakPhase === 'after'
              ? 'AI verifying your cleanup...'
              : 'AI is analysing your waste…'}
          </motion.p>
          <p className="text-zinc-500 text-sm">
            {showFreshness ? 'Powered by GPT-4o Vision + Anti-Fraud AI' : 'Powered by GPT-4o Vision'}
          </p>
        </div>

        <div className="space-y-2 w-full max-w-xs">
          {allSteps.map((s, i) => (
            <motion.div
              key={`analyze-step-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: s.delay, duration: 0.4 }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
                'done' in s && s.done
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
                  : 'bg-[#141414] border-[#1F1F1F]'
              }`}
            >
              {'done' in s && s.done ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s.delay + 0.1, type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: s.delay }}
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    i >= baseSteps.length ? 'bg-orange-400' : 'bg-[#22C55E]'
                  }`}
                />
              )}
              <p className={`text-xs ${'done' in s && s.done ? 'text-[#22C55E] font-medium' : 'text-zinc-400'}`}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
