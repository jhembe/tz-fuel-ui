import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import { fmtPrice, fmtDate, cleanDistrictName } from '../lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Plus, X } from 'lucide-react'

const DISTRICT_COLORS = ['#2563eb', '#059669', '#d97706']

export default function Compare() {
  const [districts, setDistricts] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const { data: latest } = useQuery({ queryKey: ['latest'], queryFn: api.latestPrices })

  const suggestions = useMemo(() => {
    if (!query || !latest) return []
    const ql = query.toLowerCase()
    return latest.prices
      .filter(p =>
        cleanDistrictName(p.district_name).toLowerCase().includes(ql) &&
        !districts.includes(p.district_name)
      )
      .slice(0, 8)
  }, [query, latest, districts])

  const { data: h0 } = useQuery({ queryKey: ['dh', districts[0]], queryFn: () => api.districtHistory(districts[0]), enabled: !!districts[0] })
  const { data: h1 } = useQuery({ queryKey: ['dh', districts[1]], queryFn: () => api.districtHistory(districts[1]), enabled: !!districts[1] })
  const { data: h2 } = useQuery({ queryKey: ['dh', districts[2]], queryFn: () => api.districtHistory(districts[2]), enabled: !!districts[2] })

  const histories = [h0, h1, h2].slice(0, districts.length)

  // Merge all history data into one array keyed by date
  const merged = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    histories.forEach((h, i) => {
      if (!h) return
      h.history.forEach(row => {
        if (!map[row.effective_date]) map[row.effective_date] = {}
        map[row.effective_date][`petrol_${i}`] = row.petrol_price
        map[row.effective_date][`diesel_${i}`] = row.diesel_price
        map[row.effective_date][`kerosene_${i}`] = row.kerosene_price
      })
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date: date.slice(0, 7), ...vals }))
  }, [histories])

  function addDistrict(name: string) {
    if (districts.length >= 3) return
    setDistricts([...districts, name])
    setQuery('')
  }
  function removeDistrict(name: string) {
    setDistricts(districts.filter(d => d !== name))
  }

  return (
    <div className="space-y-6">
      {/* Search + selected */}
      <div className="card">
        <SectionHeader title="Compare Districts" subtitle="Select up to 3 districts to compare side-by-side" />

        <div className="flex flex-wrap gap-2 mb-4">
          {districts.map((d, i) => (
            <div key={d} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: DISTRICT_COLORS[i] }}>
              {cleanDistrictName(d)}
              <button onClick={() => removeDistrict(d)} className="hover:opacity-70">
                <X size={13} />
              </button>
            </div>
          ))}
          {districts.length < 3 && (
            <div className="relative">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Add district…"
                  className="pl-8 pr-4 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30 w-48"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s.district_name} onClick={() => addDistrict(s.district_name)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <Plus size={13} className="text-slate-400" />
                      {cleanDistrictName(s.district_name)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {districts.length === 0 && (
          <p className="text-sm text-slate-400">Search for a district above to begin comparing.</p>
        )}
      </div>

      {/* Current price comparison */}
      {districts.length > 0 && latest && (
        <div className="card">
          <SectionHeader title="Current Prices" subtitle={`As of ${fmtDate(latest.effective_date)}`} />
          <div className="grid grid-cols-3 gap-3 mb-0">
            {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
              const color = f === 'petrol' ? '#2563eb' : f === 'diesel' ? '#059669' : '#d97706'
              const datas = districts.map(d => {
                const p = latest.prices.find(pr => pr.district_name === d)
                return p ? p[`${f}_price` as keyof typeof p] as number : null
              })
              return (
                <div key={f} className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>{f}</p>
                  {districts.map((d, i) => (
                    <div key={d} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DISTRICT_COLORS[i] }} />
                        <span className="text-xs text-slate-600 truncate max-w-24">{cleanDistrictName(d)}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{fmtPrice(datas[i])}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Historical comparison charts */}
      {merged.length > 0 && districts.length > 0 && (
        <div className="space-y-6">
          {(['petrol', 'diesel', 'kerosene'] as const).map(fuel => {
            const color = fuel === 'petrol' ? '#2563eb' : fuel === 'diesel' ? '#059669' : '#d97706'
            return (
              <div key={fuel} className="card">
                <SectionHeader title={`${fuel.charAt(0).toUpperCase() + fuel.slice(1)} Price History`}
                  subtitle="Full historical comparison" />
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={merged} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(1)}k`} width={38} />
                    <Tooltip formatter={(v: number, name: string) => [fmtPrice(v), name]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    {districts.map((d, i) => (
                      <Line key={d} type="monotone" dataKey={`${fuel}_${i}`}
                        name={cleanDistrictName(d)}
                        stroke={DISTRICT_COLORS[i]} strokeWidth={2}
                        dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
