'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Truck, MapPin, ClipboardList, BarChart3, Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { signOut } from '@/actions/auth';

interface CollectorLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/collector/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'nav-dash' },
  { href: '/collector/pickups', icon: Truck, label: 'Pickups', key: 'nav-pickups' },
  { href: '/collector/routes', icon: MapPin, label: 'Routes', key: 'nav-routes' },
  { href: '/collector/requests', icon: ClipboardList, label: 'Requests', key: 'nav-requests' },
  { href: '/collector/reports', icon: BarChart3, label: 'Reports', key: 'nav-reports' },
];

export default function CollectorLayout({ children }: CollectorLayoutProps) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const bg = isDark ? 'bg-[#0A0A0A]' : 'bg-[#F4F7F4]';
  const sidebar = isDark ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const activeItem = isDark ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
  const inactiveItem = isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
  const bottomNav = isDark ? 'bg-[#0A0A0A] border-[#1F1F1F]' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${bg}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r z-40 ${sidebar}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-inherit">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-sm">🌿</span>
          </div>
          <div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>nagrik</span>
            <p className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Collector Portal</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
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

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-inherit space-y-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 text-sm font-medium ${inactiveItem}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </motion.button>
          <form action={signOut}>
            <button
              type="submit"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 text-sm font-medium ${inactiveItem}`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3 border-b ${isDark ? 'bg-[#0A0A0A]/90 border-[#1F1F1F]' : 'bg-white/90 border-gray-200'} backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-xs">🌿</span>
          </div>
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Collector</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
              isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
          <form action={signOut}>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.88 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
              }`}
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300 ${bottomNav}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex flex-col items-center gap-1 pt-2 pb-1 px-2 transition-all duration-200"
              >
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-[#22C55E]' : isDark ? 'text-zinc-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-[#22C55E]' : isDark ? 'text-zinc-600' : 'text-gray-400'}`}>
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
