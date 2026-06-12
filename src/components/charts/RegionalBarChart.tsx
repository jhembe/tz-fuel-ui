import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { type RegionalSummaryEntry } from '../../lib/api'
import { fmtPrice, type FuelType } from '../../lib/utils'

const FUEL_KEY: Record<FuelType, keyof RegionalSummaryEntry> = {
  petrol: 'petrol_avg', diesel: 'diesel_avg', kerosene: 'kerosene_avg',
}
const COLORS: Record<FuelType, string> = { petrol: '#2563eb', diesel: '#059669', kerosene: '#d97706' }

interface Props {
  data: RegionalSummaryEntry[]
  fuel: FuelType
  onSelect?: (region: string) => void
  selectedRegion?: string
  height?: number
}

export default function RegionalBarChart({ data, fuel, onSelect, selectedRegion, height = 380 }: Props) {
  const color = COLORS[fuel]
  const sorted = [...data].sort((a, b) => (a[FUEL_KEY[fuel]] as number) - (b[FUEL_KEY[fuel]] as number))
  const min = sorted[0]?.[FUEL_KEY[fuel]] as number ?? 0
  const max = sorted[sorted.length - 1]?.[FUEL_KEY[fuel]] as number ?? 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 60, bottom: 0, left: 4 }}
        onClick={d => d?.activePayload?.[0] && onSelect?.(d.activePayload[0].payload.region_name)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`} domain={['dataMin - 100', 'dataMax + 100']} />
        <YAxis type="category" dataKey="region_name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false}
          tickLine={false} width={100}
          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v} />
        <Tooltip formatter={(v: number, _: string, props: any) => [fmtPrice(v), `${fuel} avg`]}
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Bar dataKey={FUEL_KEY[fuel]} radius={[0, 4, 4, 0]} cursor={onSelect ? 'pointer' : 'default'}>
          {sorted.map((entry, i) => {
            const t = (entry[FUEL_KEY[fuel]] as number - min) / (max - min || 1)
            const opacity = 0.5 + t * 0.5
            const isSelected = selectedRegion === entry.region_name
            return (
              <Cell key={i} fill={color} fillOpacity={opacity}
                stroke={isSelected ? color : 'none'} strokeWidth={isSelected ? 2 : 0} />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
