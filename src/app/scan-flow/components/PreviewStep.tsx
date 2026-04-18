'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

interface PreviewStepProps {
  imageDataUrl: string;
  onAnalyze: () => void;
  onRetake: () => void;
}

export default function PreviewStep({ imageDataUrl, onAnalyze, onRetake }: PreviewStepProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col px-5 py-6">
      <div className="mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Step 2 of 2</p>
        <h1 className="text-xl font-bold text-white tracking-tight">Review Photo</h1>
        <p className="text-sm text-zinc-500 mt-1">Looks good? Let AI classify your waste.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl overflow-hidden flex-1 min-h-[320px] max-h-[420px] bg-[#141414] border border-[#1F1F1F]"
      >
        <AppImage
          src={imageDataUrl}
          alt="Waste item photo ready for AI analysis"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <div className="bg-black/60 backdrop-blur-sm text-zinc-300 text-xs px-3 py-1.5 rounded-lg border border-white/10">
            📍 Mansarovar
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-[#22C55E]/20 backdrop-blur-sm text-[#22C55E] text-xs px-2.5 py-1 rounded-lg border border-[#22C55E]/30 font-medium">
            AI Ready
          </div>
        </div>
      </motion.div>

      <div className="mt-5 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAnalyze}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Search className="w-4 h-4" />
          Analyse with AI
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRetake}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white font-medium rounded-xl h-11 flex items-center justify-center gap-2 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4 text-zinc-500" />
          Retake Photo
        </motion.button>
      </div>
    </div>
  );
}
