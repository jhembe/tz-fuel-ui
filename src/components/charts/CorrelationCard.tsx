import { type CorrelationResponse } from '../../lib/api'

interface Props { data: CorrelationResponse }

function RBar({ value, label }: { value: number; label: string }) {
  const abs = Math.abs(value)
  const pct = abs * 100
  const color = abs >= 0.95 ? '#2563eb' : abs >= 0.85 ? '#0284c7' : abs >= 0.7 ? '#0ea5e9' : '#64748b'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value.toFixed(3)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function CorrelationCard({ data }: Props) {
  const { national_average_correlation: m, interpretation: i } = data
  return (
    <div className="space-y-5">
      <RBar value={m.petrol_diesel} label="Petrol ↔ Diesel" />
      <RBar value={m.petrol_kerosene} label="Petrol ↔ Kerosene" />
      <RBar value={m.diesel_kerosene} label="Diesel ↔ Kerosene" />
      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
        {Object.entries(i).map(([k, v]) => (
          <p key={k}><span className="font-semibold text-slate-700">{k.replace('_', ' ↔ ')}: </span>{v}</p>
        ))}
      </div>
    </div>
  )
}
