'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 py-6 max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="bg-shimmer h-3 w-24 rounded-md" />
          <div className="bg-shimmer h-5 w-32 rounded-md" />
        </div>
        <div className="bg-shimmer h-8 w-20 rounded-full" />
      </div>
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6">
        <div className="text-center mb-5">
          <div className="bg-shimmer h-12 w-20 rounded-lg mx-auto mb-2" />
          <div className="bg-shimmer h-3 w-16 rounded mx-auto" />
        </div>
        <div className="border-t border-[#1F1F1F] mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {['sk-1', 'sk-2', 'sk-3'].map((key) => (
            <div key={key} className="text-center space-y-1.5">
              <div className="bg-shimmer h-5 w-10 rounded mx-auto" />
              <div className="bg-shimmer h-3 w-14 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="bg-shimmer h-3 w-24 rounded mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {['sk-a1', 'sk-a2', 'sk-a3', 'sk-a4'].map((key) => (
            <div key={key} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4">
              <div className="bg-shimmer w-9 h-9 rounded-xl mb-3" />
              <div className="bg-shimmer h-4 w-20 rounded mb-1" />
              <div className="bg-shimmer h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between mb-3">
          <div className="bg-shimmer h-3 w-24 rounded" />
          <div className="bg-shimmer h-3 w-12 rounded" />
        </div>
        <div className="space-y-2">
          {['sk-s1', 'sk-s2', 'sk-s3'].map((key) => (
            <div key={key} className="bg-[#141414] border border-[#1F1F1F] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-shimmer w-3 h-3 rounded-full" />
                  <div className="space-y-1">
                    <div className="bg-shimmer h-4 w-24 rounded" />
                    <div className="bg-shimmer h-3 w-16 rounded" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="bg-shimmer h-4 w-12 rounded" />
                  <div className="bg-shimmer h-3 w-10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
