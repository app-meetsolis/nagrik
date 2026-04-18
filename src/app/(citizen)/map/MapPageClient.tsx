'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react'
import { WardMapLoader } from './WardMapLoader'
import type { WardScore, RecyclingCenterInfo } from './WardMap'

function rateStyle(rate: number) {
  if (rate >= 70) return { bg: 'bg-green-50',   text: 'text-green-600',   bar: 'bg-green-500',  label: 'Good'  }
  if (rate >= 40) return { bg: 'bg-amber-50',   text: 'text-amber-600',   bar: 'bg-amber-400',  label: 'Fair'  }
  return               { bg: 'bg-red-50',     text: 'text-red-600',     bar: 'bg-red-500',    label: 'Poor'  }
}

const LEGEND = [
  { color: '#22c55e', label: '≥70%  Good'  },
  { color: '#fbbf24', label: '40–69%  Fair' },
  { color: '#ef4444', label: '<40%  Poor'  },
  { color: '#16a34a', label: '● Recycling Center' },
]

interface Ward {
  name:           string
  geojson_id:     string
  recycling_rate: number
}

interface Props {
  scoreMap: Record<string, WardScore>
  wards:    Ward[]
  centers:  RecyclingCenterInfo[]
}

export function MapPageClient({ scoreMap, wards, centers }: Props) {
  const [showCards, setShowCards] = useState(false)

  return (
    <>
      {/* ── Map ───────────────────────────────────────────────────── */}
      <section
        className="relative transition-all duration-300"
        style={{ height: showCards ? '44vh' : '78vh' }}
      >
        <WardMapLoader scoreMap={scoreMap} centers={centers} />

        {/* Floating legend */}
        <div className="absolute bottom-20 md:bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-xl px-3 py-2 flex flex-col gap-1 border border-slate-200">
          {LEGEND.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-2 text-xs text-slate-700">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Toggle bar ──────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-200 bg-white">
        <button
          onClick={() => setShowCards(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <LayoutGrid className="w-4 h-4 text-green-500" />
            Ward Recycling Rates
          </span>
          {showCards
            ? <ChevronUp   className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </button>
      </div>

      {/* ── Rate Cards Grid (collapsible) ──────────────────────────── */}
      {showCards && (
        <section className="px-4 pt-3 pb-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {wards.map((ward, idx) => {
              const { bg, text, bar, label } = rateStyle(ward.recycling_rate)
              return (
                <div
                  key={ward.geojson_id}
                  className={`${bg} rounded-2xl p-3 flex flex-col gap-2 border border-slate-200`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-slate-400 text-xs font-mono">#{idx + 1}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-slate-900 text-sm font-semibold leading-tight">{ward.name}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className={`${bar} h-1.5 rounded-full`} style={{ width: `${ward.recycling_rate}%` }} />
                  </div>
                  <p className={`text-xl font-bold ${text}`}>{ward.recycling_rate}%</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
