import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Spinner } from '../components/ui/Spinner'
import { FileText, ExternalLink, Search, Calendar, Database } from 'lucide-react'
import { fmtDate } from '../lib/utils'

function formatMonth(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function Documents() {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: api.documents,
    staleTime: 5 * 60 * 1000,
  })

  const docs = data?.documents ?? []

  const filtered = search.trim()
    ? docs.filter(d => {
        const q = search.toLowerCase()
        return d.effective_date?.includes(q) || formatMonth(d.effective_date).toLowerCase().includes(q)
      })
    : docs

  // Group by year
  const byYear = filtered.reduce<Record<string, typeof docs>>((acc, doc) => {
    const year = doc.effective_date?.split('-')[0] ?? 'Unknown'
    if (!acc[year]) acc[year] = []
    acc[year].push(doc)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="card bg-gradient-to-br from-[#0f2937] to-[#1a4562] text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <FileText size={20} className="text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">EWURA Price Bulletins</h2>
                <p className="text-white/60 text-sm">Official monthly fuel cap price announcements</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {data && (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <Database size={14} className="text-white/60" />
                <span>{data.total} bulletins imported</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-white/50 text-xs leading-relaxed">
          All bulletins are sourced from EWURA (Energy and Water Utilities Regulatory Authority) Tanzania.
          Each PDF contains official maximum retail prices for petrol, diesel, and kerosene across all districts.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by year or month (e.g. 2024, January)"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
        />
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="card">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="card text-center py-8">
          <p className="text-slate-500 text-sm">No bulletins found. Run a backfill sync to import historical data.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-slate-500 text-sm">No bulletins match your search.</p>
        </div>
      )}

      {/* Grouped by year */}
      {years.map(year => (
        <div key={year} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">{year}</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
              {byYear[year].length} bulletin{byYear[year].length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Effective Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                    Records
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    Synced
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {byYear[year].map((doc, i) => (
                  <tr
                    key={doc.effective_date}
                    className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{formatMonth(doc.effective_date)}</p>
                          <p className="text-xs text-slate-400">{fmtDate(doc.effective_date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-slate-600">
                        {doc.records_imported > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {doc.records_imported.toLocaleString()} districts
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-400">
                        {doc.synced_at ? fmtDate(doc.synced_at.slice(0, 10)) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <a
                        href={api.pdfUrl(doc.effective_date)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors"
                      >
                        <ExternalLink size={12} />
                        {doc.has_local_pdf ? 'View PDF' : 'Fetch PDF'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Footer note */}
      {data && data.total > 0 && (
        <div className="card text-sm text-slate-500 bg-slate-50">
          <p className="font-semibold text-slate-700 mb-1">About these bulletins</p>
          <p className="text-xs leading-relaxed">
            EWURA publishes monthly fuel cap price bulletins in PDF format. These documents set the maximum
            retail prices that fuel stations across Tanzania may charge. The prices shown in this dashboard
            are extracted directly from these official bulletins. Click "View PDF" to read the original
            source document for any pricing period.
          </p>
        </div>
      )}
    </div>
  )
}
