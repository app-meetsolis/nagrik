'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppImage from '@/components/ui/AppImage';

interface UploadingStepProps {
  imageDataUrl: string;
}

export default function UploadingStep({ imageDataUrl }: UploadingStepProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <AppImage
          src={imageDataUrl}
          alt="Uploaded waste photo being processed"
          fill
          className="object-cover opacity-20 blur-xl scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#22C55E]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#22C55E] animate-spin" />
          <div className="absolute inset-2 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-sm">Uploading photo…</p>
          <p className="text-zinc-500 text-xs mt-1">Please wait a moment</p>
        </div>

        <div className="w-48 h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="h-full bg-[#22C55E] rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
