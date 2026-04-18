'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Zap } from 'lucide-react';

interface CaptureStepProps {
  onFileSelect: () => void;
}

export default function CaptureStep({ onFileSelect }: CaptureStepProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link
          href="/citizen-dashboard"
          className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center hover:border-[#3A3A3A] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div className="bg-white/5 text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-white/10">
          📍 Mansarovar
        </div>
        <div className="w-9" />
      </div>

      <div className="px-5 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Step 1 of 2</p>
        <h1 className="text-xl font-bold text-white tracking-tight">Scan Your Waste</h1>
        <p className="text-sm text-zinc-500 mt-1">Take or upload a clear photo of the waste item</p>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onFileSelect}
          className="flex-1 min-h-[320px] border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#22C55E]/40 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#22C55E]/30 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#22C55E]/30 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[#22C55E]/30 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[#22C55E]/30 rounded-br-lg" />

          <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center group-hover:bg-[#22C55E]/15 transition-all duration-200">
            <Camera className="w-7 h-7 text-[#22C55E]" />
          </div>
          <div className="text-center px-8">
            <p className="text-zinc-400 text-sm font-medium mb-1">Tap to select a waste photo</p>
            <p className="text-zinc-600 text-xs">Opens camera on mobile · File picker on desktop</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-700">
            <Upload className="w-3 h-3" />
            <span>JPG, PNG, WEBP supported</span>
          </div>
        </motion.button>

        <div className="mt-4 bg-[#141414] border border-[#1F1F1F] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Photo Tips</p>
          </div>
          <div className="space-y-1.5">
            {[
              'Good lighting helps AI classify accurately',
              'Include the full item in frame',
              'Avoid blurry or dark images',
            ].map((tip, i) => (
              <div key={`tip-${i}`} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
                <p className="text-xs text-zinc-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onFileSelect}
          className="mt-4 mb-6 w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Camera className="w-4 h-4" />
          Open Camera / Upload Photo
        </motion.button>
      </div>
    </div>
  );
}
