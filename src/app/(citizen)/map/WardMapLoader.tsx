'use client'

import dynamic from 'next/dynamic'
import type { WardScore } from './WardMap'

const WardMap = dynamic(() => import('./WardMap'), { ssr: false })

export function WardMapLoader({ scoreMap }: { scoreMap: Record<string, WardScore> }) {
  return <WardMap scoreMap={scoreMap} />
}
