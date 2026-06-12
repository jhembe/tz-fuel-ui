import { Menu } from 'lucide-react'
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
  '/docs': 'API Documentation',
}

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] ?? 'Dashboard'

  const { data } = useQuery({ queryKey: ['dates'], queryFn: api.dates })
  const latest = data?.dates?.[0]

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 dark:bg-slate-900/80 dark:border-slate-800">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
        <Menu size={20} />
      </button>
      <h1 className="flex-1 text-base font-semibold text-slate-900 dark:text-white">{title}</h1>
      {latest && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Latest data: {fmtDate(latest)}
        </div>
      )}
    </header>
  )
}
