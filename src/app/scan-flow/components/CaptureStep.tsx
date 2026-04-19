'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Flame, Upload, Zap } from 'lucide-react';

interface CaptureStepProps {
  onFileSelect: () => void;
  streakMode: boolean;
  streakPhase: 'before' | 'after';
  onToggleStreak: () => void;
}

export default function CaptureStep({ onFileSelect, streakMode, streakPhase, onToggleStreak }: CaptureStepProps) {
  const isAfterPhase = streakMode && streakPhase === 'after';

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

      {/* Streak mode toggle — hidden when in after phase (auto-locked) */}
      {!isAfterPhase && (
        <div className="px-5 mb-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onToggleStreak}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
              streakMode
                ? 'bg-orange-500/10 border-orange-500/40'
                : 'bg-[#141414] border-[#2A2A2A] hover:border-[#3A3A3A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flame className={`w-4 h-4 ${streakMode ? 'text-orange-400' : 'text-zinc-500'}`} />
              <div className="text-left">
                <p className={`text-sm font-semibold ${streakMode ? 'text-orange-300' : 'text-zinc-300'}`}>
                  Streak Mode
                </p>
                <p className="text-xs text-zinc-500">
                  {streakMode ? 'Before + After = 3× points · If you miss, all points reset to 0' : 'Tap to earn 3× points by cleaning the spot'}
                </p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${streakMode ? 'bg-orange-500' : 'bg-[#2A2A2A]'}`}>
              <motion.div
                animate={{ x: streakMode ? 16 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
              />
            </div>
          </motion.button>
        </div>
      )}

      <div className="px-5 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
          {streakMode
            ? isAfterPhase
              ? 'Streak Mode — Step 2 of 2'
              : 'Streak Mode — Step 1 of 2'
            : 'Step 1 of 2'}
        </p>
        <div className="flex items-center gap-2">
          {isAfterPhase && (
            <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-500/30">
              🔥 AFTER PHOTO
            </span>
          )}
          {streakMode && !isAfterPhase && (
            <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-500/30">
              📸 BEFORE PHOTO
            </span>
          )}
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isAfterPhase ? 'Show the Clean Area' : 'Scan Your Waste'}
          </h1>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          {isAfterPhase
            ? 'Take a clear photo of the cleaned spot to earn 3× eco-points'
            : streakMode
            ? 'Capture the waste — then clean it and come back for 3× bonus'
            : 'Take or upload a clear photo of the waste item'}
        </p>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onFileSelect}
          className={`flex-1 min-h-[280px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden ${
            isAfterPhase
              ? 'border-orange-500/30 hover:border-orange-500/60'
              : 'border-zinc-700 hover:border-[#22C55E]/40'
          }`}
        >
          <div className={`absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg ${isAfterPhase ? 'border-orange-500/30' : 'border-[#22C55E]/30'}`} />
          <div className={`absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg ${isAfterPhase ? 'border-orange-500/30' : 'border-[#22C55E]/30'}`} />
          <div className={`absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 rounded-bl-lg ${isAfterPhase ? 'border-orange-500/30' : 'border-[#22C55E]/30'}`} />
          <div className={`absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 rounded-br-lg ${isAfterPhase ? 'border-orange-500/30' : 'border-[#22C55E]/30'}`} />

          <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-200 ${
            isAfterPhase
              ? 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20'
              : 'bg-[#22C55E]/10 border-[#22C55E]/20 group-hover:bg-[#22C55E]/15'
          }`}>
            {isAfterPhase ? (
              <Flame className="w-7 h-7 text-orange-400" />
            ) : (
              <Camera className="w-7 h-7 text-[#22C55E]" />
            )}
          </div>
          <div className="text-center px-8">
            <p className="text-zinc-400 text-sm font-medium mb-1">
              {isAfterPhase ? 'Tap to upload after photo' : 'Tap to select a waste photo'}
            </p>
            <p className="text-zinc-600 text-xs">Opens camera on mobile · File picker on desktop</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-700">
            <Upload className="w-3 h-3" />
            <span>JPG, PNG, WEBP supported</span>
          </div>
        </motion.button>

        {isAfterPhase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-xs text-orange-400/80 uppercase tracking-widest font-medium">Streak Verification Active</p>
            </div>
            <p className="text-xs text-zinc-500">AI will verify photo authenticity, time gap, and location distance before awarding 3× points</p>
          </motion.div>
        )}

        {!isAfterPhase && (
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
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onFileSelect}
          className={`mt-4 mb-6 w-full font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200 ${
            isAfterPhase
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-[#22C55E] hover:bg-[#16A34A] text-black'
          }`}
        >
          {isAfterPhase ? <Flame className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {isAfterPhase ? 'Upload After Photo' : 'Open Camera / Upload Photo'}
        </motion.button>
      </div>
    </div>
  );
}
