'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react'
import { WardMapLoader } from './WardMapLoader'
import type { WardScore } from './WardMap'

function scoreStyle(score: number) {
  if (score >= 80) return { bg: 'bg-green-500/15',  text: 'text-green-400',  bar: 'bg-green-500',  label: 'Excellent' }
  if (score >= 60) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', bar: 'bg-emerald-400', label: 'Good'      }
  if (score >= 40) return { bg: 'bg-amber-500/15',  text: 'text-amber-400',  bar: 'bg-amber-400',  label: 'Fair'      }
  if (score >= 20) return { bg: 'bg-orange-500/15', text: 'text-orange-400', bar: 'bg-orange-400', label: 'Poor'      }
  return               { bg: 'bg-red-500/15',    text: 'text-red-400',    bar: 'bg-red-500',    label: 'Critical'  }
}

const LEGEND = [
  { color: '#22c55e', label: '80+  Excellent' },
  { color: '#86efac', label: '60–79  Good'    },
  { color: '#fbbf24', label: '40–59  Fair'    },
  { color: '#f97316', label: '20–39  Poor'    },
  { color: '#ef4444', label: '<20  Critical'  },
]

interface Ward {
  name:       string
  geojson_id: string
  score:      number
}

interface Props {
  scoreMap: Record<string, WardScore>
  wards:    Ward[]
}

export function MapPageClient({ scoreMap, wards }: Props) {
  const [showCards, setShowCards] = useState(false)

  return (
    <>
      {/* ── Bubble Map ──────────────────────────────────────────────── */}
      <section
        className="relative transition-all duration-300"
        style={{ height: showCards ? '44vh' : '78vh' }}
      >
        <WardMapLoader scoreMap={scoreMap} />

        {/* Floating legend */}
        <div className="absolute bottom-20 md:bottom-3 left-3 z-[1000] bg-zinc-900/90 backdrop-blur rounded-xl px-3 py-2 flex flex-col gap-1 border border-zinc-800">
          {LEGEND.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Toggle bar ──────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950">
        <button
          onClick={() => setShowCards(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <LayoutGrid className="w-4 h-4 text-orange-400" />
            Ward Score Cards
          </span>
          {showCards
            ? <ChevronUp   className="w-4 h-4 text-zinc-500" />
            : <ChevronDown className="w-4 h-4 text-zinc-500" />
          }
        </button>
      </div>

      {/* ── Score Cards Grid (collapsible) ──────────────────────────── */}
      {showCards && (
        <section className="px-4 pt-3 pb-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {wards.map((ward, idx) => {
              const { bg, text, bar, label } = scoreStyle(ward.score)
              return (
                <div
                  key={ward.geojson_id}
                  className={`${bg} rounded-2xl p-3 flex flex-col gap-2 border border-zinc-800`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-white text-sm font-semibold leading-tight">{ward.name}</p>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className={`${bar} h-1.5 rounded-full`} style={{ width: `${ward.score}%` }} />
                  </div>
                  <p className={`text-xl font-bold ${text}`}>{ward.score}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
