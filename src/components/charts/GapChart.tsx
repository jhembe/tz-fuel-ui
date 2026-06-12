import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { type RegionalGapPoint } from '../../lib/api'
import { fmtDateShort, fmtPrice } from '../../lib/utils'

interface Props { data: RegionalGapPoint[]; height?: number }

export default function GapChart({ data, height = 260 }: Props) {
  const formatted = data.map(d => ({
    date: fmtDateShort(d.effective_date),
    spread: d.petrol_spread,
    min: d.petrol_min,
    max: d.petrol_max,
    avg: d.petrol_avg,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`} width={42} />
        <Tooltip
          formatter={(v: number, name: string) => [fmtPrice(v), name === 'spread' ? 'Price Spread' : name]}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Area type="monotone" dataKey="max" name="Most Expensive" stroke="#ef4444" strokeWidth={1.5}
          fill="none" dot={false} strokeDasharray="4 2" />
        <Area type="monotone" dataKey="min" name="Cheapest" stroke="#10b981" strokeWidth={1.5}
          fill="none" dot={false} strokeDasharray="4 2" />
        <Area type="monotone" dataKey="avg" name="National Average" stroke="#2563eb" strokeWidth={2.5}
          fill="url(#spreadGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
