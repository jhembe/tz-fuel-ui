import { cn, type FuelType } from '../../lib/utils'

const LABELS: Record<FuelType, string> = { petrol: 'Petrol', diesel: 'Diesel', kerosene: 'Kerosene' }
const COLORS: Record<FuelType, string> = {
  petrol:   'data-[active=true]:bg-blue-600 data-[active=true]:text-white',
  diesel:   'data-[active=true]:bg-emerald-600 data-[active=true]:text-white',
  kerosene: 'data-[active=true]:bg-amber-500 data-[active=true]:text-white',
}

interface Props {
  value: FuelType
  onChange: (f: FuelType) => void
  fuels?: FuelType[]
}

export default function FuelSelector({ value, onChange, fuels = ['petrol', 'diesel', 'kerosene'] }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
      {fuels.map(f => (
        <button
          key={f}
          data-active={value === f}
          onClick={() => onChange(f)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
            'text-slate-500 hover:text-slate-800',
            COLORS[f],
            value === f ? 'shadow-sm' : '',
          )}
        >
          {LABELS[f]}
        </button>
      ))}
    </div>
  )
}
