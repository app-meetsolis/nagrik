'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, MapPin, Trophy, LogOut, Home } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'

const SIDEBAR_LINKS = [
  { href: '/home',        label: 'Home',        icon: Home   },
  { href: '/report',      label: 'Scan Waste',  icon: Camera },
  { href: '/map',         label: 'Centers',     icon: MapPin },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

export function CitizenNav() {
  const path = usePathname()

  return (
    <>
      {/* ── DESKTOP: left sidebar (md+) ─────────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white h-full">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <span className="text-lg font-bold tracking-tight text-slate-900">nagrik</span>
          <p className="text-xs text-slate-400 mt-0.5">Waste Segregation</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-slate-100">
          <SignOutButton>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors w-full">
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── MOBILE: bottom nav + camera FAB (below md) ──────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">

        {/* Camera FAB — raised green circle */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link
            href="/report"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
              path === '/report'
                ? 'bg-green-500 shadow-green-400/40'
                : 'bg-green-600 shadow-green-600/30'
            }`}
          >
            <Camera className="w-6 h-6 text-white" />
          </Link>
        </div>

        {/* Bottom bar */}
        <nav
          className="bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center h-14">

            {/* Left: Home + Centers */}
            <Link
              href="/home"
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                path === '/home' ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link
              href="/map"
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                path === '/map' ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] font-medium">Centers</span>
            </Link>

            {/* Centre gap for FAB */}
            <div className="w-16 shrink-0" />

            {/* Right: Leaderboard + Sign Out */}
            <Link
              href="/leaderboard"
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                path === '/leaderboard' ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-medium">Board</span>
            </Link>
            <SignOutButton>
              <button className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-slate-400 hover:text-slate-600 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-medium">Sign Out</span>
              </button>
            </SignOutButton>

          </div>
        </nav>
      </div>
    </>
  )
}
