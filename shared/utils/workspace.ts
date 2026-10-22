import { isCustomer, type Customer } from './customers'
import { isMemberList, type Member } from './members'

export const defaultSettings = {
  name: 'Studio workspace',
  email: 'hello@example.com',
  weeklyDigest: true,
  customerUpdates: false,
}
export interface SavedWorkspace {
  customers: Customer[]
  settings: typeof defaultSettings
  members?: Member[]
}

export function parseWorkspace(value: unknown): SavedWorkspace {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid saved workspace')
  const data = value as Record<string, unknown>
  if (
    !Array.isArray(data.customers) ||
    !data.customers.every(isCustomer) ||
    new Set(data.customers.map((customer) => customer.id)).size !==
      data.customers.length
  )
    throw new Error('Invalid saved customers')
  if (!data.settings || typeof data.settings !== 'object')
    throw new Error('Invalid saved preferences')
  const settings = data.settings as Record<string, unknown>
  if (
    typeof settings.name !== 'string' ||
    typeof settings.email !== 'string' ||
    typeof settings.weeklyDigest !== 'boolean' ||
    typeof settings.customerUpdates !== 'boolean'
  )
    throw new Error('Invalid saved preferences')
  if (data.members !== undefined && !isMemberList(data.members))
    throw new Error('Invalid saved members')
  return {
    customers: data.customers,
    settings: {
      name: settings.name,
      email: settings.email,
      weeklyDigest: settings.weeklyDigest,
      customerUpdates: settings.customerUpdates,
    },
    members: data.members as Member[] | undefined,
  }
}
