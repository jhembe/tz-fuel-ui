import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polygon } from 'react-leaflet'
import { type PriceRecord } from '../../lib/api'
import { getDistrictCoords } from '../../lib/districtCoords'
import { fmtPrice, cleanDistrictName, type FuelType, priceToColor } from '../../lib/utils'

// Tanzania mainland boundary (simplified ~35 points, clockwise)
const TANZANIA_MAINLAND: [number, number][] = [
  [-1.06, 30.47], [-1.00, 31.06], [-1.00, 34.00], [-1.00, 34.80],
  [-1.22, 35.48], [-1.87, 37.10], [-1.62, 38.02], [-3.32, 38.36],
  [-4.49, 39.40], [-5.20, 39.42], [-5.87, 39.33], [-6.87, 39.57],
  [-7.88, 39.80], [-8.95, 39.87], [-10.47, 40.46], [-10.80, 40.45],
  [-11.38, 38.36], [-11.60, 37.00], [-11.60, 35.56], [-11.48, 34.90],
  [-11.28, 34.07], [-10.96, 33.60], [-10.00, 33.28], [-9.45, 32.97],
  [-8.80, 31.08], [-8.00, 30.60], [-7.00, 29.80], [-6.30, 29.65],
  [-5.45, 29.47], [-4.30, 29.40], [-3.82, 29.08], [-2.62, 29.02],
  [-1.87, 29.58], [-1.28, 29.73], [-1.06, 30.47],
]

// Unguja (main Zanzibar island)
const ZANZIBAR_UNGUJA: [number, number][] = [
  [-5.72, 39.18], [-5.68, 39.55], [-5.97, 39.72],
  [-6.20, 39.78], [-6.47, 39.57], [-6.48, 39.32],
  [-6.18, 39.12], [-5.72, 39.18],
]

// Pemba island
const PEMBA: [number, number][] = [
  [-4.97, 39.67], [-4.97, 39.90], [-5.35, 40.02],
  [-5.48, 39.78], [-5.30, 39.62], [-4.97, 39.67],
]

// Large world polygon — the outer ring of the inverted mask
const WORLD_RING: [number, number][] = [
  [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180],
]

// Tanzania bounds with a small buffer
const TZ_BOUNDS: [[number, number], [number, number]] = [[-13, 28], [0, 42]]

interface Props {
  prices: PriceRecord[]
  fuel: FuelType
  onDistrictClick?: (name: string) => void
}

function BoundsAdjuster() {
  const map = useMap()
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    map.setView([-6.369, 34.888], isMobile ? 5 : 6)
    map.setMaxBounds(TZ_BOUNDS)
    map.setMinZoom(5)
  }, [map])
  return null
}

export default function PriceMap({ prices, fuel, onDistrictClick }: Props) {
  const priceKey = `${fuel}_price` as keyof PriceRecord

  const mapped = prices
    .map(p => {
      const coords = getDistrictCoords(p.district_name.toLowerCase())
      if (!coords) return null
      return { ...p, coords, price: p[priceKey] as number }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  const prices_only = mapped.map(p => p.price)
  const min = Math.min(...prices_only)
  const max = Math.max(...prices_only)

  return (
    <MapContainer
      center={[-6.369, 34.888]}
      zoom={6}
      minZoom={5}
      maxBounds={TZ_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%', borderRadius: '1rem', minHeight: 420 }}
      scrollWheelZoom={true}
      className="z-0"
    >
      <BoundsAdjuster />

      {/* Base map — subtle light tiles for context inside Tanzania */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      {/* Inverted mask — white overlay covering everything outside Tanzania */}
      <Polygon
        positions={[WORLD_RING, TANZANIA_MAINLAND, ZANZIBAR_UNGUJA, PEMBA]}
        pathOptions={{
          fillColor: '#f8fafc',
          fillOpacity: 1,
          stroke: false,
          fillRule: 'evenodd',
        }}
      />

      {/* District markers */}
      {mapped.map(p => {
        const color = priceToColor(p.price, min, max)
        const isCheap = p.price <= min + (max - min) * 0.25
        const isDear  = p.price >= min + (max - min) * 0.75
        return (
          <CircleMarker
            key={p.district_name}
            center={p.coords}
            radius={7}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.85,
              color: '#fff',
              weight: 1.5,
            }}
            eventHandlers={{ click: () => onDistrictClick?.(p.district_name) }}
          >
            <Popup maxWidth={220}>
              <div className="text-sm">
                <p className="font-bold text-slate-800 mb-1">{cleanDistrictName(p.district_name)}</p>
                <div className="space-y-0.5 text-xs">
                  <p><span className="text-blue-600 font-semibold">Petrol:</span> {fmtPrice(p.petrol_price)}</p>
                  <p><span className="text-emerald-600 font-semibold">Diesel:</span> {fmtPrice(p.diesel_price)}</p>
                  <p><span className="text-amber-600 font-semibold">Kerosene:</span> {fmtPrice(p.kerosene_price)}</p>
                </div>
                {isCheap && <p className="mt-2 text-emerald-600 text-xs font-semibold">✓ Among cheapest</p>}
                {isDear  && <p className="mt-2 text-red-500 text-xs font-semibold">↑ Among most expensive</p>}
                {onDistrictClick && (
                  <button
                    onClick={() => onDistrictClick(p.district_name)}
                    className="mt-2 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800"
                  >
                    View full history →
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      {/* Legend */}
      <div className="leaflet-bottom leaflet-right" style={{ pointerEvents: 'none' }}>
        <div className="leaflet-control m-4 bg-white rounded-xl shadow-lg px-3 py-2 text-xs">
          <p className="font-semibold text-slate-700 mb-1.5 capitalize">{fuel} price</p>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full" style={{
              background: 'linear-gradient(to right, rgb(16,185,129), rgb(245,158,11), rgb(239,68,68))'
            }} />
          </div>
          <div className="flex justify-between mt-0.5 text-slate-400">
            <span>{fmtPrice(min)}</span>
            <span>{fmtPrice(max)}</span>
          </div>
        </div>
      </div>
    </MapContainer>
  )
}
