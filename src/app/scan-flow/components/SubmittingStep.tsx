'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SubmittingStep() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#22C55E]/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#22C55E] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">Logging your scan…</p>
          <p className="text-zinc-600 text-xs mt-1">Saving to your eco-history</p>
        </div>
      </motion.div>
    </div>
  );
}
