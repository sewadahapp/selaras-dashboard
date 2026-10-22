<script setup lang="ts">
import type { Customer, CustomerStatus } from '#shared/utils/customers'
import { initials } from '#shared/utils/members'
import type { TableSortingState } from '@sewadah/selaras/table'

const props = defineProps<{
  customers: Customer[]
  editable?: boolean
  visibility?: Record<string, boolean>
}>()
const emit = defineEmits<{
  edit: [customer: Customer]
  delete: [customer: Customer]
}>()
const selection = defineModel<Record<string, boolean>>('selection', {
  default: () => ({}),
})
const sorting = defineModel<TableSortingState>('sorting', { default: () => [] })
const allSelected = computed(
  () =>
    props.customers.length > 0 &&
    props.customers.every((row) => selection.value[row.id]),
)
const pageSelection = computed(() =>
  allSelected.value
    ? true
    : props.customers.some((row) => selection.value[row.id])
      ? 'indeterminate'
      : false,
)
function selectPage(value: boolean | 'indeterminate') {
  const next = { ...selection.value }
  for (const row of props.customers) {
    if (value === true) next[row.id] = true
    else next[row.id] = false
  }
  selection.value = next
}
function selectRow(customer: Customer, value: boolean | 'indeterminate') {
  const next = { ...selection.value }
  if (value === true) next[customer.id] = true
  else next[customer.id] = false
  selection.value = next
}
function rowItems(customer: Customer) {
  return [
    [
      {
        label: `Edit ${customer.name}`,
        icon: 'hugeicons:pencil-edit-02',
        onSelect: () => emit('edit', customer),
      },
    ],
    [
      {
        label: `Delete ${customer.name}`,
        icon: 'hugeicons:delete-02',
        destructive: true,
        onSelect: () => emit('delete', customer),
      },
    ],
  ]
}
const statusColor: Record<CustomerStatus, 'success' | 'warning' | 'neutral'> = {
  Active: 'success',
  Trial: 'warning',
  Inactive: 'neutral',
}
const date = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
</script>

<template>
  <STable
    v-model:sorting="sorting"
    :data="customers"
    :get-row-id="(customer: Customer) => customer.id"
    :column-visibility="visibility"
    manual-sorting
    manual-pagination
    row-hover
    :ui="{
      table: { class: 'min-w-[700px]', 'aria-label': 'Customers' },
      wrapper: 'rounded-none ring-0',
      th: 'px-5 py-3',
      td: 'px-5 py-4',
    }"
  >
    <SColumn v-if="editable" field="id" header="Select">
      <template #header>
        <SCheckbox
          :model-value="pageSelection"
          :disabled="!customers.length"
          @update:model-value="selectPage"
        >
          <span class="sr-only">Select this page of customers</span>
        </SCheckbox>
      </template>
      <template #default="{ row }">
        <SCheckbox
          :model-value="!!selection[row.id]"
          @update:model-value="selectRow(row, $event)"
        >
          <span class="sr-only">Select {{ row.name }}</span>
        </SCheckbox>
      </template>
    </SColumn>
    <SColumn field="name" header="Customer" :sortable="editable">
      <template #default="{ row }">
        <div class="flex items-center gap-2.5">
          <SAvatar
            :text="initials(row.name)"
            :alt="row.name"
            size="sm"
            color="neutral"
          />
          <div>
            <strong class="block text-xs">{{ row.name }}</strong>
            <small class="text-[11px]">{{ row.email }}</small>
          </div>
        </div>
      </template>
    </SColumn>
    <SColumn field="company" header="Company" :sortable="editable" />
    <SColumn field="status" header="Status" :sortable="editable">
      <template #default="{ row }">
        <SBadge
          :color="statusColor[row.status as CustomerStatus]"
          variant="soft"
          dot
        >
          {{ row.status }}
        </SBadge>
      </template>
    </SColumn>
    <SColumn field="plan" header="Plan" :sortable="editable" />
    <SColumn field="joined" header="Joined" :sortable="editable">
      <template #default="{ row }">
        <span class="text-[var(--selaras-resolved-text-muted)]">{{ date(row.joined) }}</span>
      </template>
    </SColumn>
    <SColumn v-if="editable" field="email" header="Actions">
      <template #default="{ row }">
        <SDropdown :items="rowItems(row)" :positioning="{ align: 'end' }">
          <SButton
            size="sm"
            variant="ghost"
            color="neutral"
            icon="hugeicons:more-horizontal"
            :aria-label="`Actions for ${row.name}`"
          />
        </SDropdown>
      </template>
    </SColumn>
    <template #empty><slot name="empty" /></template>
  </STable>
</template>
