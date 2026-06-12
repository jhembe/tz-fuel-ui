import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import VolatilityChart from '../components/charts/VolatilityChart'
import InflationChart from '../components/charts/InflationChart'
import ForecastChart from '../components/charts/ForecastChart'
import GapChart from '../components/charts/GapChart'
import CorrelationCard from '../components/charts/CorrelationCard'
import FuelSelector from '../components/ui/FuelSelector'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import { fmtDate, fmtPrice, fmtPct, cleanDistrictName, type FuelType } from '../lib/utils'

const BASE_DATES = [
  { label: '2009 (all-time)', value: '2009-01-01' },
  { label: '2015', value: '2015-01-01' },
  { label: '2017', value: '2017-01-01' },
  { label: '2020', value: '2020-01-01' },
]

export default function Analytics() {
  const [fuel, setFuel] = useState<FuelType>('petrol')
  const [volMode, setVolMode] = useState<'volatile' | 'stable'>('volatile')
  const [baseDate, setBaseDate] = useState('2017-01-01')
  const [forecastPeriods, setForecastPeriods] = useState(6)

  const { data: vol, isLoading: vLoading } = useQuery({
    queryKey: ['volatility'], queryFn: () => api.volatility(15, 12),
  })
  const { data: gap, isLoading: gLoading } = useQuery({
    queryKey: ['gap'], queryFn: () => api.regionalGap(),
  })
  const { data: inflation, isLoading: iLoading } = useQuery({
    queryKey: ['inflation', baseDate], queryFn: () => api.inflation(baseDate),
  })
  const { data: corr, isLoading: cLoading } = useQuery({
    queryKey: ['correlation'], queryFn: () => api.correlation(),
  })
  const { data: forecast, isLoading: fLoading } = useQuery({
    queryKey: ['forecast', forecastPeriods], queryFn: () => api.forecast(forecastPeriods, 24),
  })
  const { data: trend } = useQuery({ queryKey: ['trend'], queryFn: () => api.trend() })
  const { data: peak } = useQuery({ queryKey: ['peak'], queryFn: api.peak })

  return (
    <div className="space-y-8">
      {/* All-time records */}
      {peak && (
        <div className="card">
          <SectionHeader title="All-Time Records" subtitle="Highest & lowest national averages since 2009" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
              const hi = peak.records.find(r => r.fuel_type === f && r.record_type === 'highest_national_average')
              const lo = peak.records.find(r => r.fuel_type === f && r.record_type === 'lowest_national_average')
              const jumpRec = peak.records.find(r => r.fuel_type === f && r.record_type === 'biggest_single_period_increase')
              const color = f === 'petrol' ? '#2563eb' : f === 'diesel' ? '#059669' : '#d97706'
              return (
                <div key={f} className="rounded-xl border border-slate-100 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{f}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">All-time high</span>
                      <span className="font-bold text-red-500">{fmtPrice(hi?.value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">All-time low</span>
                      <span className="font-bold text-emerald-600">{fmtPrice(lo?.value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Biggest jump</span>
                      <span className="font-bold text-amber-600">{jumpRec ? `+${fmtPrice(jumpRec.value)}` : '—'}</span>
                    </div>
                    {hi && <p className="text-xs text-slate-400">{fmtDate(hi.effective_date)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Volatility */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">District Price Volatility</h2>
            <p className="text-sm text-slate-500">Coefficient of variation over full history — higher = more price swings</p>
          </div>
          <div className="flex gap-2">
            <FuelSelector value={fuel} onChange={setFuel} />
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
              {(['volatile', 'stable'] as const).map(m => (
                <button key={m} onClick={() => setVolMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    volMode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}>{m === 'volatile' ? '↑ Most volatile' : '↓ Most stable'}</button>
              ))}
            </div>
          </div>
        </div>
        {vLoading ? <Spinner /> : vol ? (
          <VolatilityChart
            entries={volMode === 'volatile' ? vol.most_volatile : vol.most_stable}
            fuel={fuel} mode={volMode} height={300} />
        ) : null}
      </div>

      {/* Regional price gap */}
      <div className="card">
        <SectionHeader title="Geographic Price Inequality"
          subtitle={`Cheapest vs most expensive district spread · avg spread TZS ${gap ? fmtPrice(gap.avg_petrol_spread) : '—'}`} />
        {gLoading ? <Spinner /> : gap ? <GapChart data={gap.data} height={260} /> : null}
        {gap && (
          <p className="text-xs text-slate-400 mt-3">
            Peak spread: <strong>{fmtPrice(gap.max_petrol_spread)}</strong> on {fmtDate(gap.max_petrol_spread_date)}
          </p>
        )}
      </div>

      {/* Inflation index */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Fuel Price Inflation Index</h2>
            <p className="text-sm text-slate-500">Price index (base = 100) showing cumulative price growth</p>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
            {BASE_DATES.map(b => (
              <button key={b.value} onClick={() => setBaseDate(b.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  baseDate === b.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}>{b.label}</button>
            ))}
          </div>
        </div>
        {iLoading ? <Spinner /> : inflation ? (
          <>
            <InflationChart data={inflation.data} height={300} />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
                const rate = inflation[`${f}_annualised_rate` as keyof typeof inflation] as number
                const color = f === 'petrol' ? '#2563eb' : f === 'diesel' ? '#059669' : '#d97706'
                return (
                  <div key={f} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500 capitalize">{f} CAGR</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color }}>{fmtPct(rate, false)}%</p>
                    <p className="text-xs text-slate-400">per year</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* Correlation + Forecast side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="Fuel Price Correlation"
            subtitle={corr ? `${corr.periods_analysed} pricing periods analysed` : ''} />
          {cLoading ? <Spinner /> : corr ? <CorrelationCard data={corr} /> : null}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Price Forecast</h2>
              <p className="text-sm text-slate-500">OLS linear regression with 95% confidence intervals</p>
            </div>
            <div className="flex gap-2 items-center">
              <FuelSelector value={fuel} onChange={setFuel} />
              <select
                value={forecastPeriods}
                onChange={e => setForecastPeriods(Number(e.target.value))}
                className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50"
              >
                {[3, 6, 9, 12].map(n => <option key={n} value={n}>{n} periods</option>)}
              </select>
            </div>
          </div>
          {fLoading ? <Spinner /> : forecast && trend ? (
            <>
              <ForecastChart historical={trend.data} forecast={forecast.forecast} fuel={fuel} height={280} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['petrol', 'diesel', 'kerosene'] as const).map(f => (
                  <div key={f} className="rounded-xl bg-slate-50 p-2 text-center">
                    <p className="text-xs text-slate-400 capitalize">{f} R²</p>
                    <p className="text-sm font-bold text-slate-700">{forecast.r_squared[f]?.toFixed(3)}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">{forecast.disclaimer}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
