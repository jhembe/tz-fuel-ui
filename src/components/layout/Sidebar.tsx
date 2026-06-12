import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, TrendingUp, BarChart3, Globe, List, GitCompare, BookOpen, Fuel, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const nav = [
  { to: '/',          icon: LayoutDashboard, label: 'Overview' },
  { to: '/map',       icon: Map,             label: 'Price Map' },
  { to: '/trends',    icon: TrendingUp,      label: 'Trends' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/regions',   icon: Globe,           label: 'Regions' },
  { to: '/districts', icon: List,            label: 'Districts' },
  { to: '/compare',   icon: GitCompare,      label: 'Compare' },
  { to: '/docs',      icon: BookOpen,        label: 'API Docs' },
]

interface Props { open: boolean; onClose: () => void }

export default function Sidebar({ open, onClose }: Props) {
  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 flex w-64 flex-col',
      'bg-[#0f2937] text-white',
      'transition-transform duration-300 ease-in-out',
      'lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Fuel size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">TZ Fuel</p>
            <p className="text-[10px] text-white/50 mt-0.5">Price Dashboard</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-white/60 hover:bg-white/8 hover:text-white'
            )}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom badge */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Data source</p>
          <p className="text-xs text-white/80 mt-1">EWURA official bulletins</p>
          <p className="text-[11px] text-white/40 mt-0.5">2009 – present</p>
        </div>
      </div>
    </aside>
  )
}
