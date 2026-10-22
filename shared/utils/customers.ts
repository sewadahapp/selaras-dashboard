export const customerStatuses = ['Active', 'Trial', 'Inactive'] as const
export const customerPlans = ['Starter', 'Growth', 'Scale'] as const
export type CustomerStatus = (typeof customerStatuses)[number]
export type CustomerPlan = (typeof customerPlans)[number]

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  status: CustomerStatus
  plan: CustomerPlan
  joined: string
}

export type CustomerDraft = Pick<
  Customer,
  'name' | 'email' | 'company' | 'status' | 'plan'
>
export type CustomerErrors = Partial<Record<keyof CustomerDraft, string>>

export function validateCustomer(
  draft: CustomerDraft,
  customers: Customer[],
  editingId?: string,
): CustomerErrors {
  const errors: CustomerErrors = {}
  if (!draft.name.trim()) errors.name = 'Enter a name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.email = 'Enter a valid email address.'
  else if (
    customers.some(
      (customer) =>
        customer.id !== editingId &&
        customer.email.toLowerCase() === draft.email.trim().toLowerCase(),
    )
  )
    errors.email = 'This email already belongs to a customer.'
  if (!draft.company.trim()) errors.company = 'Enter a company.'
  if (!customerStatuses.includes(draft.status))
    errors.status = 'Choose a status.'
  if (!customerPlans.includes(draft.plan)) errors.plan = 'Choose a plan.'
  return errors
}

export function filterCustomers(
  customers: Customer[],
  search: string,
  status: string,
) {
  const term = search.trim().toLowerCase()
  return customers.filter(
    (customer) =>
      (status === 'All statuses' || customer.status === status) &&
      [customer.name, customer.email, customer.company].some((value) =>
        value.toLowerCase().includes(term),
      ),
  )
}

export function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const joined = item.joined
  if (
    typeof joined !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(joined) ||
    !Number.isFinite(Date.parse(joined)) ||
    new Date(joined).toISOString().slice(0, 10) !== joined
  )
    return false
  return (
    ['id', 'name', 'email', 'company', 'joined'].every(
      (key) => typeof item[key] === 'string',
    ) &&
    customerStatuses.includes(item.status as CustomerStatus) &&
    customerPlans.includes(item.plan as CustomerPlan)
  )
}

export function customersCsv(customers: Customer[]) {
  const escape = (value: string) => {
    // Quoting alone does not prevent spreadsheet formulas from executing.
    const safe = /^[=+@\-\t\r\n]/.test(value) ? `'${value}` : value
    return `"${safe.replaceAll('"', '""')}"`
  }
  return [
    ['Name', 'Email', 'Company', 'Status', 'Plan', 'Joined'],
    ...customers.map((customer) => [
      customer.name,
      customer.email,
      customer.company,
      customer.status,
      customer.plan,
      customer.joined,
    ]),
  ]
    .map((row) => row.map(escape).join(','))
    .join('\r\n')
}
