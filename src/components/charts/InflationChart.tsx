import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { type InflationPoint } from '../../lib/api'
import { fmtDateShort } from '../../lib/utils'

interface Props { data: InflationPoint[]; height?: number }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
      <p className="text-slate-400 mt-1">Index (base = 100)</p>
    </div>
  )
}

export default function InflationChart({ data, height = 320 }: Props) {
  const formatted = data.map(d => ({ ...d, date: fmtDateShort(d.effective_date) }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={42}
          tickFormatter={v => `${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: 'Base', fill: '#94a3b8', fontSize: 11 }} />
        <Line type="monotone" dataKey="petrol_index" name="Petrol" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="diesel_index" name="Diesel" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="kerosene_index" name="Kerosene" stroke="#d97706" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
