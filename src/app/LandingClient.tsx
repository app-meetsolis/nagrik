'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, Truck, ArrowRight, Recycle, Users, Star } from 'lucide-react';

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="land-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#22C55E" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#land-grid)" />
        </svg>
      </div>
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#22C55E]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 mb-10"
        >
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-lg">🌿</span>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">nagrik</span>
            <p className="text-[10px] text-zinc-600 font-medium -mt-0.5 tracking-wide">AI Waste Platform</p>
          </div>
        </motion.div>

        {/* Live pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="inline-flex items-center gap-1.5 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full px-3 py-1 mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs font-semibold text-[#22C55E]">Live in Jaipur</span>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-[2rem] font-bold text-white tracking-tight leading-tight mb-3">
            Segregate smarter.<br />
            <span className="text-[#22C55E]">Earn eco-points.</span>
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            AI classifies your waste in 2 seconds — learn the right bin, earn rewards, and help build a cleaner city.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="grid grid-cols-3 gap-2.5 mb-8"
        >
          {[
            { icon: Users, value: '2,400+', label: 'Citizens' },
            { icon: Recycle, value: '18k+', label: 'Scans' },
            { icon: Star, value: '4.8★', label: 'Rated' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-[#111] border border-[#1F1F1F] rounded-xl p-3 text-center">
              <Icon className="w-3.5 h-3.5 text-[#22C55E] mx-auto mb-1.5" />
              <p className="text-sm font-bold text-white leading-none">{value}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Role cards */}
        <div className="space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.22 }}
          >
            <Link
              href="/onboarding?role=citizen"
              className="group flex items-center gap-4 bg-[#141414] border-2 border-[#22C55E]/30 hover:border-[#22C55E]/70 hover:bg-[#22C55E]/5 rounded-2xl p-5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">I&apos;m a Citizen</p>
                <p className="text-xs text-zinc-500 mt-0.5">Scan waste · Earn eco-points · Track impact</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#22C55E] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.28 }}
          >
            <Link
              href="/onboarding?role=collector"
              className="group flex items-center gap-4 bg-[#141414] border-2 border-[#1F1F1F] hover:border-zinc-600/50 hover:bg-white/[0.02] rounded-2xl p-5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">I&apos;m a Collector</p>
                <p className="text-xs text-zinc-500 mt-0.5">Manage pickups · Track routes · Serve your ward</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="text-center text-xs text-zinc-700"
        >
          By continuing you agree to our Terms of Service &amp; Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}
