'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Map, Trophy, ClipboardList } from 'lucide-react'

const TABS = [
  { href: '/report',      label: 'Report',      icon: Camera        },
  { href: '/map',         label: 'Map',         icon: Map           },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy        },
  { href: '/my-reports',  label: 'My Reports',  icon: ClipboardList },
]

export function CitizenNav() {
  const path = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                active ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
