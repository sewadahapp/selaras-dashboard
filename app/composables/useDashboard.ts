import { demoCustomers } from '~/data/customers'
import { demoMembers } from '~/data/members'
import type { Customer } from '#shared/utils/customers'
import type { Member } from '#shared/utils/members'
import { defaultSettings, parseWorkspace } from '#shared/utils/workspace'

export function useDashboard() {
  const customers = useState<Customer[]>('dashboard:customers', () =>
    structuredClone(demoCustomers),
  )
  const settings = useState('dashboard:settings', () => ({
    ...defaultSettings,
  }))
  const members = useState<Member[]>('dashboard:members', () =>
    structuredClone(demoMembers),
  )
  const notice = useState('dashboard:notice', () => '')
  const ready = useState('dashboard:ready', () => false)
  const storageAvailable = useState('dashboard:storage', () => true)
  const storageProblem = useState<'load' | 'save' | null>(
    'dashboard:storage-problem',
    () => null,
  )
  const toast = useToast()

  function persist() {
    // Preserve an unreadable saved payload until the user retries or explicitly resets it.
    if (storageProblem.value === 'load') return false
    try {
      localStorage.setItem(
        'selaras-dashboard:v1',
        JSON.stringify({
          customers: customers.value,
          settings: settings.value,
          members: members.value,
        }),
      )
      storageAvailable.value = true
      storageProblem.value = null
      return true
    } catch {
      storageAvailable.value = false
      storageProblem.value = 'save'
      return false
    }
  }

  function initialize() {
    if (ready.value) return
    try {
      const raw = localStorage.getItem('selaras-dashboard:v1')
      if (raw) {
        const data = parseWorkspace(JSON.parse(raw))
        customers.value = data.customers
        settings.value = data.settings
        members.value =
          data.members === undefined
            ? structuredClone(demoMembers)
            : (data.members as Member[])
      }
      storageAvailable.value = true
      storageProblem.value = null
    } catch {
      storageAvailable.value = false
      storageProblem.value = 'load'
    }
    ready.value = true
  }

  function reset() {
    customers.value = structuredClone(demoCustomers)
    settings.value = { ...defaultSettings }
    members.value = structuredClone(demoMembers)
    storageProblem.value = null
    if (persist())
      toast.add({ title: 'Demo workspace reset.', color: 'success' })
  }

  function retryStorage() {
    const problem = storageProblem.value
    if (problem === 'load') {
      ready.value = false
      initialize()
    } else if (problem === 'save') persist()
    if (!storageProblem.value)
      toast.add({
        title: 'Browser storage is available again.',
        color: 'success',
      })
  }

  return {
    customers,
    members,
    settings,
    notice,
    ready,
    storageAvailable,
    storageProblem,
    retryStorage,
    initialize,
    persist,
    reset,
  }
}
