import { Menu, BarChart2 } from 'lucide-react'
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

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white shadow-md px-4 sm:px-6 lg:px-8 dark:bg-slate-900 dark:border-slate-800">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="flex-1 text-base font-semibold text-slate-900 dark:text-white truncate">
        {title}
      </h1>

      <div className="flex items-center gap-3 shrink-0">
        {brent && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-400">
            <BarChart2 size={12} />
            Brent ${brent.latest_price_usd.toFixed(2)}/bbl
          </div>
        )}

        {latest && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {fmtDate(latest)}
          </div>
        )}
      </div>
    </header>
  )
}
