import {
  customerStatuses,
  filterCustomers,
  type Customer,
  type CustomerStatus,
} from './customers'

export const customerSortFields = [
  'name',
  'company',
  'status',
  'plan',
  'joined',
] as const
export type CustomerSort = { id: string; desc: boolean }
export interface CustomerView {
  search: string
  status: CustomerStatus | 'All statuses'
  sorting: CustomerSort[]
  page: number
}

export function parseCustomerView(
  query: Record<string, unknown>,
): CustomerView {
  const text = (value: unknown) => (typeof value === 'string' ? value : '')
  const status = text(query.status)
  const sorting = text(query.sort)
    .split(',')
    .flatMap((entry) => {
      const [id, direction] = entry.split(':')
      return customerSortFields.some((field) => field === id) &&
        ['asc', 'desc'].includes(direction ?? '')
        ? [{ id: id!, desc: direction === 'desc' }]
        : []
    })
    .filter(
      (sort, index, all) =>
        all.findIndex((other) => other.id === sort.id) === index,
    )
  const page = Number(text(query.page))
  return {
    search: text(query.q),
    status:
      customerStatuses.find((value) => value === status) ?? 'All statuses',
    sorting: sorting.length ? sorting : [{ id: 'joined', desc: true }],
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

export function customerViewQuery(view: CustomerView) {
  return {
    q: view.search || undefined,
    status: view.status === 'All statuses' ? undefined : view.status,
    sort:
      view.sorting
        .map(({ id, desc }) => `${id}:${desc ? 'desc' : 'asc'}`)
        .join(',') || 'joined:desc',
    page: view.page > 1 ? String(view.page) : undefined,
  }
}

export function matchingCustomers(customers: Customer[], view: CustomerView) {
  return filterCustomers(customers, view.search, view.status).sort((a, b) => {
    for (const sort of view.sorting) {
      if (!customerSortFields.some((field) => field === sort.id)) continue
      const field = sort.id as (typeof customerSortFields)[number]
      const comparison = a[field].localeCompare(b[field], 'en', {
        numeric: true,
      })
      if (comparison) return sort.desc ? -comparison : comparison
    }
    return a.id.localeCompare(b.id)
  })
}

export function customerPage(
  customers: Customer[],
  page: number,
  pageSize: number,
) {
  const pageCount = Math.max(1, Math.ceil(customers.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), pageCount)
  return {
    page: currentPage,
    rows: customers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  }
}
