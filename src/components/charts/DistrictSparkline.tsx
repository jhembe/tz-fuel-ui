import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { type FuelType, fmtPrice } from '../../lib/utils'

interface Entry { effective_date: string; petrol_price: number; diesel_price: number; kerosene_price: number }
interface Props { data: Entry[]; fuel: FuelType; width?: number; height?: number }

const COLOR: Record<FuelType, string> = { petrol: '#2563eb', diesel: '#059669', kerosene: '#d97706' }
const KEY: Record<FuelType, keyof Entry> = { petrol: 'petrol_price', diesel: 'diesel_price', kerosene: 'kerosene_price' }

export default function DistrictSparkline({ data, fuel, height = 40 }: Props) {
  const latest = data.slice(-1)[0]?.[KEY[fuel]] as number | undefined
  const first = data[0]?.[KEY[fuel]] as number | undefined
  const trend = latest && first ? latest - first : 0
  const color = trend > 0 ? '#ef4444' : trend < 0 ? '#10b981' : COLOR[fuel]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={KEY[fuel]} stroke={color} strokeWidth={1.5}
          dot={false} isAnimationActive={false} />
        <Tooltip formatter={(v: number) => [fmtPrice(v), fuel]}
          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11, padding: '4px 8px' }}
          itemStyle={{ margin: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
