import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import PriceMap from '../components/map/PriceMap'
import FuelSelector from '../components/ui/FuelSelector'
import { Spinner } from '../components/ui/Spinner'
import { type FuelType, cleanDistrictName, fmtPrice, fmtDate } from '../lib/utils'
import TrendAreaChart from '../components/charts/TrendAreaChart'
import { X } from 'lucide-react'

export default function MapExplorer() {
  const [fuel, setFuel] = useState<FuelType>('petrol')
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const { data: latest, isLoading } = useQuery({ queryKey: ['latest'], queryFn: api.latestPrices })
  const { data: history } = useQuery({
    queryKey: ['district-history', selectedDistrict],
    queryFn: () => api.districtHistory(selectedDistrict!),
    enabled: !!selectedDistrict,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <FuelSelector value={fuel} onChange={setFuel} />
        <p className="text-sm text-slate-500">
          {latest ? `${latest.total_districts} districts · ${fmtDate(latest.effective_date)}` : 'Loading...'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden" style={{ height: 520 }}>
          {isLoading ? (
            <Spinner />
          ) : latest ? (
            <PriceMap
              prices={latest.prices}
              fuel={fuel}
              onDistrictClick={setSelectedDistrict}
            />
          ) : null}
        </div>

        {/* Side panel */}
        <div className="card space-y-4 overflow-y-auto" style={{ maxHeight: 520 }}>
          {selectedDistrict && history ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{cleanDistrictName(selectedDistrict)}</h3>
                  <p className="text-xs text-slate-400">{history.total_records} pricing periods</p>
                </div>
                <button onClick={() => setSelectedDistrict(null)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* Latest prices */}
              {(() => {
                const latest_h = history.history[history.history.length - 1]
                return latest_h ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
                      const price = latest_h[`${f}_price` as keyof typeof latest_h] as number
                      const color = f === 'petrol' ? 'blue' : f === 'diesel' ? 'emerald' : 'amber'
                      return (
                        <div key={f} className={`rounded-xl bg-${color}-50 p-2.5 text-center`}>
                          <p className={`text-xs font-medium text-${color}-600 capitalize`}>{f}</p>
                          <p className={`text-sm font-bold text-${color}-700 mt-0.5`}>{fmtPrice(price)}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : null
              })()}

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Price History</p>
                <TrendAreaChart
                  data={history.history.map(h => ({
                    effective_date: h.effective_date,
                    petrol_avg: h.petrol_price,
                    diesel_avg: h.diesel_price,
                    kerosene_avg: h.kerosene_price,
                    district_count: 1,
                    petrol_change_pct: null,
                    diesel_change_pct: null,
                    kerosene_change_pct: null,
                  }))}
                  height={200}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-xl">📍</span>
              </div>
              <p className="text-sm font-medium text-slate-700">Click a district</p>
              <p className="text-xs text-slate-400 mt-1">to see price details and history</p>
            </div>
          )}
        </div>
      </div>

      {/* Price color scale explanation */}
      <div className="card py-3">
        <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Map key:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Cheapest
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Mid-range
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Most expensive
          </div>
          <span className="ml-auto">{latest?.prices?.length ?? 0} districts plotted · click any dot for details</span>
        </div>
      </div>
    </div>
  )
}
