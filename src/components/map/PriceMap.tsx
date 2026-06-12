import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { type PriceRecord } from '../../lib/api'
import { getDistrictCoords } from '../../lib/districtCoords'
import { fmtPrice, cleanDistrictName, type FuelType, priceToColor } from '../../lib/utils'

interface Props {
  prices: PriceRecord[]
  fuel: FuelType
  onDistrictClick?: (name: string) => void
}

function BoundsAdjuster() {
  const map = useMap()
  useEffect(() => {
    map.setView([-6.369, 34.888], 6)
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
      style={{ height: '100%', width: '100%', borderRadius: '1rem', minHeight: 420 }}
      scrollWheelZoom={true}
      className="z-0"
    >
      <BoundsAdjuster />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
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
