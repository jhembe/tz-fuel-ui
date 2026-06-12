const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface PriceRecord {
  district_name: string
  region_name: string
  petrol_price: number
  diesel_price: number
  kerosene_price: number
  effective_date: string
}

export interface LatestPricesResponse {
  effective_date: string
  total_districts: number
  prices: PriceRecord[]
}

export interface NationalStats {
  effective_date: string
  petrol: { avg: number; min: number; max: number; cheapest_district: string; most_expensive_district: string }
  diesel:  { avg: number; min: number; max: number; cheapest_district: string; most_expensive_district: string }
  kerosene:{ avg: number; min: number; max: number; cheapest_district: string; most_expensive_district: string }
}

export interface TrendPoint {
  effective_date: string
  petrol_avg: number
  diesel_avg: number
  kerosene_avg: number
  district_count: number
  petrol_change_pct: number | null
  diesel_change_pct: number | null
  kerosene_change_pct: number | null
}

export interface TrendResponse {
  from_date: string
  to_date: string
  periods: number
  data: TrendPoint[]
}

export interface VolatilityEntry {
  district_name: string
  region_name: string
  periods_analysed: number
  petrol_cv: number
  diesel_cv: number
  kerosene_cv: number
  petrol_max_swing_pct: number
  diesel_max_swing_pct: number
  kerosene_max_swing_pct: number
}

export interface VolatilityResponse {
  periods_analysed: number
  min_periods_required: number
  most_volatile: VolatilityEntry[]
  most_stable: VolatilityEntry[]
}

export interface RegionalGapPoint {
  effective_date: string
  petrol_min: number; petrol_max: number; petrol_avg: number
  petrol_spread: number; petrol_spread_pct: number
  diesel_spread: number; diesel_spread_pct: number
  kerosene_spread: number; kerosene_spread_pct: number
  district_count: number
}

export interface RegionalGapResponse {
  from_date: string
  to_date: string
  periods: number
  avg_petrol_spread: number
  max_petrol_spread: number
  max_petrol_spread_date: string
  data: RegionalGapPoint[]
}

export interface AllTimeRecord {
  fuel_type: string
  record_type: string
  value: number
  effective_date: string
  district_name?: string
  region_name?: string
  note: string
}

export interface PeakRecordsResponse {
  generated_at: string
  records: AllTimeRecord[]
}

export interface InflationPoint {
  effective_date: string
  petrol_avg: number; diesel_avg: number; kerosene_avg: number
  petrol_index: number; diesel_index: number; kerosene_index: number
  petrol_cumulative_pct: number; diesel_cumulative_pct: number; kerosene_cumulative_pct: number
}

export interface InflationResponse {
  base_date: string
  base_petrol_avg: number; base_diesel_avg: number; base_kerosene_avg: number
  total_periods: number
  petrol_annualised_rate: number; diesel_annualised_rate: number; kerosene_annualised_rate: number
  data: InflationPoint[]
}

export interface CorrelationMatrix { petrol_diesel: number; petrol_kerosene: number; diesel_kerosene: number }

export interface CorrelationResponse {
  periods_analysed: number
  from_date: string; to_date: string
  national_average_correlation: CorrelationMatrix
  interpretation: Record<string, string>
}

export interface ForecastPoint {
  projected_date: string
  petrol_forecast: number; diesel_forecast: number; kerosene_forecast: number
  petrol_ci_low: number; petrol_ci_high: number
  diesel_ci_low: number; diesel_ci_high: number
  kerosene_ci_low: number; kerosene_ci_high: number
}

export interface ForecastResponse {
  model: string
  model_aic: number | null
  model_comparison: Record<string, { aic: number | null; r_squared: number | null; converged: boolean; selected: boolean; note?: string; error?: string }>
  periods_used: number
  from_date: string; to_date: string
  avg_period_days: number
  r_squared: Record<string, number>
  trend_direction: Record<string, string>
  brent_last_known: number | null
  brent_forecast_inputs: number[] | null
  fx_last_known: number | null
  fx_forecast_inputs: number[] | null
  forecast: ForecastPoint[]
  disclaimer: string
}

export interface BrentPoint {
  price_date: string
  price_usd: number
}

export interface BrentResponse {
  count: number
  from_date: string
  to_date: string
  latest_price_usd: number
  series: BrentPoint[]
}

export interface DocumentEntry {
  effective_date: string
  pdf_url: string | null
  records_imported: number
  synced_at: string
  has_local_pdf: boolean
}

export interface DocumentsResponse {
  total: number
  documents: DocumentEntry[]
}

export interface RegionalSummaryEntry {
  region_name: string
  district_count: number
  petrol_avg: number; diesel_avg: number; kerosene_avg: number
  petrol_min: number; petrol_max: number
}

export interface RegionalSummaryResponse {
  effective_date: string
  regions: RegionalSummaryEntry[]
}

export interface DistrictHistory {
  district_name: string
  region_name: string
  total_records: number
  history: { effective_date: string; petrol_price: number; diesel_price: number; kerosene_price: number }[]
}

export interface AvailableDatesResponse { dates: string[]; total: number }

export interface CompareResponse {
  comparison_date: string
  districts: {
    district_name: string; region_name: string
    petrol_price: number; diesel_price: number; kerosene_price: number
  }[]
}

export interface CheapestEntry {
  district_name: string; region_name: string; price: number; effective_date: string
}

// ── API functions ──────────────────────────────────────────────────────────

export const api = {
  latestPrices: () =>
    get<LatestPricesResponse>('/v1/prices/latest'),

  stats: () =>
    get<NationalStats>('/v1/stats'),

  cheapest: (fuel_type: string, limit = 10) =>
    get<{ fuel_type: string; effective_date: string; results: CheapestEntry[] }>('/v1/cheapest', { fuel_type, limit }),

  search: (q: string) =>
    get<{ query: string; results: PriceRecord[] }>('/v1/search', { q }),

  districtHistory: (name: string) =>
    get<DistrictHistory>(`/v1/prices/district/${encodeURIComponent(name)}/history`),

  compare: (district1: string, district2: string, district3?: string) =>
    get<CompareResponse>('/v1/compare', { district1, district2, district3 }),

  dates: () =>
    get<AvailableDatesResponse>('/v1/dates'),

  trend: (from_date?: string, to_date?: string) =>
    get<TrendResponse>('/v1/analytics/trend', { from_date, to_date }),

  volatility: (top = 15, min_periods = 12) =>
    get<VolatilityResponse>('/v1/analytics/volatility', { top, min_periods }),

  regionalGap: (from_date?: string, to_date?: string) =>
    get<RegionalGapResponse>('/v1/analytics/regional-gap', { from_date, to_date }),

  peak: () =>
    get<PeakRecordsResponse>('/v1/analytics/peak'),

  inflation: (base_date?: string) =>
    get<InflationResponse>('/v1/analytics/inflation', { base_date }),

  correlation: (from_date?: string, to_date?: string) =>
    get<CorrelationResponse>('/v1/analytics/correlation', { from_date, to_date }),

  forecast: (periods = 6, training_periods = 24) =>
    get<ForecastResponse>('/v1/analytics/forecast', { periods, training_periods }),

  regionalSummary: (date?: string) =>
    get<RegionalSummaryResponse>('/v1/analytics/regional-summary', { date }),

  brent: () =>
    get<BrentResponse>('/v1/analytics/brent'),

  documents: () =>
    get<DocumentsResponse>('/v1/documents'),

  pdfUrl: (date: string) => {
    const base = import.meta.env.VITE_API_URL ?? '/api'
    return `${base}/v1/documents/${date}/pdf`
  },
}
