import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { type VolatilityEntry } from '../../lib/api'
import { cleanDistrictName, type FuelType } from '../../lib/utils'

const FUEL_COLOR: Record<FuelType, string> = { petrol: '#2563eb', diesel: '#059669', kerosene: '#d97706' }
const CV_KEY: Record<FuelType, keyof VolatilityEntry> = {
  petrol: 'petrol_cv', diesel: 'diesel_cv', kerosene: 'kerosene_cv',
}

interface Props {
  entries: VolatilityEntry[]
  fuel: FuelType
  mode: 'volatile' | 'stable'
  height?: number
}

export default function VolatilityChart({ entries, fuel, mode, height = 280 }: Props) {
  const color = FUEL_COLOR[fuel]
  const data = [...entries]
    .sort((a, b) =>
      mode === 'volatile'
        ? (b[CV_KEY[fuel]] as number) - (a[CV_KEY[fuel]] as number)
        : (a[CV_KEY[fuel]] as number) - (b[CV_KEY[fuel]] as number)
    )
    .slice(0, 10)
    .map(e => ({
      name: cleanDistrictName(e.district_name).replace(/ \(.+\)/, ''),
      cv: e[CV_KEY[fuel]],
    }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false}
          tickLine={false} width={110} />
        <Tooltip formatter={(v: number) => [`${v?.toFixed(1)}% CV`, 'Volatility']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Bar dataKey="cv" radius={[0, 4, 4, 0]} fill={color} fillOpacity={0.85}>
          <LabelList dataKey="cv" position="right" formatter={(v: number) => `${v?.toFixed(1)}%`}
            style={{ fontSize: 10, fill: '#64748b' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
