import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { type TrendPoint } from '../../lib/api'
import { fmtDateShort, fmtPrice } from '../../lib/utils'

interface Props {
  data: TrendPoint[]
  activeFuels?: ('petrol' | 'diesel' | 'kerosene')[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800">{fmtPrice(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendAreaChart({ data, activeFuels = ['petrol', 'diesel', 'kerosene'], height = 320 }: Props) {
  const formatted = data.map(d => ({ ...d, date: fmtDateShort(d.effective_date) }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gPetrol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gDiesel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gKerosene" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`} width={42} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        {activeFuels.includes('petrol') && (
          <Area type="monotone" dataKey="petrol_avg" name="Petrol" stroke="#2563eb" strokeWidth={2}
            fill="url(#gPetrol)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        )}
        {activeFuels.includes('diesel') && (
          <Area type="monotone" dataKey="diesel_avg" name="Diesel" stroke="#059669" strokeWidth={2}
            fill="url(#gDiesel)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        )}
        {activeFuels.includes('kerosene') && (
          <Area type="monotone" dataKey="kerosene_avg" name="Kerosene" stroke="#d97706" strokeWidth={2}
            fill="url(#gKerosene)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
