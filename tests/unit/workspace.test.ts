import { describe, expect, test } from 'bun:test'
import { demoCustomers } from '../../app/data/customers'
import { demoMembers } from '../../app/data/members'
import { defaultSettings, parseWorkspace } from '../../shared/utils/workspace'

const legacy = {
  customers: demoCustomers,
  settings: { ...defaultSettings, name: 'My existing studio' },
}
describe('workspace storage compatibility', () => {
  test('accepts existing saved data without a members field', () => {
    expect(parseWorkspace(legacy)).toEqual({ ...legacy, members: undefined })
  })
  test('round-trips saved members without dropping existing customer edits', () => {
    const saved = {
      ...legacy,
      customers: [{ ...demoCustomers[0]!, company: 'An edited company' }],
      members: demoMembers,
    }
    expect(parseWorkspace(JSON.parse(JSON.stringify(saved)))).toEqual(saved)
  })
  test('rejects corrupt members, duplicate customer ids, and malformed settings atomically', () => {
    expect(() =>
      parseWorkspace({ ...legacy, members: demoMembers.slice(1) }),
    ).toThrow()
    expect(() =>
      parseWorkspace({
        ...legacy,
        customers: [demoCustomers[0], demoCustomers[0]],
      }),
    ).toThrow()
    expect(() =>
      parseWorkspace({
        ...legacy,
        settings: { ...defaultSettings, weeklyDigest: 'true' },
      }),
    ).toThrow()
    expect(() => parseWorkspace(null)).toThrow()
  })
})
