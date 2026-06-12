import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Map, TrendingUp, BarChart3, Globe, List, GitCompare, BookOpen, MoreHorizontal, X, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'

const PRIMARY = [
  { to: '/',       icon: LayoutDashboard, label: 'Home' },
  { to: '/map',    icon: Map,             label: 'Map' },
  { to: '/trends', icon: TrendingUp,      label: 'Trends' },
  { to: '/analytics', icon: BarChart3,    label: 'Analytics' },
]

const MORE = [
  { to: '/regions',   icon: Globe,      label: 'Regions' },
  { to: '/districts', icon: List,       label: 'Districts' },
  { to: '/compare',   icon: GitCompare, label: 'Compare' },
  { to: '/bulletins', icon: FileText,   label: 'Bulletins' },
  { to: '/docs',      icon: BookOpen,   label: 'API Docs' },
]

const MORE_PATHS = MORE.map(m => m.to)

export default function BottomNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close sheet on navigation
  useEffect(() => { setOpen(false) }, [location.pathname])

  const moreActive = MORE_PATHS.includes(location.pathname)

  return (
    <>
      {/* Sheet overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* More sheet — slides up from bottom */}
      <div className={cn(
        'lg:hidden fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out',
        open ? 'translate-y-0' : 'translate-y-full',
      )} style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">More pages</p>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 px-3 pb-4">
          {MORE.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl py-3.5 px-2 transition-colors',
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'
                )}>
                <Icon size={22} />
                <span className="text-[11px] font-medium leading-none">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-1px_8px_rgba(0,0,0,0.07)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', touchAction: 'none' }}>
        <div className="flex">
          {PRIMARY.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
                isActive ? 'text-brand-500' : 'text-slate-400'
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-lg transition-all',
                    isActive ? 'bg-brand-500/10' : ''
                  )}>
                    <Icon size={17} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
              moreActive || open ? 'text-brand-500' : 'text-slate-400'
            )}
          >
            <span className={cn(
              'flex items-center justify-center w-6 h-6 rounded-lg transition-all',
              (moreActive || open) ? 'bg-brand-500/10' : ''
            )}>
              <MoreHorizontal size={17} />
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  )
}
