import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, TrendingUp, BarChart3, Globe, List, GitCompare,
  BookOpen, Fuel, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Overview' },
  { to: '/map',         icon: Map,             label: 'Price Map' },
  { to: '/trends',      icon: TrendingUp,      label: 'Trends' },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics' },
  { to: '/regions',     icon: Globe,           label: 'Regions' },
  { to: '/districts',   icon: List,            label: 'Districts' },
  { to: '/compare',     icon: GitCompare,      label: 'Compare' },
  { to: '/bulletins',   icon: FileText,        label: 'Bulletins' },
  { to: '/docs',        icon: BookOpen,        label: 'API Docs' },
]

interface Props {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ open: _open, onClose: _onClose, collapsed, onToggleCollapse }: Props) {
  return (
    <aside
      className={cn(
        'hidden lg:flex',
        'fixed inset-y-0 left-0 z-30 flex-col',
        'bg-[#0f2937] text-white',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area + collapse toggle */}
      <div
        className={cn(
          'flex border-b border-white/10 shrink-0',
          collapsed ? 'flex-col items-center py-3 gap-2' : 'items-center justify-between px-6 py-5'
        )}
      >
        {collapsed ? (
          <>
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Fuel size={18} className="text-white" />
            </div>
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ChevronRight size={15} />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
                <Fuel size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">TZ Fuel</p>
                <p className="text-[10px] text-white/50 mt-0.5">Price Dashboard</p>
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ChevronLeft size={15} />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 overflow-y-auto', collapsed ? 'px-2' : 'px-3 space-y-0.5')}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={_onClose}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl text-sm font-medium transition-all',
                collapsed
                  ? 'justify-center w-10 h-10 mx-auto mb-0.5'
                  : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              )
            }
          >
            <Icon size={17} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: data-source badge */}
      {!collapsed && (
        <div className="border-t border-white/10 shrink-0 px-4 py-3">
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Data source
            </p>
            <p className="text-xs text-white/80 mt-1">EWURA official bulletins</p>
            <p className="text-[11px] text-white/40 mt-0.5">2009 – present</p>
          </div>
        </div>
      )}
    </aside>
  )
}
