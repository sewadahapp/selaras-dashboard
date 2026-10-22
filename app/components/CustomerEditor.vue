<script setup lang="ts">
import {
  customerPlans,
  customerStatuses,
  validateCustomer,
  type Customer,
  type CustomerDraft,
  type CustomerErrors,
} from '#shared/utils/customers'

const props = defineProps<{ customer?: Customer }>()
const open = defineModel<boolean>('open', { default: false })
const { customers, persist } = useDashboard()
const toast = useToast()
const errors = ref<CustomerErrors>({})
const draft = reactive<CustomerDraft>({
  name: '',
  email: '',
  company: '',
  status: 'Trial',
  plan: 'Starter',
})

watch(open, (value) => {
  if (!value) return
  errors.value = {}
  Object.assign(
    draft,
    props.customer
      ? {
          name: props.customer.name,
          email: props.customer.email,
          company: props.customer.company,
          status: props.customer.status,
          plan: props.customer.plan,
        }
      : { name: '', email: '', company: '', status: 'Trial', plan: 'Starter' },
  )
})

function save() {
  errors.value = validateCustomer(draft, customers.value, props.customer?.id)
  if (Object.keys(errors.value).length) return
  const customer: Customer = {
    id: props.customer?.id ?? crypto.randomUUID(),
    joined: props.customer?.joined ?? new Date().toISOString().slice(0, 10),
    ...draft,
    name: draft.name.trim(),
    email: draft.email.trim(),
    company: draft.company.trim(),
  }
  if (props.customer)
    customers.value = customers.value.map((item) =>
      item.id === customer.id ? customer : item,
    )
  else customers.value.unshift(customer)
  if (persist())
    toast.add({
      title: props.customer
        ? 'Customer updated.'
        : 'Customer added. Welcome aboard!',
      color: 'success',
    })
  open.value = false
}
</script>

<template>
  <SModal
    v-model:open="open"
    :title="customer ? 'Edit customer' : 'Add customer'"
    description="Keep the details that help you stay connected."
  >
    <template #body>
      <form
        id="customer-form"
        class="flex flex-col gap-[22px]"
        novalidate
        @submit.prevent="save"
      >
        <SFormField label="Full name" name="name" required :error="errors.name">
          <SInput
            v-model="draft.name"
            placeholder="Alya Putri"
            autocomplete="name"
          />
        </SFormField>
        <SFormField
          label="Email address"
          name="email"
          required
          :error="errors.email"
        >
          <SInput
            v-model="draft.email"
            type="email"
            placeholder="alya@example.com"
            autocomplete="email"
          />
        </SFormField>
        <SFormField
          label="Company"
          name="company"
          required
          :error="errors.company"
        >
          <SInput
            v-model="draft.company"
            placeholder="Ruang Studio"
            autocomplete="organization"
          />
        </SFormField>
        <div class="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
          <SFormField label="Plan" name="plan" :error="errors.plan">
            <SSelect
              :model-value="draft.plan"
              :items="[...customerPlans]"
              @update:model-value="
                (value) => {
                  if (value) draft.plan = value
                }
              "
            />
          </SFormField>
          <SFormField label="Status" name="status" :error="errors.status">
            <SSelect
              :model-value="draft.status"
              :items="[...customerStatuses]"
              @update:model-value="
                (value) => {
                  if (value) draft.status = value
                }
              "
            />
          </SFormField>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex items-center justify-end gap-2.5">
        <SButton color="neutral" variant="outline" @click="open = false">
          Cancel
        </SButton>
        <SButton type="submit" form="customer-form">
          {{ customer ? 'Save changes' : 'Add customer' }}
        </SButton>
      </div>
    </template>
  </SModal>
</template>
