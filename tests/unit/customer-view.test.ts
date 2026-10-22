import { describe, expect, test } from 'bun:test'
import { demoCustomers } from '../../app/data/customers'
import {
  customerPage,
  customerViewQuery,
  matchingCustomers,
  parseCustomerView,
} from '../../shared/utils/customer-view'

describe('shareable customer views', () => {
  test('rejects malformed query values and unknown sort columns', () => {
    expect(
      parseCustomerView({
        q: ['one', 'two'],
        status: 'unknown',
        page: 'Infinity',
        sort: 'email:asc,__proto__:desc',
      }),
    ).toEqual({
      search: '',
      status: 'All statuses',
      sorting: [{ id: 'joined', desc: true }],
      page: 1,
    })
    for (const page of ['0', '-2', '1.5', '9007199254740992'])
      expect(parseCustomerView({ page }).page).toBe(1)
  })
  test('round-trips a combined filter, multiple sort columns, and page', () => {
    const view = parseCustomerView({
      q: 'Studio',
      status: 'Active',
      sort: 'company:asc,name:desc,name:asc',
      page: '2',
    })
    expect(view.sorting).toEqual([
      { id: 'company', desc: false },
      { id: 'name', desc: true },
    ])
    expect(parseCustomerView(customerViewQuery(view))).toEqual(view)
  })
  test('sorting and paging do not mutate customer records or positional selection ids', () => {
    const source = structuredClone(demoCustomers)
    const view = parseCustomerView({ sort: 'name:asc' })
    const sorted = matchingCustomers(source, view)
    const selection = { [source[0]!.id]: true }
    expect(sorted[0]!.name).toBe(
      [...source].sort((a, b) => a.name.localeCompare(b.name, 'en'))[0]!.name,
    )
    expect(sorted.filter((row) => selection[row.id])).toEqual([source[0]!])
    expect(source).toEqual(demoCustomers)
    expect(customerPage(sorted, 999, 6)).toEqual({
      page: 2,
      rows: sorted.slice(6, 12),
    })
    expect(customerPage([], 999, 6)).toEqual({ page: 1, rows: [] })
  })
})
