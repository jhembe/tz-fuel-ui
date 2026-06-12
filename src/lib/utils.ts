import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtPrice(v: number | null | undefined): string {
  if (v == null) return '—'
  return `TZS ${v.toLocaleString('en-TZ', { maximumFractionDigits: 0 })}`
}

export function fmtPct(v: number | null | undefined, plusSign = true): string {
  if (v == null) return '—'
  const sign = plusSign && v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
}

export function fmtDate(d: string | null | undefined, fmt = 'd MMM yyyy'): string {
  if (!d) return '—'
  try { return format(parseISO(d), fmt) } catch { return d }
}

export function fmtDateShort(d: string): string {
  return fmtDate(d, 'MMM yy')
}

/** Fix OCR artifacts: "K Ilosa" → "Kilosa", "M Orogoro" → "Morogoro" */
export function cleanDistrictName(raw: string): string {
  let s = raw.trim()
  // Collapse single-letter prefix: "K Ilosa" → "Kilosa"
  s = s.replace(/\b([A-Za-z]) ([A-Z][a-z])/g, '$1$2')
  // Second pass for residuals like "R Ungwe" → "Rungwe"
  s = s.replace(/\b([A-Za-z]) ([A-Z][a-z])/g, '$1$2')
  return s
}

export function fuelColor(fuel: string): string {
  if (fuel === 'petrol')   return '#2563eb'
  if (fuel === 'diesel')   return '#059669'
  if (fuel === 'kerosene') return '#d97706'
  return '#6b7280'
}

export function fuelBg(fuel: string): string {
  if (fuel === 'petrol')   return 'bg-blue-100 text-blue-800'
  if (fuel === 'diesel')   return 'bg-emerald-100 text-emerald-800'
  if (fuel === 'kerosene') return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-800'
}

export function priceToColor(price: number, min: number, max: number): string {
  if (max === min) return '#10b981'
  const t = (price - min) / (max - min)
  const r = Math.round(16 + t * (239 - 16))
  const g = Math.round(185 - t * (185 - 68))
  const b = Math.round(129 - t * (129 - 68))
  return `rgb(${r},${g},${b})`
}

export type FuelType = 'petrol' | 'diesel' | 'kerosene'
export const FUELS: FuelType[] = ['petrol', 'diesel', 'kerosene']
