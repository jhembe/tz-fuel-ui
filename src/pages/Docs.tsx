import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

const API_BASE = 'https://fuelapi.mahembega.com/api/v1'

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE'
  path: string
  description: string
  params?: { name: string; type: string; required: boolean; description: string }[]
  example?: string
  tag: string
}

const ENDPOINTS: Endpoint[] = [
  {
    tag: 'Prices',
    method: 'GET', path: '/prices/latest',
    description: 'All district prices for the most recent pricing period.',
    example: `curl ${API_BASE}/prices/latest`,
  },
  {
    tag: 'Prices',
    method: 'GET', path: '/prices/district/{name}/history',
    description: 'Full price history for a specific district (all available dates).',
    params: [{ name: 'name', type: 'string', required: true, description: 'District name (URL-encoded)' }],
    example: `curl "${API_BASE}/prices/district/Dodoma/history"`,
  },
  {
    tag: 'Prices',
    method: 'GET', path: '/stats',
    description: 'National average, minimum and maximum prices per fuel type for the latest period.',
    example: `curl ${API_BASE}/stats`,
  },
  {
    tag: 'Prices',
    method: 'GET', path: '/cheapest',
    description: 'Districts with the lowest prices for a given fuel type.',
    params: [
      { name: 'fuel_type', type: 'string', required: true, description: 'petrol | diesel | kerosene' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results (default 10, max 50)' },
    ],
    example: `curl "${API_BASE}/cheapest?fuel_type=petrol&limit=5"`,
  },
  {
    tag: 'Prices',
    method: 'GET', path: '/compare',
    description: 'Side-by-side price comparison for 2–3 districts.',
    params: [
      { name: 'district1', type: 'string', required: true, description: 'First district name' },
      { name: 'district2', type: 'string', required: true, description: 'Second district name' },
      { name: 'district3', type: 'string', required: false, description: 'Optional third district' },
    ],
    example: `curl "${API_BASE}/compare?district1=Dar+Es+Salaam&district2=Dodoma"`,
  },
  {
    tag: 'Discovery',
    method: 'GET', path: '/search',
    description: 'Search for districts by name (fuzzy match).',
    params: [{ name: 'q', type: 'string', required: true, description: 'Search query' }],
    example: `curl "${API_BASE}/search?q=arusha"`,
  },
  {
    tag: 'Discovery',
    method: 'GET', path: '/dates',
    description: 'All available effective pricing dates, newest first.',
    example: `curl ${API_BASE}/dates`,
  },
  {
    tag: 'Discovery',
    method: 'GET', path: '/regions',
    description: 'All distinct region names in the database.',
    example: `curl ${API_BASE}/regions`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/trend',
    description: 'National average petrol, diesel & kerosene per pricing period with month-on-month % change.',
    params: [
      { name: 'from_date', type: 'date', required: false, description: 'Start date YYYY-MM-DD' },
      { name: 'to_date', type: 'date', required: false, description: 'End date YYYY-MM-DD' },
    ],
    example: `curl "${API_BASE}/analytics/trend?from_date=2023-01-01"`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/volatility',
    description: 'District price volatility rankings by coefficient of variation.',
    params: [
      { name: 'top', type: 'integer', required: false, description: 'Districts per group (default 10)' },
      { name: 'min_periods', type: 'integer', required: false, description: 'Minimum data periods (default 12)' },
    ],
    example: `curl "${API_BASE}/analytics/volatility?top=10"`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/regional-gap',
    description: 'Price spread between cheapest and most expensive district per period.',
    example: `curl ${API_BASE}/analytics/regional-gap`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/peak',
    description: 'All-time records: highest/lowest national averages, biggest single-period swings.',
    example: `curl ${API_BASE}/analytics/peak`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/inflation',
    description: 'Cumulative fuel price index (base = 100) + CAGR since a configurable base date.',
    params: [{ name: 'base_date', type: 'date', required: false, description: 'Base date (default = earliest)' }],
    example: `curl "${API_BASE}/analytics/inflation?base_date=2017-01-01"`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/correlation',
    description: 'Pearson correlation coefficients between petrol, diesel & kerosene national averages.',
    example: `curl ${API_BASE}/analytics/correlation`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/forecast',
    description: 'OLS linear regression price projection with 95% confidence intervals.',
    params: [
      { name: 'periods', type: 'integer', required: false, description: 'Forecast periods ahead (default 3, max 12)' },
      { name: 'training_periods', type: 'integer', required: false, description: 'Training window (default 24)' },
    ],
    example: `curl "${API_BASE}/analytics/forecast?periods=6"`,
  },
  {
    tag: 'Analytics',
    method: 'GET', path: '/analytics/regional-summary',
    description: 'Average prices grouped by region for the latest (or specified) pricing period.',
    params: [{ name: 'date', type: 'date', required: false, description: 'Pricing date YYYY-MM-DD (default = latest)' }],
    example: `curl ${API_BASE}/analytics/regional-summary`,
  },
  {
    tag: 'Export',
    method: 'GET', path: '/export/csv',
    description: 'Full dataset export as CSV (district, fuel type, price, date). Compatible with Excel and pandas.',
    example: `curl -o tz_fuel.csv ${API_BASE}/export/csv`,
  },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-slate-400" />}
    </button>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

const TAGS = [...new Set(ENDPOINTS.map(e => e.tag))]

export default function Docs() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const shown = activeTag ? ENDPOINTS.filter(e => e.tag === activeTag) : ENDPOINTS

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="card bg-gradient-to-br from-[#0f2937] to-[#1a4562] text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">API Reference</h2>
            <p className="text-white/60 text-sm mt-1">Tanzania Fuel Price REST API · v2.0</p>
            <code className="mt-3 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm font-mono">{API_BASE}</code>
          </div>
          <a href={`${API_BASE.replace('/api/v1', '')}/docs`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors">
            <ExternalLink size={14} /> Interactive Docs
          </a>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/8 p-3">
            <p className="text-white/50 text-xs mb-1">Authentication</p>
            <p>Public — no API key required for read endpoints</p>
          </div>
          <div className="rounded-xl bg-white/8 p-3">
            <p className="text-white/50 text-xs mb-1">Rate limit</p>
            <p>120 requests / minute per IP</p>
          </div>
        </div>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTag(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!activeTag ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          All
        </button>
        {TAGS.map(t => (
          <button key={t} onClick={() => setActiveTag(t === activeTag ? null : t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTag === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-3">
        {shown.map(ep => (
          <details key={ep.path} className="card group">
            <summary className="flex items-center gap-3 cursor-pointer list-none">
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[ep.method]}`}>
                {ep.method}
              </span>
              <code className="flex-1 text-sm font-mono text-slate-700">/api/v1{ep.path}</code>
              <span className="text-xs text-slate-400 hidden sm:block">{ep.tag}</span>
            </summary>

            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600">{ep.description}</p>

              {ep.params && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Parameters</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-1.5 pr-4 text-xs text-slate-400">Name</th>
                        <th className="text-left py-1.5 pr-4 text-xs text-slate-400">Type</th>
                        <th className="text-left py-1.5 pr-4 text-xs text-slate-400">Required</th>
                        <th className="text-left py-1.5 text-xs text-slate-400">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map(p => (
                        <tr key={p.name} className="border-b border-slate-50">
                          <td className="py-1.5 pr-4 font-mono text-xs text-blue-700">{p.name}</td>
                          <td className="py-1.5 pr-4 text-xs text-slate-500">{p.type}</td>
                          <td className="py-1.5 pr-4">
                            <span className={`text-xs font-semibold ${p.required ? 'text-red-500' : 'text-slate-400'}`}>
                              {p.required ? 'required' : 'optional'}
                            </span>
                          </td>
                          <td className="py-1.5 text-xs text-slate-600">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {ep.example && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Example</p>
                  <div className="flex items-start justify-between rounded-xl bg-slate-900 px-4 py-3">
                    <code className="text-xs text-emerald-400 font-mono leading-relaxed break-all">{ep.example}</code>
                    <CopyBtn text={ep.example} />
                  </div>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

      <div className="card text-sm text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">Data source & coverage</p>
        <p>All prices are official EWURA (Energy and Water Utilities Regulatory Authority) monthly fuel cap prices, sourced from published PDF bulletins. Coverage spans 2009–present across ~190 mainland Tanzania and Zanzibar districts. Prices are in Tanzanian Shillings per litre (TZS/L).</p>
      </div>
    </div>
  )
}
