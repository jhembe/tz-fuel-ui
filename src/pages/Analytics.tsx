import { useState, useMemo } from 'react'
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
import { Info } from 'lucide-react'

// ── Pearson correlation (frontend, used for Brent correlation) ────────────────
function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 3) return 0
  const xSlice = xs.slice(0, n)
  const ySlice = ys.slice(0, n)
  const xMean = xSlice.reduce((a, b) => a + b, 0) / n
  const yMean = ySlice.reduce((a, b) => a + b, 0) / n
  const num = xSlice.reduce((sum, x, i) => sum + (x - xMean) * (ySlice[i] - yMean), 0)
  const den = Math.sqrt(
    xSlice.reduce((sum, x) => sum + (x - xMean) ** 2, 0) *
    ySlice.reduce((sum, y) => sum + (y - yMean) ** 2, 0)
  )
  return den === 0 ? 0 : Math.round(num / den * 1000) / 1000
}

function interpCorr(r: number): string {
  const a = Math.abs(r)
  const dir = r >= 0 ? 'positive' : 'negative'
  const str = a >= 0.95 ? 'near-perfect' : a >= 0.85 ? 'very strong' : a >= 0.7 ? 'strong' : a >= 0.5 ? 'moderate' : 'weak'
  return `${str} ${dir}`
}

// ── Tooltip component ─────────────────────────────────────────────────────────
function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center ml-1 cursor-help">
      <Info size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl bg-slate-900 text-white text-xs leading-relaxed px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center">
        {text}
      </span>
    </span>
  )
}

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
  const { data: brent } = useQuery({
    queryKey: ['brent'],
    queryFn: api.brent,
    retry: false,
    throwOnError: false,
  })

  // ── Brent ↔ TZ fuel correlation (aligned by year-month) ──────────────────
  const brentCorrelation = useMemo(() => {
    if (!brent?.series?.length || !trend?.data?.length) return null

    const brentMap = new Map<string, number>()
    brent.series.forEach(b => {
      const ym = b.price_date.slice(0, 7)
      brentMap.set(ym, b.price_usd)
    })

    const petrolPrices: number[] = []
    const dieselPrices: number[] = []
    const kerosenePrices: number[] = []
    const brentPrices: number[] = []

    trend.data.forEach(t => {
      const ym = t.effective_date.slice(0, 7)
      // Walk back up to 3 months for nearest Brent price
      let brentVal: number | undefined
      for (let delta = 0; delta <= 3; delta++) {
        const d = new Date(ym + '-01')
        d.setMonth(d.getMonth() - delta)
        const key = d.toISOString().slice(0, 7)
        if (brentMap.has(key)) { brentVal = brentMap.get(key); break }
      }
      if (brentVal !== undefined) {
        petrolPrices.push(t.petrol_avg)
        dieselPrices.push(t.diesel_avg)
        kerosenePrices.push(t.kerosene_avg)
        brentPrices.push(brentVal)
      }
    })

    if (brentPrices.length < 6) return null

    return {
      petrol:   pearson(brentPrices, petrolPrices),
      diesel:   pearson(brentPrices, dieselPrices),
      kerosene: pearson(brentPrices, kerosenePrices),
      n:        brentPrices.length,
      latestBrent: brent.latest_price_usd,
    }
  }, [brent, trend])

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
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center">
              District Price Volatility
              <InfoTip text="Coefficient of variation measures how much a district's price fluctuates relative to its own average. Higher = more price swings over time. A CV of 20% means the price typically moves ±20% around the mean." />
            </h2>
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
        <SectionHeader
          title={
            <span className="inline-flex items-center">
              Geographic Price Inequality
              <InfoTip text="The spread (in TZS/litre) between the cheapest and most expensive district each month. A wider gap means greater price inequality across Tanzania — remote areas often pay more." />
            </span>
          }
          subtitle={`Cheapest vs most expensive district spread · avg spread TZS ${gap ? fmtPrice(gap.avg_petrol_spread) : '—'}`}
        />
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
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center">
              Fuel Price Inflation Index
              <InfoTip text="Tracks cumulative price growth since a chosen base date, normalized to 100. A value of 150 means prices are 50% higher than the base date. CAGR is the compound annual growth rate — how fast prices grew per year on average." />
            </h2>
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
                    <p className="text-xs text-slate-500 capitalize inline-flex items-center justify-center gap-1">
                      {f} CAGR
                      <InfoTip text={`Compound Annual Growth Rate for ${f} — how fast prices grew per year since ${BASE_DATES.find(b => b.value === baseDate)?.label}.`} />
                    </p>
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
          <SectionHeader
            title={
              <span className="inline-flex items-center">
                Fuel Price Correlation
                <InfoTip text="Pearson r measures how similarly two fuel types move together. A value near 1.0 means they rise and fall in near-perfect lockstep (usually driven by the same crude oil pricing)." />
              </span>
            }
            subtitle={corr ? `${corr.periods_analysed} pricing periods analysed` : ''}
          />
          {cLoading ? <Spinner /> : corr ? <CorrelationCard data={corr} /> : null}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center">
                Price Forecast
                <InfoTip text="Uses automated model selection (ARIMA, SARIMA, Holt-Winters ETS). The model with the lowest AIC — a measure of fit-vs-complexity — wins. Shaded area shows 95% confidence intervals. Do not use for financial decisions." />
              </h2>
              <p className="text-sm text-slate-500">
                {forecast ? (
                  <span>
                    {forecast.model}
                    {forecast.brent_last_known != null && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 border border-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Brent ${forecast.brent_last_known.toFixed(2)}/bbl
                      </span>
                    )}
                  </span>
                ) : 'Automated model selection · 95% confidence intervals'}
              </p>
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
                    <p className="text-xs text-slate-400 capitalize inline-flex items-center justify-center gap-1">
                      {f} R²
                      <InfoTip text={`R² (coefficient of determination) for ${f}. A value near 1.0 means the model explains price movements well. Values around 0.2–0.5 are normal for monthly fuel price data.`} />
                    </p>
                    <p className="text-sm font-bold text-slate-700">{forecast.r_squared[f]?.toFixed(3)}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">{forecast.disclaimer}</p>
            </>
          ) : null}
        </div>
      </div>

      {/* Brent crude correlation */}
      {brentCorrelation && (
        <div className="card">
          <SectionHeader
            title={
              <span className="inline-flex items-center">
                Brent Crude ↔ Tanzania Fuel Correlation
                <InfoTip text="How closely international Brent crude oil prices (USD/barrel) correlate with Tanzanian pump prices. A strong positive correlation means global oil markets heavily influence what Tanzanians pay at the pump. Aligned by month across the historical dataset." />
              </span>
            }
            subtitle={`Based on ${brentCorrelation.n} aligned months · Current Brent: $${brentCorrelation.latestBrent.toFixed(2)}/bbl`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {([
              { fuel: 'petrol',   r: brentCorrelation.petrol,   color: '#2563eb' },
              { fuel: 'diesel',   r: brentCorrelation.diesel,   color: '#059669' },
              { fuel: 'kerosene', r: brentCorrelation.kerosene, color: '#d97706' },
            ] as const).map(({ fuel: f, r, color }) => {
              const abs = Math.abs(r)
              const pct = Math.round(abs * 100)
              return (
                <div key={f} className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>{f}</p>
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-bold text-slate-900 tabular-nums">{r.toFixed(3)}</p>
                    <p className={`text-xs font-semibold mb-1 ${abs >= 0.7 ? 'text-emerald-600' : abs >= 0.5 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {interpCorr(r)}
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{pct}% of Brent price movement explains {f} price movement</p>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4 italic">
            Pearson r correlation between monthly Brent crude (USD/barrel) and Tanzania national average {' '}
            pump prices (TZS/litre). Correlation does not imply causation — exchange rates, taxes, and {' '}
            EWURA regulatory decisions also influence local prices.
          </p>
        </div>
      )}
    </div>
  )
}
