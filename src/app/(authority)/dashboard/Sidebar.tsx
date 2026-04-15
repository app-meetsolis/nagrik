'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { LayoutDashboard, Map, Trophy, LogOut, Camera } from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/report',      label: 'Report Issue', icon: Camera          },
  { href: '/map',         label: 'Ward Map',     icon: Map             },
  { href: '/leaderboard', label: 'Leaderboard',  icon: Trophy          },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-14 md:w-56 shrink-0 flex flex-col border-r border-slate-200 bg-white h-screen sticky top-0">

      {/* Brand — desktop only */}
      <div className="hidden md:block px-5 py-5 border-b border-slate-100">
        <span className="text-lg font-bold tracking-tight text-slate-900">nagrik</span>
        <p className="text-xs text-slate-400 mt-0.5">Authority Portal</p>
      </div>

      {/* Mobile top spacer so first icon isn't flush with top */}
      <div className="md:hidden h-4" />

      {/* Nav links */}
      <nav className="flex-1 px-1.5 md:px-3 py-2 md:py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center justify-center md:justify-start gap-3 px-0 md:px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-1.5 md:px-3 py-3 md:py-4 border-t border-slate-100">
        <SignOutButton>
          <button
            title="Sign Out"
            className="flex items-center justify-center md:justify-start gap-3 px-0 md:px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
