import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, fmtPrice, fmtPct } from '../../lib/utils'
import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number | null | undefined
  change?: number | null
  subtitle?: string
  icon?: ReactNode
  accentColor?: string
  loading?: boolean
}

export default function StatCard({ label, value, change, subtitle, icon, accentColor = '#f59e0b', loading }: Props) {
  const trend = change == null ? null : change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'flat'

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
        <div className="h-8 w-32 bg-slate-100 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '20' }}>
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {fmtPrice(value)}
      </p>
      <div className="flex items-center gap-2">
        {trend === 'up' && <TrendingUp size={14} className="stat-up" />}
        {trend === 'down' && <TrendingDown size={14} className="stat-down" />}
        {trend === 'flat' && <Minus size={14} className="text-slate-400" />}
        {change != null && (
          <span className={cn('text-xs font-semibold', trend === 'up' ? 'stat-up' : trend === 'down' ? 'stat-down' : 'text-slate-400')}>
            {fmtPct(change)}
          </span>
        )}
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
    </motion.div>
  )
}
