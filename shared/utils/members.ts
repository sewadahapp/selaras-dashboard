export const memberRoles = ['Owner', 'Admin', 'Member'] as const
export type MemberRole = (typeof memberRoles)[number]
export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  status: 'Active' | 'Invited'
}
export interface MemberInvitation {
  name: string
  email: string
  role: MemberRole
}

export function validateInvitation(draft: MemberInvitation, members: Member[]) {
  const errors: Partial<Record<keyof MemberInvitation, string>> = {}
  if (!draft.name.trim()) errors.name = 'Enter a name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.email = 'Enter a valid email address.'
  else if (
    members.some(
      (member) =>
        member.email.toLowerCase() === draft.email.trim().toLowerCase(),
    )
  )
    errors.email = 'This person is already a member or has an invitation.'
  if (!memberRoles.includes(draft.role)) errors.role = 'Choose a role.'
  return errors
}

export function isMember(value: unknown): value is Member {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    ['id', 'name', 'email'].every(
      (key) => typeof item[key] === 'string' && item[key].trim(),
    ) &&
    memberRoles.includes(item.role as MemberRole) &&
    ['Active', 'Invited'].includes(String(item.status))
  )
}

export function isMemberList(value: unknown): value is Member[] {
  return (
    Array.isArray(value) &&
    value.every(isMember) &&
    new Set(value.map((member) => member.id)).size === value.length &&
    new Set(value.map((member) => member.email.toLowerCase())).size ===
      value.length &&
    value.some(
      (member) => member.role === 'Owner' && member.status === 'Active',
    )
  )
}

export function isLastOwner(member: Member, members: Member[]) {
  return (
    member.role === 'Owner' &&
    member.status === 'Active' &&
    members.filter((item) => item.role === 'Owner' && item.status === 'Active')
      .length <= 1
  )
}

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  )
}
