import { describe, expect, test } from 'bun:test'
import { demoMembers } from '../../app/data/members'
import {
  isLastOwner,
  isMemberList,
  validateInvitation,
} from '../../shared/utils/members'

describe('demo membership rules', () => {
  test('rejects existing members and invitations regardless of email case', () => {
    expect(
      validateInvitation(
        { name: 'Alya', email: ' ALYA@EXAMPLE.COM ', role: 'Member' },
        demoMembers,
      ).email,
    ).toBeDefined()
    expect(
      validateInvitation(
        { name: 'Nadia', email: 'nadia@example.com', role: 'Admin' },
        demoMembers,
      ).email,
    ).toBeDefined()
    expect(
      validateInvitation(
        { name: ' New Person ', email: ' new@example.com ', role: 'Member' },
        demoMembers,
      ),
    ).toEqual({})
  })
  test('requires a name, a valid email, and a supported role', () => {
    expect(
      Object.keys(
        validateInvitation(
          { name: ' ', email: 'bad', role: 'Invalid' as 'Member' },
          demoMembers,
        ),
      ).sort(),
    ).toEqual(['email', 'name', 'role'])
  })
  test('an invited owner cannot replace the last active owner', () => {
    const owner = demoMembers[0]!
    expect(isLastOwner(owner, demoMembers)).toBe(true)
    const invitedOwner = { ...demoMembers[3]!, role: 'Owner' as const }
    expect(isLastOwner(owner, [...demoMembers, invitedOwner])).toBe(true)
    const activeOwner = { ...demoMembers[1]!, role: 'Owner' as const }
    expect(isLastOwner(owner, [...demoMembers, activeOwner])).toBe(false)
  })
  test('saved members require unique ids/emails and an active owner', () => {
    expect(isMemberList(demoMembers)).toBe(true)
    expect(isMemberList([])).toBe(false)
    expect(isMemberList(demoMembers.slice(1))).toBe(false)
    expect(isMemberList([...demoMembers, demoMembers[0]])).toBe(false)
    expect(
      isMemberList([...demoMembers, { ...demoMembers[0], id: 'another-id' }]),
    ).toBe(false)
    expect(isMemberList([{ ...demoMembers[0], status: 'Unknown' }])).toBe(false)
  })
})
