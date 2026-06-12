import { BarChart2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { fmtDate } from '../../lib/utils'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/map': 'Price Map',
  '/trends': 'Historical Trends',
  '/analytics': 'Deep Analytics',
  '/regions': 'Regional Analysis',
  '/districts': 'All Districts',
  '/compare': 'Compare Districts',
  '/bulletins': 'EWURA Price Bulletins',
  '/docs': 'API Documentation',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] ?? 'Dashboard'

  const { data: datesData } = useQuery({ queryKey: ['dates'], queryFn: api.dates })
  const latest = datesData?.dates?.[0]

  const { data: brent } = useQuery({
    queryKey: ['brent'],
    queryFn: api.brent,
    retry: false,
    staleTime: 10 * 60 * 1000,
    throwOnError: false,
  })

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white shadow-sm px-4 sm:px-6 lg:px-8 dark:bg-slate-900 dark:border-slate-800">
      <h1 className="flex-1 text-sm font-semibold text-slate-900 dark:text-white truncate sm:text-base">
        {title}
      </h1>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {brent && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-400">
            <BarChart2 size={11} />
            <span className="hidden sm:inline">Brent </span>${brent.latest_price_usd.toFixed(2)}/bbl
          </div>
        )}

        {latest && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {fmtDate(latest)}
          </div>
        )}
      </div>
    </header>
  )
}
