'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, LogIn } from 'lucide-react';
import { ScanResult } from '@/lib/mockResults';
import AnimatedCounter from '@/components/AnimatedCounter';
import AppImage from '@/components/ui/AppImage';

interface ResultStepProps {
  result: ScanResult;
  imageDataUrl: string;
  onLog: () => void;
  onRetake: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ResultStep({ result, imageDataUrl, onLog, onRetake }: ResultStepProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-y-auto">
      <div className="px-5 py-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative h-40 rounded-2xl overflow-hidden bg-[#141414] border border-[#1F1F1F] mb-4"
        >
          <AppImage
            src={imageDataUrl}
            alt={`Scanned ${result.wasteType} waste item`}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/60 backdrop-blur-sm text-xs text-zinc-300 px-2.5 py-1 rounded-lg border border-white/10">
              📍 Mansarovar
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-[#22C55E]/20 backdrop-blur-sm text-[#22C55E] text-xs font-medium px-2.5 py-1 rounded-lg border border-[#22C55E]/30">
              ✓ Classified
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6 space-y-5"
        >
          <motion.p variants={item} className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
            AI Classification
          </motion.p>

          <motion.div
            variants={item}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4"
          >
            <div
              className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: `${result.binColorHex}20`,
                border: `2px solid ${result.binColorHex}50`,
                boxShadow: `0 0 16px ${result.binColorHex}30`,
              }}
            >
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: result.binColorHex }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-white">{result.binLabel}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-zinc-400">{result.wasteType}</p>
                {result.recyclable ? (
                  <span className="flex items-center gap-1 text-xs text-[#22C55E]">
                    <CheckCircle2 className="w-3 h-3" />
                    Recyclable
                  </span>
                ) : (
                  <span className="text-xs text-red-400">✗ Non-Recyclable</span>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Preparation Steps</p>
            <div className="space-y-2.5">
              {result.prepSteps.map((step, i) => (
                <div key={`prep-${i}`} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-[#22C55E]/5 border border-[#22C55E]/10 rounded-xl px-4 py-3"
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">💡</span>
              <p className="text-sm text-[#22C55E]/80 leading-relaxed">{result.tip}</p>
            </div>
          </motion.div>

          <motion.div variants={item} className="text-center pt-2">
            <div className="inline-flex flex-col items-center">
              <div className="text-4xl font-bold text-[#22C55E] text-glow-green font-tabular">
                +<AnimatedCounter to={result.points} duration={800} />
              </div>
              <p className="text-sm text-zinc-500 mt-1">eco-points earned</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-5 space-y-3 pb-8">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLog}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            Log This Scan
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetake}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white font-medium rounded-xl h-11 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 text-zinc-500" />
            Scan Again
          </motion.button>
        </div>
      </div>
    </div>
  );
}
