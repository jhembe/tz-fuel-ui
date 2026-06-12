import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import RegionalBarChart from '../components/charts/RegionalBarChart'
import TrendAreaChart from '../components/charts/TrendAreaChart'
import FuelSelector from '../components/ui/FuelSelector'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import { fmtPrice, fmtDate, cleanDistrictName, type FuelType } from '../lib/utils'
import { districtToRegion } from '../lib/regionMap'
import { ChevronRight, Home } from 'lucide-react'

export default function Regions() {
  const { region: regionParam, district: districtParam } = useParams()
  const navigate = useNavigate()
  const [fuel, setFuel] = useState<FuelType>('petrol')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(regionParam ?? null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(districtParam ?? null)

  const { data: latest, isLoading: rLoading } = useQuery({ queryKey: ['latest'], queryFn: api.latestPrices })
  const { data: distHistory, isLoading: dLoading } = useQuery({
    queryKey: ['district-history', selectedDistrict],
    queryFn: () => api.districtHistory(selectedDistrict!),
    enabled: !!selectedDistrict,
  })

  // Group latest prices by region using districtToRegion (human-readable names)
  const regionDistricts = useMemo(() => {
    if (!latest) return {}
    const grouped: Record<string, typeof latest.prices> = {}
    for (const p of latest.prices) {
      const region = districtToRegion(p.district_name.toLowerCase())
      if (!grouped[region]) grouped[region] = []
      grouped[region].push(p)
    }
    return grouped
  }, [latest])

  // Build region summary data for the bar chart from latestPrices using human-readable region names
  const regionSummaryData = useMemo(() => {
    return Object.entries(regionDistricts)
      .filter(([r]) => r !== 'Other')
      .map(([region, districts]) => {
        const petrol = districts.map(d => d.petrol_price).filter(Boolean)
        const diesel = districts.map(d => d.diesel_price).filter(Boolean)
        const kerosene = districts.map(d => d.kerosene_price).filter(Boolean)
        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
        return {
          region_name: region,
          district_count: districts.length,
          petrol_avg: Math.round(avg(petrol) * 100) / 100,
          diesel_avg: Math.round(avg(diesel) * 100) / 100,
          kerosene_avg: Math.round(avg(kerosene) * 100) / 100,
          petrol_min: Math.min(...petrol),
          petrol_max: Math.max(...petrol),
        }
      })
  }, [regionDistricts])

  const regionsList = Object.keys(regionDistricts).filter(r => r !== 'Other').sort()
  const currentRegionDistricts = selectedRegion ? (regionDistricts[selectedRegion] ?? []) : []

  // Breadcrumb navigation
  function goToRegion(r: string) {
    setSelectedRegion(r)
    setSelectedDistrict(null)
    navigate(`/regions/${encodeURIComponent(r)}`)
  }
  function goToDistrict(d: string) {
    setSelectedDistrict(d)
    navigate(`/regions/${encodeURIComponent(selectedRegion ?? '')}/${encodeURIComponent(d)}`)
  }
  function goToRoot() {
    setSelectedRegion(null)
    setSelectedDistrict(null)
    navigate('/regions')
  }

  const fuelAvgKey = `${fuel}_avg` as const

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <FuelSelector value={fuel} onChange={setFuel} />
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <button onClick={goToRoot} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
          <Home size={14} /> All Regions
        </button>
        {selectedRegion && (
          <>
            <ChevronRight size={14} className="text-slate-300" />
            <button onClick={() => { setSelectedDistrict(null); navigate(`/regions/${encodeURIComponent(selectedRegion)}`) }}
              className={`font-medium transition-colors ${selectedDistrict ? 'text-slate-500 hover:text-slate-800' : 'text-slate-900'}`}>
              {selectedRegion}
            </button>
          </>
        )}
        {selectedDistrict && (
          <>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-medium text-slate-900">{cleanDistrictName(selectedDistrict)}</span>
          </>
        )}
      </nav>

      {/* Level 1: All regions */}
      {!selectedRegion && (
        <>
          <div className="card">
            <SectionHeader title="Regions by Average Price"
              subtitle={`Latest pricing period · ${fuel} · click a bar to drilldown`} />
            {rLoading ? <Spinner /> : regionSummaryData.length > 0 ? (
              <RegionalBarChart
                data={regionSummaryData}
                fuel={fuel}
                onSelect={goToRegion}
                height={480}
              />
            ) : null}
          </div>

          {/* Region cards */}
          <div>
            <SectionHeader title="All Regions" subtitle={`${regionsList.length} regions with data`} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {regionsList.map(region => {
                const districts = regionDistricts[region] ?? []
                const prices = districts.map(d => d[`${fuel}_price` as keyof typeof d] as number).filter(Boolean)
                const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
                return (
                  <button key={region} onClick={() => goToRegion(region)}
                    className="card text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                    <p className="text-sm font-bold text-slate-900 truncate">{region}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{districts.length} districts</p>
                    <p className="text-lg font-bold mt-2" style={{ color: fuel === 'petrol' ? '#2563eb' : fuel === 'diesel' ? '#059669' : '#d97706' }}>
                      {fmtPrice(avg)}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{fuel} avg</p>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Level 2: Districts within region */}
      {selectedRegion && !selectedDistrict && (
        <div className="space-y-6">
          <div className="card">
            <SectionHeader title={`${selectedRegion} — Districts`}
              subtitle={`${currentRegionDistricts.length} districts · click a district to see full history`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">District</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-blue-500 uppercase">Petrol</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-emerald-500 uppercase">Diesel</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-amber-500 uppercase">Kerosene</th>
                    <th className="text-right py-2 pl-3 text-xs font-semibold text-slate-400 uppercase">vs Region avg</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sorted = [...currentRegionDistricts].sort((a, b) =>
                      (a[`${fuel}_price` as keyof typeof a] as number) - (b[`${fuel}_price` as keyof typeof b] as number)
                    )
                    const fuelPrices = sorted.map(d => d[`${fuel}_price` as keyof typeof d] as number)
                    const regionAvg = fuelPrices.length ? fuelPrices.reduce((a, b) => a + b, 0) / fuelPrices.length : 0
                    return sorted.map(d => {
                      const fp = d[`${fuel}_price` as keyof typeof d] as number
                      const diff = regionAvg ? (fp - regionAvg) / regionAvg * 100 : 0
                      return (
                        <tr key={d.district_name} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => goToDistrict(d.district_name)}>
                          <td className="py-2.5 pr-4">
                            <span className="font-medium text-slate-800">{cleanDistrictName(d.district_name)}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-blue-700">{fmtPrice(d.petrol_price)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">{fmtPrice(d.diesel_price)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-amber-700">{fmtPrice(d.kerosene_price)}</td>
                          <td className="py-2.5 pl-3 text-right">
                            <span className={`text-xs font-semibold ${diff > 1 ? 'text-red-500' : diff < -1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Level 3: District full history */}
      {selectedDistrict && (
        <div className="space-y-6">
          <div className="card">
            <SectionHeader title={cleanDistrictName(selectedDistrict)}
              subtitle={distHistory ? `${distHistory.total_records} pricing periods · ${fmtDate(distHistory.history[0]?.effective_date ?? '')} – ${fmtDate(distHistory.history.slice(-1)[0]?.effective_date ?? '')}` : ''} />
            {dLoading ? <Spinner /> : distHistory ? (
              <TrendAreaChart
                data={distHistory.history.map(h => ({
                  effective_date: h.effective_date,
                  petrol_avg: h.petrol_price,
                  diesel_avg: h.diesel_price,
                  kerosene_avg: h.kerosene_price,
                  district_count: 1,
                  petrol_change_pct: null,
                  diesel_change_pct: null,
                  kerosene_change_pct: null,
                }))}
                height={300}
              />
            ) : null}
          </div>

          {/* Level 4: Raw data table */}
          {distHistory && (
            <div className="card">
              <SectionHeader title="Complete Price History" subtitle="All pricing periods for this district" />
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-blue-500 uppercase">Petrol</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-emerald-500 uppercase">Diesel</th>
                      <th className="text-right py-2 pl-3 text-xs font-semibold text-amber-500 uppercase">Kerosene</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...distHistory.history].reverse().map(h => (
                      <tr key={h.effective_date} className="border-b border-slate-50">
                        <td className="py-2 pr-4 text-slate-700 font-medium">{fmtDate(h.effective_date)}</td>
                        <td className="py-2 px-3 text-right text-blue-700 font-semibold">{fmtPrice(h.petrol_price)}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-semibold">{fmtPrice(h.diesel_price)}</td>
                        <td className="py-2 pl-3 text-right text-amber-700 font-semibold">{fmtPrice(h.kerosene_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
