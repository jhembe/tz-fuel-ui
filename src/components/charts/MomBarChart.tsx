import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { type TrendPoint } from '../../lib/api'
import { fmtDateShort, type FuelType } from '../../lib/utils'

interface Props { data: TrendPoint[]; fuel: FuelType; height?: number }

const KEY: Record<FuelType, keyof TrendPoint> = {
  petrol: 'petrol_change_pct',
  diesel: 'diesel_change_pct',
  kerosene: 'kerosene_change_pct',
}
const COLOR: Record<FuelType, string> = { petrol: '#2563eb', diesel: '#059669', kerosene: '#d97706' }

export default function MomBarChart({ data, fuel, height = 200 }: Props) {
  const formatted = data
    .filter(d => d[KEY[fuel]] != null)
    .map(d => ({ date: fmtDateShort(d.effective_date), value: d[KEY[fuel]] as number }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={38} />
        <Tooltip formatter={(v: number) => [`${v?.toFixed(2)}%`, 'MoM Change']} labelStyle={{ fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#e2e8f0" />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {formatted.map((d, i) => (
            <Cell key={i} fill={d.value >= 0 ? COLOR[fuel] : '#ef4444'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
