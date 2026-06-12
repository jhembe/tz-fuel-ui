import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { type TrendPoint } from '../../lib/api'
import { type ForecastPoint } from '../../lib/api'
import { fmtDateShort, fmtPrice, type FuelType } from '../../lib/utils'

const COLORS: Record<FuelType, { line: string; area: string }> = {
  petrol:   { line: '#2563eb', area: '#dbeafe' },
  diesel:   { line: '#059669', area: '#d1fae5' },
  kerosene: { line: '#d97706', area: '#fef3c7' },
}

interface Props {
  historical: TrendPoint[]
  forecast: ForecastPoint[]
  fuel: FuelType
  height?: number
}

export default function ForecastChart({ historical, forecast, fuel, height = 340 }: Props) {
  const c = COLORS[fuel]
  const avgKey = `${fuel}_avg` as keyof TrendPoint
  const fKey = `${fuel}_forecast` as keyof ForecastPoint
  const ciLow = `${fuel}_ci_low` as keyof ForecastPoint
  const ciHigh = `${fuel}_ci_high` as keyof ForecastPoint

  const hist = historical.slice(-24).map(d => ({
    date: fmtDateShort(d.effective_date), actual: d[avgKey], forecast: null, ci_low: null, ci_high: null,
  }))
  const fcast = forecast.map(d => ({
    date: fmtDateShort(d.projected_date), actual: null,
    forecast: d[fKey], ci_low: d[ciLow], ci_high: d[ciHigh],
  }))
  const data = [...hist, ...fcast]
  const splitAt = fmtDateShort(forecast[0]?.projected_date ?? '')

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.line} stopOpacity={0.12} />
            <stop offset="100%" stopColor={c.line} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
        <Tooltip
          formatter={(v: number, name: string) => [fmtPrice(v), name]}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        {splitAt && <ReferenceLine x={splitAt} stroke="#94a3b8" strokeDasharray="4 4"
          label={{ value: 'Forecast →', fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }} />}
        <Area type="monotone" dataKey="ci_high" name="95% CI High" stroke="none" fill="url(#ciGrad)" legendType="none" />
        <Area type="monotone" dataKey="ci_low" name="95% CI Low" stroke="none" fill="#ffffff" legendType="none" />
        <Line type="monotone" dataKey="actual" name="Historical" stroke={c.line} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
        <Line type="monotone" dataKey="forecast" name="Forecast" stroke={c.line} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
