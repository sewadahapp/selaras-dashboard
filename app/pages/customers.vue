<script setup lang="ts">
import { customersCsv, type Customer } from '#shared/utils/customers'
import {
  customerPage,
  customerViewQuery,
  matchingCustomers,
  parseCustomerView,
  type CustomerView,
} from '#shared/utils/customer-view'

useHead({ title: 'Customers · Selaras Dashboard' })
const { customers, persist, ready } = useDashboard()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const view = computed(() => parseCustomerView(route.query))
function updateView(patch: Partial<CustomerView>) {
  void router.replace({
    query: {
      ...route.query,
      ...customerViewQuery({ ...view.value, ...patch }),
    },
  })
}
const search = computed({
  get: () => view.value.search,
  set: (value: string) => updateView({ search: value, page: 1 }),
})
const status = computed({
  get: () => view.value.status,
  set: (value: CustomerView['status']) =>
    updateView({ status: value, page: 1 }),
})
const sorting = computed({
  get: () => view.value.sorting,
  set: (value) => updateView({ sorting: value, page: 1 }),
})
const pageSize = 6
const filtered = computed(() => matchingCustomers(customers.value, view.value))
const current = computed(() =>
  customerPage(filtered.value, view.value.page, pageSize),
)
const selection = ref<Record<string, boolean>>({})
const selected = computed(() =>
  filtered.value.filter((customer) => selection.value[customer.id]),
)
const visibility = ref<Record<string, boolean>>({})
const optionalColumns = [
  { id: 'company', label: 'Company' },
  { id: 'status', label: 'Status' },
  { id: 'plan', label: 'Plan' },
  { id: 'joined', label: 'Joined' },
]
watch([search, status], () => {
  selection.value = {}
})
watch(customers, (rows) => {
  const ids = new Set(rows.map((row) => row.id))
  selection.value = Object.fromEntries(
    Object.entries(selection.value).filter(([id]) => ids.has(id)),
  )
})
watch([ready, () => current.value.page, () => view.value.page], () => {
  if (ready.value && current.value.page !== view.value.page)
    updateView({ page: current.value.page })
})
const editorOpen = ref(false)
const editing = ref<Customer>()
const deleting = ref<Customer[]>([])
const deleteOpen = ref(false)
function edit(customer?: Customer) {
  editing.value = customer
  editorOpen.value = true
}
function clearFilters() {
  updateView({ search: '', status: 'All statuses', page: 1 })
}
function confirmDelete(rows: Customer[]) {
  deleting.value = [...rows]
  deleteOpen.value = true
}
function remove() {
  const ids = new Set(deleting.value.map((row) => row.id))
  const count = customers.value.filter((row) => ids.has(row.id)).length
  customers.value = customers.value.filter((row) => !ids.has(row.id))
  if (persist())
    toast.add({
      title: count === 1 ? 'Customer deleted.' : `${count} customers deleted.`,
      color: 'success',
    })
  deleteOpen.value = false
}
function exportCsv(rows = filtered.value, filename = 'customers.csv') {
  try {
    const url = URL.createObjectURL(
      new Blob([customersCsv(rows)], { type: 'text/csv;charset=utf-8;' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.add({ title: `Exported ${rows.length} customers.`, color: 'success' })
  } catch {
    toast.add({
      title: 'Export failed',
      description: 'Try exporting again.',
      color: 'danger',
    })
  }
}
</script>

<template>
  <div>
    <PageHeading
      eyebrow="GOOD PEOPLE, GOOD WORK"
      title="Customers"
      description="A little more connected. Manage the people behind your business."
    >
      <SButton
        color="neutral"
        variant="outline"
        icon="hugeicons:download-02"
        :disabled="!filtered.length || !ready"
        @click="exportCsv()"
      >
        Export
      </SButton>
      <SButton icon="hugeicons:add-01" :disabled="!ready" @click="edit()">
        Add customer
      </SButton>
    </PageHeading>
    <SCard :ui="{ body: 'p-0' }">
      <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5 max-[1000px]:grid-cols-1 max-[420px]:px-4 max-[420px]:py-4">
        <div class="w-full max-w-[310px] max-[1000px]:max-w-none">
          <SFormField label="Search customers" :ui="{ label: 'sr-only' }">
            <SInput
              v-model="search"
              icon="hugeicons:search-01"
              placeholder="Search name, email, or company…"
              clearable
              :disabled="!ready"
            />
          </SFormField>
        </div>
        <div class="flex flex-nowrap items-center gap-2.5 max-[1000px]:justify-start max-[420px]:flex-wrap">
          <SSelect
            class="w-[220px] flex-[0_0_220px] max-[420px]:w-[min(100%,220px)] max-[420px]:flex-[1_1_180px]"
            :model-value="status"
            :items="['All statuses', 'Active', 'Trial', 'Inactive']"
            aria-label="Filter by status"
            :disabled="!ready"
            @update:model-value="
              (value) => {
                if (typeof value === 'string') status = value
              }
            "
          />
          <SPopover align="end">
            <SButton
              color="neutral"
              variant="outline"
              icon="hugeicons:table-columns-split"
            >
              Columns
            </SButton>
            <template #content>
              <div
                class="flex min-w-[180px] flex-col gap-3"
                role="group"
                aria-label="Visible customer columns"
              >
                <p class="text-[var(--selaras-resolved-text-muted)] text-xs">Show columns</p>
                <SCheckbox
                  v-for="column in optionalColumns"
                  :key="column.id"
                  :model-value="visibility[column.id] !== false"
                  :label="column.label"
                  @update:model-value="
                    visibility = { ...visibility, [column.id]: $event === true }
                  "
                />
              </div>
            </template>
          </SPopover>
        </div>
      </div>
      <Transition name="selection-bar">
        <div v-if="selected.length" class="selection-bar-clip">
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--selaras-resolved-border-default)] bg-[var(--selaras-resolved-color-primary-subtle)] px-6 py-3 text-xs max-[420px]:px-4"
            aria-label="Selected customers"
          >
            <span role="status">{{ selected.length }} selected</span>
            <div class="flex flex-wrap items-center gap-2.5">
              <SButton
                size="sm"
                color="neutral"
                variant="outline"
                @click="exportCsv(selected, 'selected-customers.csv')"
              >
                Export selected
              </SButton>
              <SButton
                size="sm"
                color="danger"
                variant="soft"
                @click="confirmDelete(selected)"
              >
                Delete selected
              </SButton>
              <SButton
                size="sm"
                color="neutral"
                variant="ghost"
                @click="selection = {}"
              >
                Clear selection
              </SButton>
            </div>
          </div>
        </div>
      </Transition>
      <DashboardTableSkeleton v-if="!ready" label="Loading customers" />
      <CustomerTable
        v-else
        v-model:selection="selection"
        v-model:sorting="sorting"
        :customers="current.rows"
        :visibility="visibility"
        editable
        @edit="edit"
        @delete="confirmDelete([$event])"
      >
        <template #empty>
          <div class="px-6 py-[72px] text-center">
            <SIcon name="hugeicons:user-search-01" class="mb-[18px] inline-flex size-12 items-center justify-center rounded-[14px] bg-[var(--selaras-resolved-surface-elevated)] text-2xl" />
            <h2>
              {{
                customers.length
                  ? 'No one here by that name.'
                  : 'Meet your first customer.'
              }}
            </h2>
            <p class="my-2 mb-[22px] text-[13px] text-[var(--selaras-resolved-text-muted)]">
              {{
                customers.length
                  ? 'Try another search or give your filters a fresh start.'
                  : 'Add your first customer to get started.'
              }}
            </p>
            <SButton
              v-if="customers.length"
              color="neutral"
              variant="outline"
              @click="clearFilters"
            >
              Clear filters
            </SButton>
            <SButton v-else @click="edit()">Add customer</SButton>
          </div>
        </template>
      </CustomerTable>
      <div class="flex items-center justify-between border-t border-[var(--selaras-resolved-border-default)] px-6 py-4 text-[11px] max-[420px]:px-4 max-[420px]:py-3.5">
        <span class="text-[var(--selaras-resolved-text-muted)]" aria-live="polite">
          {{ filtered.length ? (current.page - 1) * pageSize + 1 : 0 }}–{{
            Math.min(current.page * pageSize, filtered.length)
          }}
          of {{ filtered.length }} customers
        </span>
        <SPagination
          :page="current.page"
          :total="filtered.length"
          :items-per-page="pageSize"
          :sibling-count="1"
          :show-edges="false"
          :disabled="!ready"
          size="sm"
          aria-label="Customer pagination"
          @update:page="updateView({ page: $event })"
        />
      </div>
    </SCard>
    <CustomerEditor v-model:open="editorOpen" :customer="editing" />
    <SAlertDialog
      v-model:open="deleteOpen"
      :title="
        deleting.length === 1
          ? 'Delete customer?'
          : `Delete ${deleting.length} customers?`
      "
      :description="`${deleting.length === 1 ? deleting[0]?.name : 'These selected customers'} will be removed from this demo workspace. This cannot be undone.`"
      :action-label="
        deleting.length === 1 ? 'Delete customer' : 'Delete customers'
      "
      action-color="danger"
      @confirm="remove"
    />
  </div>
</template>

<style scoped>
.selection-bar-clip {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows 120ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 90ms ease-out;
}

.selection-bar-clip > div {
  min-height: 0;
  overflow: hidden;
}

.selection-bar-enter-from,
.selection-bar-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .selection-bar-clip {
    transition: none;
  }
}
</style>
