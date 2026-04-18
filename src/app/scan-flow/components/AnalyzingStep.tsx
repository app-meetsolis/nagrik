'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AnalyzingStep() {
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
            className="absolute inset-0 rounded-full bg-[#22C55E]/10"
          />
          <div className="absolute inset-0 rounded-full border-2 border-[#22C55E]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#22C55E] animate-spin" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-b-[#10B981]/50"
            style={{ animationDelay: '0.5s', animation: 'spin 1.5s linear infinite reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 rounded-full bg-[#22C55E]/30 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            </motion.div>
          </div>
        </div>

        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white font-semibold text-base mb-1"
          >
            AI is analysing your waste…
          </motion.p>
          <p className="text-zinc-500 text-sm">Powered by GPT-4o Vision</p>
        </div>

        <div className="space-y-2 w-full max-w-xs">
          {[
            { label: 'Detecting waste material', delay: 0 },
            { label: 'Classifying by type', delay: 0.5 },
            { label: 'Determining correct bin', delay: 1 },
          ].map((s, i) => (
            <motion.div
              key={`analyze-step-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: s.delay, duration: 0.4 }}
              className="flex items-center gap-3 bg-[#141414] border border-[#1F1F1F] rounded-lg px-3 py-2.5"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: s.delay }}
                className="w-2 h-2 rounded-full bg-[#22C55E]"
              />
              <p className="text-xs text-zinc-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
