'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet'

export interface WardScore {
  name:          string
  recycling_rate: number
}

export interface RecyclingCenterInfo {
  id:             string
  name:           string
  address:        string
  lat:            number
  lng:            number
  accepted_types: string[]
  open_hours:     string | null
}

const WASTE_LABEL: Record<string, string> = {
  wet_organic:    'Wet Organic',
  dry_paper:      'Paper',
  dry_plastic:    'Plastic',
  dry_metal:      'Metal',
  dry_glass:      'Glass',
  e_waste:        'E-Waste',
  hazardous:      'Hazardous',
  textile:        'Textile',
  non_recyclable: 'Non-Recyclable',
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

function rateToColor(rate: number): string {
  if (rate >= 70) return '#22c55e'
  if (rate >= 40) return '#fbbf24'
  return '#ef4444'
}

function rateLabel(rate: number): string {
  if (rate >= 70) return 'Good'
  if (rate >= 40) return 'Fair'
  return 'Poor'
}

interface Props {
  scoreMap: Record<string, WardScore>
  centers:  RecyclingCenterInfo[]
}

export default function WardMap({ scoreMap, centers }: Props) {
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

      {/* Ward recycling rate circles */}
      {Object.entries(CENTROIDS).map(([wardId, [lat, lng]]) => {
        const data  = scoreMap[wardId]
        const rate  = data?.recycling_rate ?? 50
        const name  = data?.name  ?? wardId
        const color = rateToColor(rate)

        return (
          <CircleMarker
            key={wardId}
            center={[lat, lng]}
            radius={26}
            pathOptions={{
              fillColor:   color,
              fillOpacity: 0.85,
              color:       '#09090b',
              weight:      2,
            }}
          >
            <Tooltip sticky opacity={1}>
              <div style={{ fontFamily: 'sans-serif', minWidth: 140 }}>
                <b style={{ color: '#18181b' }}>{name}</b><br />
                <span style={{ fontSize: 12, color: '#52525b' }}>Recycling rate: </span>
                <b style={{ color }}>{rate}%</b>
                <span style={{ fontSize: 11, color: '#71717a' }}> · {rateLabel(rate)}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}

      {/* Recycling center markers */}
      {centers.map(center => (
        <CircleMarker
          key={center.id}
          center={[center.lat, center.lng]}
          radius={10}
          pathOptions={{
            fillColor:   '#16a34a',
            fillOpacity: 0.9,
            color:       '#14532d',
            weight:      2,
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: 180, maxWidth: 240 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#14532d', marginBottom: 4 }}>
                ♻ {center.name}
              </p>
              <p style={{ fontSize: 12, color: '#52525b', marginBottom: 6 }}>{center.address}</p>
              {center.open_hours && (
                <p style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>⏰ {center.open_hours}</p>
              )}
              {center.accepted_types.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: '#374151', fontWeight: 600, marginBottom: 3 }}>Accepts:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {center.accepted_types.map(t => (
                      <span
                        key={t}
                        style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 999,
                          background: '#dcfce7', color: '#15803d', fontWeight: 500,
                        }}
                      >
                        {WASTE_LABEL[t] ?? t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
