import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, TrendingUp, BarChart3, Globe, List, GitCompare,
  BookOpen, Fuel, X, ChevronLeft, ChevronRight, FileText,
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

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: Props) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col',
        'bg-[#0f2937] text-white',
        'transition-all duration-300 ease-in-out',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          'flex items-center border-b border-white/10 shrink-0',
          collapsed ? 'justify-center px-0 py-[1.125rem]' : 'justify-between px-6 py-5'
        )}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Fuel size={18} className="text-white" />
          </div>
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
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} />
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
            onClick={onClose}
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

      {/* Bottom: data-source badge + collapse toggle */}
      <div className="border-t border-white/10 shrink-0">
        {!collapsed && (
          <div className="px-4 pt-3">
            <div className="rounded-xl bg-white/5 px-3 py-3">
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                Data source
              </p>
              <p className="text-xs text-white/80 mt-1">EWURA official bulletins</p>
              <p className="text-[11px] text-white/40 mt-0.5">2009 – present</p>
            </div>
          </div>
        )}

        {/* Desktop collapse toggle */}
        <div className={cn('py-3', collapsed ? 'flex justify-center' : 'px-4')}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden lg:flex items-center justify-center rounded-xl',
              'text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200',
              collapsed ? 'w-10 h-10' : 'w-full px-3 py-2 gap-2 text-xs'
            )}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
