'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { LayoutDashboard, Map, Trophy, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map',       label: 'Ward Map',  icon: Map              },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy       },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-tight text-white">nagrik</span>
        <p className="text-xs text-zinc-500 mt-0.5">Authority Portal</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <SignOutButton>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
