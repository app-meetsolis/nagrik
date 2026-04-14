'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import type { PathOptions } from 'leaflet'

export interface WardScore {
  name:  string
  score: number
}

interface Props {
  scoreMap: Record<string, WardScore>
}

function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e'  // green
  if (score >= 60) return '#86efac'  // light green
  if (score >= 40) return '#fbbf24'  // amber
  if (score >= 20) return '#f97316'  // orange
  return '#ef4444'                   // red
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

export default function WardMap({ scoreMap }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/geo/jaipur-wards.geojson')
      .then(r => r.json())
      .then(setGeoData)
  }, [])

  if (!geoData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <p className="text-zinc-500 text-sm">Loading map…</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={[26.9124, 75.7873]}
      zoom={12}
      style={{ flex: 1, height: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <GeoJSON
        key={JSON.stringify(scoreMap)}
        data={geoData}
        style={(feature): PathOptions => {
          const wardData = scoreMap[feature?.properties?.id as string]
          const score    = wardData?.score ?? 50
          return {
            fillColor:   scoreToColor(score),
            fillOpacity: 0.65,
            color:       '#09090b',
            weight:      1.5,
          }
        }}
        onEachFeature={(feature, layer) => {
          const id       = feature.properties?.id as string
          const wardData = scoreMap[id]
          const name     = wardData?.name ?? feature.properties?.name ?? id
          const score    = wardData?.score ?? '?'
          const label    = typeof score === 'number' ? scoreLabel(score) : ''
          layer.bindTooltip(
            `<div style="font-family:sans-serif;min-width:120px">
               <b style="color:#18181b">${name}</b><br/>
               <span style="font-size:12px;color:#52525b">Civic score: </span>
               <b style="color:${scoreToColor(typeof score === 'number' ? score : 50)}">${score}</b>
               <span style="font-size:11px;color:#71717a"> · ${label}</span>
             </div>`,
            { sticky: true, opacity: 1 }
          )
        }}
      />
    </MapContainer>
  )
}
