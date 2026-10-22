export interface ChartDatum {
  label: string
  value: number
}

export const monthlyRevenue: ChartDatum[] = [
  { label: 'May', value: 4200 },
  { label: 'Jun', value: 5800 },
  { label: 'Jul', value: 5100 },
  { label: 'Aug', value: 7300 },
  { label: 'Sep', value: 6800 },
  { label: 'Oct', value: 8900 },
]
export const weeklyRevenue: ChartDatum[] = [
  { label: 'Mon', value: 240 },
  { label: 'Tue', value: 380 },
  { label: 'Wed', value: 290 },
  { label: 'Thu', value: 510 },
  { label: 'Fri', value: 440 },
  { label: 'Sat', value: 680 },
  { label: 'Sun', value: 620 },
]
export const weeklyVisitors: ChartDatum[] = [
  { label: 'Mon', value: 1240 },
  { label: 'Tue', value: 1380 },
  { label: 'Wed', value: 1290 },
  { label: 'Thu', value: 1510 },
  { label: 'Fri', value: 1440 },
  { label: 'Sat', value: 1680 },
  { label: 'Sun', value: 1620 },
]

export function totalValues(data: ChartDatum[]) {
  return data.reduce((total, item) => total + item.value, 0)
}
export const formatUsd = (value: number) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
