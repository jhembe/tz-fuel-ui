import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import StatCard from '../components/ui/StatCard'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import TrendAreaChart from '../components/charts/TrendAreaChart'
import { fmtDate, fmtPrice, cleanDistrictName } from '../lib/utils'
import { Fuel, TrendingUp, TrendingDown, Award, MapPin, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function PriceRow({ rank, name, price, color }: { rank: number; name: string; price: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">{rank}</span>
      <span className="flex-1 text-sm text-slate-700 truncate">{cleanDistrictName(name)}</span>
      <span className="text-sm font-semibold" style={{ color }}>{fmtPrice(price)}</span>
    </div>
  )
}

export default function Overview() {
  const { data: stats, isLoading: sLoading } = useQuery({ queryKey: ['stats'], queryFn: api.stats })
  const { data: trend } = useQuery({ queryKey: ['trend'], queryFn: () => api.trend() })
  const { data: cheapest } = useQuery({ queryKey: ['cheapest-petrol'], queryFn: () => api.cheapest('petrol', 5) })
  const { data: latest } = useQuery({ queryKey: ['latest'], queryFn: api.latestPrices })

  const lastTrend = trend?.data?.slice(-1)[0]
  const prevTrend = trend?.data?.slice(-2, -1)[0]
  const petrolChg = lastTrend && prevTrend ? (lastTrend.petrol_avg - prevTrend.petrol_avg) / prevTrend.petrol_avg * 100 : null
  const dieselChg = lastTrend && prevTrend ? (lastTrend.diesel_avg - prevTrend.diesel_avg) / prevTrend.diesel_avg * 100 : null
  const keroChg   = lastTrend && prevTrend ? (lastTrend.kerosene_avg - prevTrend.kerosene_avg) / prevTrend.kerosene_avg * 100 : null

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f2937] to-[#1a4562] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-white/60 mb-1">Tanzania Fuel Prices</p>
            <h2 className="text-3xl font-bold">Live Price Dashboard</h2>
            <p className="text-white/60 text-sm mt-2">
              Official EWURA data · {stats?.effective_date ? fmtDate(stats.effective_date) : '—'} · {latest?.total_districts ?? '—'} districts
            </p>
          </div>
          <Link to="/map" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold hover:bg-brand-600 transition-colors">
            <MapPin size={15} /> Explore Map
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
            const s = stats?.[f]
            return (
              <div key={f} className="rounded-xl bg-white/8 p-3">
                <p className="text-xs text-white/50 capitalize mb-1">{f}</p>
                <p className="text-xl font-bold">{fmtPrice(s?.avg)}</p>
                <p className="text-[11px] text-white/40 mt-0.5">avg / litre</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="National Petrol Avg" value={stats?.petrol.avg} change={petrolChg}
          subtitle="vs last period" icon={<Fuel size={16} />} accentColor="#2563eb" loading={sLoading} />
        <StatCard label="National Diesel Avg" value={stats?.diesel.avg} change={dieselChg}
          subtitle="vs last period" icon={<Fuel size={16} />} accentColor="#059669" loading={sLoading} />
        <StatCard label="National Kerosene Avg" value={stats?.kerosene.avg} change={keroChg}
          subtitle="vs last period" icon={<Fuel size={16} />} accentColor="#d97706" loading={sLoading} />
      </div>

      {/* Government diesel subsidy notice */}
      {stats?.effective_date && stats.effective_date >= '2026-06-03' && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Info size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>Government diesel subsidy applied:</strong> The Tanzanian government is subsidising diesel by{' '}
            <strong>TZS 534.91 per litre</strong> (effective 3 Jun 2026) to cushion the impact of global supply disruptions on transport and manufacturing.
            Prices shown reflect this subsidy — actual market cost without subsidy would be ~TZS 535 higher per litre.
          </span>
        </div>
      )}

      {/* Trend chart */}
      <div className="card">
        <SectionHeader title="National Price Trend (2009–present)" subtitle="Monthly average prices across all districts"
          action={<Link to="/trends" className="btn-ghost text-xs">Full analysis →</Link>} />
        {trend ? (
          <TrendAreaChart data={trend.data} height={280} />
        ) : (
          <Spinner />
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cheapest petrol */}
        <div className="card">
          <SectionHeader title="Cheapest Petrol Today" subtitle="Lowest pump prices by district"
            action={<Link to="/districts" className="btn-ghost text-xs">All districts →</Link>} />
          {cheapest?.results?.map((r, i) => (
            <PriceRow key={r.district_name} rank={i + 1} name={r.district_name} price={r.price} color="#2563eb" />
          )) ?? <Spinner />}
        </div>

        {/* Price extremes */}
        <div className="card">
          <SectionHeader title="Price Extremes" subtitle="Cheapest vs most expensive right now" />
          {stats ? (
            <div className="space-y-4">
              {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
                const s = stats[f]
                const color = f === 'petrol' ? '#2563eb' : f === 'diesel' ? '#059669' : '#d97706'
                return (
                  <div key={f} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2 capitalize">{f}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-emerald-600 font-semibold">{fmtPrice(s.min)}</p>
                        <p className="text-xs text-slate-400">{cleanDistrictName(s.cheapest_district)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 font-semibold">{fmtPrice(s.max)}</p>
                        <p className="text-xs text-slate-400">{cleanDistrictName(s.most_expensive_district)}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full">
                      <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(to right, #10b981, ${color}, #ef4444)` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <Spinner />}
        </div>
      </div>
    </div>
  )
}
