<script setup lang="ts">
import {
  initials,
  isLastOwner,
  memberRoles,
  validateInvitation,
  type Member,
  type MemberInvitation,
  type MemberRole,
} from '#shared/utils/members'
useHead({ title: 'Members · Selaras Dashboard' })
const { members, persist, ready } = useDashboard()
const toast = useToast()
const search = ref('')
const page = ref(1)
const pageSize = 6
const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return members.value.filter((member) =>
    `${member.name} ${member.email}`.toLowerCase().includes(term),
  )
})
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
)
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
watch(search, () => {
  page.value = 1
})
watch(pageCount, (count) => {
  page.value = Math.min(page.value, count)
})
const inviteOpen = ref(false)
const draft = reactive<MemberInvitation>({
  name: '',
  email: '',
  role: 'Member',
})
const errors = ref<ReturnType<typeof validateInvitation>>({})
watch(inviteOpen, (open) => {
  if (open) {
    Object.assign(draft, { name: '', email: '', role: 'Member' })
    errors.value = {}
  }
})
function invite() {
  errors.value = validateInvitation(draft, members.value)
  if (Object.keys(errors.value).length) return
  members.value = [
    ...members.value,
    {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      role: draft.role,
      status: 'Invited',
    },
  ]
  if (persist())
    toast.add({
      title: 'Demo invitation added',
      description: 'Saved locally. No invitation email was sent.',
      color: 'success',
    })
  inviteOpen.value = false
}
function changeRole(member: Member, value: unknown) {
  if (
    typeof value !== 'string' ||
    !memberRoles.includes(value as MemberRole) ||
    value === member.role
  )
    return
  if (isLastOwner(member, members.value)) return
  members.value = members.value.map((item) =>
    item.id === member.id ? { ...item, role: value as MemberRole } : item,
  )
  if (persist())
    toast.add({ title: 'Demo member role updated.', color: 'success' })
}
const removing = ref<Member>()
const removeOpen = ref(false)
function confirmRemove(member: Member) {
  if (!isLastOwner(member, members.value)) {
    removing.value = member
    removeOpen.value = true
  }
}
function remove() {
  const current = members.value.find(
    (member) => member.id === removing.value?.id,
  )
  if (!current || isLastOwner(current, members.value)) return
  members.value = members.value.filter((member) => member.id !== current.id)
  if (persist())
    toast.add({
      title:
        current.status === 'Invited'
          ? 'Demo invitation removed.'
          : 'Demo member removed.',
      color: 'success',
    })
  removeOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-[30px]">
    <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
      <div>
        <h2>Members</h2>
        <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
          Good work starts with good people.
        </p>
      </div>
      <SButton
        icon="hugeicons:user-add-01"
        :disabled="!ready"
        @click="inviteOpen = true"
      >
        Invite member
      </SButton>
    </div>
    <SAlert
      color="info"
      title="Demo team"
      description="Membership and role changes are saved in this browser. Invitations do not send email, and roles do not enforce access permissions. Keep at least one active owner."
    />
    <SCard :ui="{ body: 'p-0' }">
      <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5 max-[1000px]:grid-cols-1 max-[420px]:px-4 max-[420px]:py-4">
        <div class="w-full max-w-[310px] max-[1000px]:max-w-none">
          <SFormField label="Search members" :ui="{ label: 'sr-only' }">
            <SInput
              v-model="search"
              icon="hugeicons:search-01"
              placeholder="Search members…"
              clearable
              :disabled="!ready"
            />
          </SFormField>
        </div>
        <span class="text-[var(--selaras-resolved-text-muted)] text-xs">{{ members.length }} people</span>
      </div>
      <DashboardTableSkeleton v-if="!ready" label="Loading members" />
      <STable
        v-else
        :data="visible"
        :get-row-id="(member: Member) => member.id"
        manual-pagination
        row-hover
        :ui="{
          table: { class: 'min-w-[600px]', 'aria-label': 'Workspace members' },
          wrapper: 'rounded-none ring-0',
          th: 'px-5 py-3',
          td: 'px-5 py-4',
        }"
      >
        <SColumn field="name" header="Member">
          <template #default="{ row }">
            <div class="flex items-center gap-2.5">
              <SAvatar :text="initials(row.name)" :alt="row.name" size="sm" />
              <div>
                <strong class="block text-xs">{{ row.name }}</strong>
                <small class="text-[11px]">{{ row.email }}</small>
              </div>
            </div>
          </template>
        </SColumn>
        <SColumn field="status" header="Status">
          <template #default="{ row }">
            <SBadge
              :color="row.status === 'Active' ? 'success' : 'warning'"
              variant="soft"
              dot
            >
              {{ row.status }}
            </SBadge>
          </template>
        </SColumn>
        <SColumn field="role" header="Role">
          <template #default="{ row }">
            <SSelect
              :model-value="row.role"
              :items="[...memberRoles]"
              :aria-label="`Role for ${row.name}`"
              :disabled="isLastOwner(row, members)"
              @update:model-value="changeRole(row, $event)"
            />
          </template>
        </SColumn>
        <SColumn field="email" header="Actions">
          <template #default="{ row }">
            <SButton
              color="danger"
              size="sm"
              variant="ghost"
              icon="hugeicons:delete-02"
              :aria-label="`Remove ${row.name}`"
              :disabled="isLastOwner(row, members)"
              @click="confirmRemove(row)"
            />
          </template>
        </SColumn>
        <template #empty>
          <div class="px-6 py-[72px] text-center">
            <h3>No members match your search.</h3>
            <p class="my-2 mb-[22px] text-[13px] text-[var(--selaras-resolved-text-muted)]">
              Try a name or email address.
            </p>
            <SButton color="neutral" variant="outline" @click="search = ''">
              Clear search
            </SButton>
          </div>
        </template>
      </STable>
      <div class="flex items-center justify-between border-t border-[var(--selaras-resolved-border-default)] px-6 py-4 text-[11px] max-[420px]:px-4 max-[420px]:py-3.5">
        <span class="text-[var(--selaras-resolved-text-muted)]" aria-live="polite">
          {{ filtered.length }} matching members
        </span>
        <SPagination
          v-model:page="page"
          :total="filtered.length"
          :items-per-page="pageSize"
          :sibling-count="1"
          :show-edges="false"
          :disabled="!ready"
          size="sm"
          aria-label="Member pagination"
        />
      </div>
    </SCard>
    <SModal
      v-model:open="inviteOpen"
      title="Invite member"
      description="Preview a workspace invitation. No email will be sent."
    >
      <template #body>
        <form
          id="invite-member-form"
          class="flex flex-col gap-[22px]"
          novalidate
          @submit.prevent="invite"
        >
          <SFormField label="Full name" required :error="errors.name">
            <SInput v-model="draft.name" autocomplete="name" />
          </SFormField>
          <SFormField label="Email address" required :error="errors.email">
            <SInput v-model="draft.email" type="email" autocomplete="email" />
          </SFormField>
          <SFormField label="Role" :error="errors.role">
            <SSelect
              :model-value="draft.role"
              :items="[...memberRoles]"
              @update:model-value="
                (value) => {
                  if (value) draft.role = value
                }
              "
            />
          </SFormField>
          <p class="text-[var(--selaras-resolved-text-muted)] text-xs">
            This creates a pending invitation in this browser only.
          </p>
        </form>
      </template>
      <template #footer>
        <div class="flex items-center justify-end gap-2.5">
          <SButton
            color="neutral"
            variant="outline"
            @click="inviteOpen = false"
          >
            Cancel
          </SButton>
          <SButton type="submit" form="invite-member-form">
            Add demo invitation
          </SButton>
        </div>
      </template>
    </SModal>
    <SAlertDialog
      v-model:open="removeOpen"
      :title="
        removing?.status === 'Invited'
          ? 'Remove demo invitation?'
          : 'Remove demo member?'
      "
      :description="`${removing?.name || 'This person'} will be removed from the local demo team. No real account or access will change.`"
      action-label="Remove member"
      action-color="danger"
      @confirm="remove"
    />
  </div>
</template>
