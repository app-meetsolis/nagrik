'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Trophy } from 'lucide-react'

export function PublicNav() {
  const path = usePathname()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
      <Link
        href="/"
        className="text-base font-bold tracking-tight text-white hover:text-orange-400 transition-colors"
      >
        nagrik
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          href="/map"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            path === '/map'
              ? 'bg-orange-500/15 text-orange-400'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Map className="w-4 h-4" />
          Map
        </Link>
        <Link
          href="/leaderboard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            path === '/leaderboard'
              ? 'bg-orange-500/15 text-orange-400'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Link>
      </nav>
    </header>
  )
}
