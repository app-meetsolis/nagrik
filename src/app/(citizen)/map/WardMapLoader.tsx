'use client'

import dynamic from 'next/dynamic'
import type { WardScore, RecyclingCenterInfo } from './WardMap'

const WardMap = dynamic(() => import('./WardMap'), { ssr: false })

export function WardMapLoader({
  scoreMap,
  centers,
}: {
  scoreMap: Record<string, WardScore>
  centers:  RecyclingCenterInfo[]
}) {
  return <WardMap scoreMap={scoreMap} centers={centers} />
}
