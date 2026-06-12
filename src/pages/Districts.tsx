import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Spinner, SectionHeader } from '../components/ui/Spinner'
import FuelSelector from '../components/ui/FuelSelector'
import TrendAreaChart from '../components/charts/TrendAreaChart'
import { fmtPrice, fmtDate, cleanDistrictName, type FuelType } from '../lib/utils'
import { districtToRegion } from '../lib/regionMap'
import { Search, X, ArrowUpDown } from 'lucide-react'

type SortKey = 'name' | 'petrol' | 'diesel' | 'kerosene'

export default function Districts() {
  const [q, setQ] = useState('')
  const [fuel, setFuel] = useState<FuelType>('petrol')
  const [sort, setSort] = useState<SortKey>('petrol')
  const [sortAsc, setSortAsc] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const { data: latest, isLoading } = useQuery({ queryKey: ['latest'], queryFn: api.latestPrices })
  const { data: history, isLoading: hLoading } = useQuery({
    queryKey: ['district-history', selected],
    queryFn: () => api.districtHistory(selected!),
    enabled: !!selected,
  })

  const filtered = useMemo(() => {
    const rows = latest?.prices ?? []
    const ql = q.toLowerCase()
    return rows
      .filter(r => !ql || r.district_name.toLowerCase().includes(ql) || cleanDistrictName(r.district_name).toLowerCase().includes(ql))
      .sort((a, b) => {
        let diff = 0
        if (sort === 'name') diff = cleanDistrictName(a.district_name).localeCompare(cleanDistrictName(b.district_name))
        else if (sort === 'petrol') diff = a.petrol_price - b.petrol_price
        else if (sort === 'diesel') diff = a.diesel_price - b.diesel_price
        else diff = a.kerosene_price - b.kerosene_price
        return sortAsc ? diff : -diff
      })
  }, [latest, q, sort, sortAsc])

  function toggleSort(k: SortKey) {
    if (sort === k) setSortAsc(!sortAsc)
    else { setSort(k); setSortAsc(true) }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 group">
      {label}
      <ArrowUpDown size={11} className={sort === k ? 'text-brand-500' : 'text-slate-300 group-hover:text-slate-500'} />
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search districts…"
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <FuelSelector value={fuel} onChange={setFuel} />
        <p className="text-sm text-slate-400">{filtered.length} districts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {isLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">
                      <SortBtn k="name" label="District" />
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase">Region</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-blue-500 uppercase">
                      <SortBtn k="petrol" label="Petrol" />
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-emerald-500 uppercase">
                      <SortBtn k="diesel" label="Diesel" />
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-amber-500 uppercase">
                      <SortBtn k="kerosene" label="Kerosene" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const isSelected = selected === d.district_name
                    const region = districtToRegion(d.district_name.toLowerCase())
                    return (
                      <tr key={d.district_name}
                        onClick={() => setSelected(isSelected ? null : d.district_name)}
                        className={`border-b border-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                        <td className="py-2.5 px-4">
                          <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {cleanDistrictName(d.district_name)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-400">{region}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-blue-700">{fmtPrice(d.petrol_price)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">{fmtPrice(d.diesel_price)}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-amber-700">{fmtPrice(d.kerosene_price)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* District detail */}
        <div className="card space-y-4">
          {selected && history ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{cleanDistrictName(selected)}</h3>
                  <p className="text-xs text-slate-400">{history.total_records} periods on record</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              {(() => {
                const lr = history.history[history.history.length - 1]
                return lr ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(['petrol', 'diesel', 'kerosene'] as const).map(f => {
                      const p = lr[`${f}_price` as keyof typeof lr] as number
                      const bg = f === 'petrol' ? 'bg-blue-50' : f === 'diesel' ? 'bg-emerald-50' : 'bg-amber-50'
                      const tc = f === 'petrol' ? 'text-blue-700' : f === 'diesel' ? 'text-emerald-700' : 'text-amber-700'
                      return (
                        <div key={f} className={`rounded-xl ${bg} p-2.5 text-center`}>
                          <p className={`text-xs font-medium ${tc} capitalize`}>{f}</p>
                          <p className={`text-sm font-bold ${tc} mt-0.5`}>{fmtPrice(p)}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : null
              })()}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Price History</p>
                {hLoading ? <Spinner /> : (
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
                    height={180}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">Select a district</p>
              <p className="text-xs text-slate-400 mt-1">to view its price history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
