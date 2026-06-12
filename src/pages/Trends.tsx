import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import TrendAreaChart from '../components/charts/TrendAreaChart'
import MomBarChart from '../components/charts/MomBarChart'
import FuelSelector from '../components/ui/FuelSelector'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import { fmtDate, fmtPrice, fmtPct, type FuelType } from '../lib/utils'

const PRESETS = [
  { label: 'All time', from: undefined, to: undefined },
  { label: '2020–now', from: '2020-01-01', to: undefined },
  { label: '2023–now', from: '2023-01-01', to: undefined },
  { label: 'Last 2 yr', from: '2024-06-01', to: undefined },
]

export default function Trends() {
  const [preset, setPreset] = useState(0)
  const [fuel, setFuel] = useState<FuelType>('petrol')

  const p = PRESETS[preset]
  const { data: trend, isLoading } = useQuery({
    queryKey: ['trend', p.from, p.to],
    queryFn: () => api.trend(p.from, p.to),
  })

  const last  = trend?.data?.slice(-1)[0]
  const prev  = trend?.data?.slice(-2, -1)[0]
  const first = trend?.data?.[0]

  function chg(curr: number | undefined, base: number | undefined) {
    if (!curr || !base) return null
    return (curr - base) / base * 100
  }

  const fuelAvgKey = `${fuel}_avg` as const
  const fuelChgKey = `${fuel}_change_pct` as const

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
          {PRESETS.map((pr, i) => (
            <button key={i} onClick={() => setPreset(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                preset === i ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {pr.label}
            </button>
          ))}
        </div>
        <FuelSelector value={fuel} onChange={setFuel} />
      </div>

      {/* Summary cards */}
      {last && first && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Latest avg', value: last[fuelAvgKey], sub: fmtDate(last.effective_date) },
            { label: 'MoM change', value: null, sub: null, pct: last[fuelChgKey] },
            { label: 'Period start', value: first[fuelAvgKey], sub: fmtDate(first.effective_date) },
            { label: 'Total change', value: null, sub: 'since period start', pct: chg(last[fuelAvgKey], first[fuelAvgKey]) },
          ].map((item, i) => (
            <div key={i} className="card">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              {item.value !== null ? (
                <p className="text-xl font-bold text-slate-900">{fmtPrice(item.value)}</p>
              ) : (
                <p className={`text-xl font-bold ${
                  (item.pct ?? 0) > 0 ? 'text-red-500' : (item.pct ?? 0) < 0 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {fmtPct(item.pct)}
                </p>
              )}
              {item.sub && <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Main trend chart */}
      <div className="card">
        <SectionHeader title="National Average Prices" subtitle={`${trend?.periods ?? '—'} pricing periods · all districts averaged`} />
        {isLoading ? <Spinner /> : trend ? <TrendAreaChart data={trend.data} height={320} /> : null}
      </div>

      {/* MoM change bars */}
      <div className="card">
        <SectionHeader title={`Month-on-Month Change — ${fuel}`} subtitle="% change from previous pricing period" />
        {isLoading ? <Spinner /> : trend ? <MomBarChart data={trend.data} fuel={fuel} height={220} /> : null}
      </div>

      {/* Data table */}
      <div className="card">
        <SectionHeader title="Pricing Period Data" subtitle="Latest 20 periods" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-blue-500 uppercase">Petrol</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-emerald-500 uppercase">Diesel</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-amber-500 uppercase">Kerosene</th>
                <th className="text-right py-2 pl-4 text-xs font-semibold text-slate-400 uppercase">Districts</th>
              </tr>
            </thead>
            <tbody>
              {(trend?.data ?? []).slice(-20).reverse().map(row => (
                <tr key={row.effective_date} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2 pr-4 text-slate-700 font-medium">{fmtDate(row.effective_date)}</td>
                  <td className="py-2 px-4 text-right font-semibold text-blue-700">{fmtPrice(row.petrol_avg)}</td>
                  <td className="py-2 px-4 text-right font-semibold text-emerald-700">{fmtPrice(row.diesel_avg)}</td>
                  <td className="py-2 px-4 text-right font-semibold text-amber-700">{fmtPrice(row.kerosene_avg)}</td>
                  <td className="py-2 pl-4 text-right text-slate-400">{row.district_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
