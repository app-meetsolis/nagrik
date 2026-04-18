'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Camera, Trophy, ClipboardList, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface CitizenLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/citizen-dashboard', icon: Home, label: 'Home', key: 'nav-home' },
  { href: '/map', icon: MapPin, label: 'Centers', key: 'nav-map' },
  { href: '/scan-flow', icon: Camera, label: 'Scan', key: 'nav-scan', isFab: true },
  { href: '/leaderboard', icon: Trophy, label: 'Board', key: 'nav-board' },
  { href: '/my-scans', icon: ClipboardList, label: 'Scans', key: 'nav-scans' },
];

export default function CitizenLayout({ children }: CitizenLayoutProps) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const bg = isDark ? 'bg-[#0A0A0A]' : 'bg-[#F4F7F4]';
  const sidebar = isDark ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const activeItem = isDark ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
  const inactiveItem = isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${bg}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r z-40 ${sidebar}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-inherit">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-sm">🌿</span>
          </div>
          <div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>nagrik</span>
            <p className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Citizen Portal</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            if (item.isFab) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold text-sm transition-all duration-200 mt-2 mb-2"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  Scan Waste
                </Link>
              );
            }
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium ${
                  isActive ? activeItem + ' border' : inactiveItem + ' border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 py-4 border-t border-inherit">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 text-sm font-medium ${inactiveItem}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </motion.button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 flex justify-end px-5 pt-3 pb-2 ${isDark ? 'bg-[#0A0A0A]/80' : 'bg-[#F4F7F4]/80'} backdrop-blur-sm`}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
            isDark
              ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/30'
              : 'bg-white border-gray-200 text-gray-500 hover:text-[#22C55E] hover:border-[#22C55E]/30'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pb-24 lg:pb-8 pt-12 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300 ${
          isDark ? 'bg-[#0A0A0A] border-[#1F1F1F]' : 'bg-white border-gray-200'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md mx-auto flex items-end justify-around px-2 h-16">
          {NAV_ITEMS.map((item) => {
            if (item.isFab) {
              return (
                <Link key={item.key} href={item.href} className="flex flex-col items-center -mt-5">
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="w-14 h-14 rounded-full bg-[#22C55E] glow-green flex items-center justify-center shadow-lg shadow-[#22C55E]/20 transition-all duration-200 hover:bg-[#16A34A]"
                  >
                    <Camera className="w-6 h-6 text-black" />
                  </motion.div>
                </Link>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex flex-col items-center gap-1 pt-2 pb-1 px-3 transition-all duration-200"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-[#22C55E]' : isDark ? 'text-zinc-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-[#22C55E]' : isDark ? 'text-zinc-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
