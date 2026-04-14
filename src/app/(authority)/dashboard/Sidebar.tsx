'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { LayoutDashboard, Map, Trophy, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/map',         label: 'Ward Map',   icon: Map             },
  { href: '/leaderboard', label: 'Leaderboard',icon: Trophy          },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-14 md:w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">

      {/* Brand — desktop only */}
      <div className="hidden md:block px-5 py-5 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-tight text-white">nagrik</span>
        <p className="text-xs text-zinc-500 mt-0.5">Authority Portal</p>
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
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-1.5 md:px-3 py-3 md:py-4 border-t border-zinc-800">
        <SignOutButton>
          <button
            title="Sign Out"
            className="flex items-center justify-center md:justify-start gap-3 px-0 md:px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
