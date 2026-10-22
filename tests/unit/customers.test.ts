import { describe, expect, test } from 'bun:test'
import { demoCustomers } from '../../app/data/customers'
import {
  customersCsv,
  filterCustomers,
  isCustomer,
  validateCustomer,
  type CustomerDraft,
} from '../../shared/utils/customers'

const draft: CustomerDraft = {
  name: ' New Customer ',
  email: 'new@example.com',
  company: 'Studio',
  status: 'Active',
  plan: 'Growth',
}

describe('customer workflows', () => {
  test('rejects duplicate emails regardless of case and surrounding whitespace', () => {
    expect(
      validateCustomer({ ...draft, email: ' ALYA@EXAMPLE.COM ' }, demoCustomers)
        .email,
    ).toBeDefined()
  })
  test('allows an existing customer to retain their own email when editing', () => {
    expect(
      validateCustomer(
        { ...draft, email: 'alya@example.com' },
        demoCustomers,
        'c01',
      ),
    ).toEqual({})
  })
  test('requires meaningful fields and a usable email', () => {
    const errors = validateCustomer(
      { ...draft, name: ' ', company: ' ', email: 'not-an-email' },
      demoCustomers,
    )
    expect(Object.keys(errors).sort()).toEqual(['company', 'email', 'name'])
  })
  test('combines text search and status filtering without mutating the source', () => {
    const before = structuredClone(demoCustomers)
    expect(
      filterCustomers(demoCustomers, 'KANVAS', 'Trial').map((item) => item.id),
    ).toEqual(['c03'])
    expect(filterCustomers(demoCustomers, 'Kanvas', 'Active')).toEqual([])
    expect(demoCustomers).toEqual(before)
  })
  test('accepts an empty result when the query does not match', () => {
    expect(
      filterCustomers(demoCustomers, 'no-such-customer', 'All statuses'),
    ).toEqual([])
  })
  test('rejects malformed browser storage records', () => {
    expect(isCustomer(null)).toBe(false)
    expect(isCustomer({ ...demoCustomers[0], plan: 'Unknown' })).toBe(false)
    expect(isCustomer({ ...demoCustomers[0], id: undefined })).toBe(false)
    expect(isCustomer({ ...demoCustomers[0], joined: 'not-a-date' })).toBe(
      false,
    )
    expect(isCustomer({ ...demoCustomers[0], joined: '2026-02-31' })).toBe(
      false,
    )
    expect(isCustomer(demoCustomers[0])).toBe(true)
  })
  test('exports quoted CSV and neutralizes spreadsheet formulas', () => {
    const csv = customersCsv([
      { ...demoCustomers[0]!, name: '=HYPERLINK("x")', company: 'One, "Two"' },
    ])
    expect(csv).toContain('"\'=HYPERLINK(""x"")"')
    expect(csv).toContain('"One, ""Two"""')
    expect(csv.split('\r\n')).toHaveLength(2)
  })
})
