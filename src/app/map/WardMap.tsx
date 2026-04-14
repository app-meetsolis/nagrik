'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

export interface WardScore {
  name:  string
  score: number
}

/** Centroid [lat, lng] for each ward */
const CENTROIDS: Record<string, [number, number]> = {
  ward_1:  [26.9124, 75.7403],
  ward_2:  [26.8548, 75.7538],
  ward_3:  [26.8614, 75.8020],
  ward_4:  [26.8194, 75.8622],
  ward_5:  [26.8085, 75.7955],
  ward_6:  [26.9230, 75.7694],
  ward_7:  [26.9101, 75.7892],
  ward_8:  [26.9239, 75.8267],
  ward_9:  [26.9062, 75.8013],
  ward_10: [26.9063, 75.8233],
  ward_11: [26.9214, 75.8063],
  ward_12: [26.8956, 75.8082],
  ward_13: [26.8594, 75.7982],
  ward_14: [26.9040, 75.7384],
  ward_15: [26.9875, 75.8528],
  ward_16: [26.8946, 75.9174],
  ward_17: [26.9598, 75.7699],
  ward_18: [26.9398, 75.8101],
  ward_19: [26.8731, 75.7712],
  ward_20: [26.9629, 75.7358],
}

function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#86efac'
  if (score >= 40) return '#fbbf24'
  if (score >= 20) return '#f97316'
  return '#ef4444'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

interface Props {
  scoreMap: Record<string, WardScore>
}

export default function WardMap({ scoreMap }: Props) {
  return (
    <MapContainer
      center={[26.9124, 75.7873]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {Object.entries(CENTROIDS).map(([wardId, [lat, lng]]) => {
        const data  = scoreMap[wardId]
        const score = data?.score ?? 50
        const name  = data?.name  ?? wardId
        const color = scoreToColor(score)

        return (
          <CircleMarker
            key={wardId}
            center={[lat, lng]}
            radius={22}
            pathOptions={{
              fillColor:   color,
              fillOpacity: 0.85,
              color:       '#09090b',
              weight:      2,
            }}
          >
            <Tooltip sticky opacity={1}>
              <div style={{ fontFamily: 'sans-serif', minWidth: 130 }}>
                <b style={{ color: '#18181b' }}>{name}</b><br />
                <span style={{ fontSize: 12, color: '#52525b' }}>Score: </span>
                <b style={{ color }}>{score}</b>
                <span style={{ fontSize: 11, color: '#71717a' }}> · {scoreLabel(score)}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
