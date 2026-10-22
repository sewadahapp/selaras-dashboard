<script setup lang="ts">
import {
  formatUsd,
  monthlyRevenue,
  totalValues,
  weeklyRevenue,
} from '#shared/utils/analytics'
useHead({ title: 'Overview · Selaras Dashboard' })
const { customers } = useDashboard()
const period = ref<'Last 6 months' | 'Last 7 days'>('Last 6 months')
const editorOpen = ref(false)
const chartData = computed(() =>
  period.value === 'Last 7 days' ? weeklyRevenue : monthlyRevenue,
)
const active = computed(
  () =>
    customers.value.filter((customer) => customer.status === 'Active').length,
)
const trial = computed(
  () =>
    customers.value.filter((customer) => customer.status === 'Trial').length,
)
const plans = ['Starter', 'Growth', 'Scale']
const stats = computed(() => [
  {
    label: 'Total customers',
    value: customers.value.length.toString(),
    detail: 'People in your workspace',
    icon: 'hugeicons:user-group',
  },
  {
    label: 'Active customers',
    value: active.value.toString(),
    detail: 'Building something with you',
    icon: 'hugeicons:user-check-01',
  },
  {
    label: 'On a trial',
    value: trial.value.toString(),
    detail: 'Getting to know your product',
    icon: 'hugeicons:clock-01',
  },
  {
    label: 'Active rate',
    value: `${customers.value.length ? Math.round((active.value / customers.value.length) * 100) : 0}%`,
    detail: 'Of all workspace customers',
    icon: 'hugeicons:chart-increase',
  },
])
const NuxtLinkComponent = resolveComponent('NuxtLink')
</script>

<template>
  <div>
    <PageHeading
      eyebrow="A LITTLE PERSPECTIVE"
      title="Workspace overview"
      description="Your business at a glance. Room to focus on what comes next."
    >
      <SButton icon="hugeicons:add-01" @click="editorOpen = true">
        Add customer
      </SButton>
    </PageHeading>
    <div class="mb-6 grid grid-cols-4 gap-[18px] max-[1000px]:grid-cols-2 max-[1000px]:gap-3 max-[420px]:gap-2.5">
      <SCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-5' }">
        <div class="flex items-center justify-between text-xs text-[var(--selaras-resolved-text-muted)]">
          <span>{{ stat.label }}</span>
          <SIcon :name="stat.icon" class="size-4" />
        </div>
        <div class="my-[22px] mb-3 text-[30px] font-semibold leading-none tracking-[-1px] tabular-nums">
          {{ stat.value }}
        </div>
        <p class="text-[11px] text-[var(--selaras-resolved-text-muted)] max-[1200px]:text-[10px] max-[420px]:text-[11px] max-[420px]:leading-[1.4]">
          {{ stat.detail }}
        </p>
      </SCard>
    </div>
    <div class="mb-6 grid grid-cols-[minmax(0,2.1fr)_minmax(240px,1fr)] gap-6 max-[1200px]:grid-cols-[minmax(0,1.7fr)_minmax(220px,1fr)] max-[1200px]:gap-[18px] max-[1000px]:grid-cols-1 max-[1000px]:gap-[18px]">
      <SCard :ui="{ body: 'p-6' }">
        <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
          <div>
            <h2>Revenue overview</h2>
            <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
              A preview of what you can build. Sample data.
            </p>
          </div>
          <SSelect
            :model-value="period"
            :items="['Last 6 months', 'Last 7 days']"
            aria-label="Revenue period"
            size="sm"
            @update:model-value="
              (value) => {
                if (typeof value === 'string') period = value
              }
            "
          />
        </div>
        <div class="my-6 mb-[22px] flex items-center gap-3 text-[29px] font-semibold tracking-[-1px]">
          {{ formatUsd(totalValues(chartData)) }}
          <SBadge color="neutral" variant="soft">Illustrative</SBadge>
        </div>
        <DashboardChart
          :data="chartData"
          :label="`Sample revenue: ${period.toLowerCase()}`"
        />
      </SCard>
      <SCard :ui="{ body: 'p-6 h-full flex flex-col' }">
        <h2>Customer mix</h2>
        <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
          A home for every stage of growth.
        </p>
        <div class="mt-6 flex flex-col gap-[26px] max-[1000px]:my-6 max-[1000px]:grid max-[1000px]:grid-cols-3 max-[1000px]:gap-6 max-[420px]:gap-3.5">
          <div v-for="(plan, index) in plans" :key="plan" class="text-xs">
            <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
              <span class="flex items-center gap-2.5">
                <span
                  class="inline-block size-[7px] rounded-full"
                  :class="[
                    'bg-[var(--selaras-resolved-color-primary-border)]',
                    'bg-[var(--selaras-resolved-color-primary-fill)]',
                    'bg-[var(--selaras-resolved-color-primary-text)]',
                  ][index]"
                />
                {{ plan }}
              </span>
              <strong>
                {{
                  customers.filter((customer) => customer.plan === plan).length
                }}
              </strong>
            </div>
            <div class="mt-2.5 h-[5px] overflow-hidden rounded-[5px] bg-[var(--selaras-resolved-border-muted)]">
              <span
                class="block h-full rounded-[inherit]"
                :class="[
                  'bg-[var(--selaras-resolved-color-primary-border)]',
                  'bg-[var(--selaras-resolved-color-primary-fill)]',
                  'bg-[var(--selaras-resolved-color-primary-text)]',
                ][index]"
                :style="{
                  width: `${customers.length ? (customers.filter((customer) => customer.plan === plan).length / customers.length) * 100 : 0}%`,
                }"
              />
            </div>
          </div>
        </div>
        <p class="mt-auto border-t border-[var(--selaras-resolved-border-default)] pt-3 text-[11px] text-[var(--selaras-resolved-text-muted)]">
          {{ customers.length }} customers. Plenty of possibilities.
        </p>
      </SCard>
    </div>
    <SCard :ui="{ body: 'p-0', header: 'px-6 py-5' }">
      <template #header>
        <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
          <div>
            <h2>Recently added</h2>
            <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
              The newest faces in your workspace.
            </p>
          </div>
          <SButton
            :as="NuxtLinkComponent"
            to="/customers"
            variant="ghost"
            color="neutral"
            size="sm"
            trailing-icon="hugeicons:arrow-right-02"
          >
            View all
          </SButton>
        </div>
      </template>
      <CustomerTable
        v-if="customers.length"
        :customers="customers.slice(0, 5)"
      />
      <div v-else class="px-6 py-[72px] text-center">
        <h3>Your next chapter starts here.</h3>
        <p class="my-2 mb-[22px] text-[13px] text-[var(--selaras-resolved-text-muted)]">
          Add a customer to bring your workspace to life.
        </p>
        <SButton :as="NuxtLinkComponent" to="/customers">
          Add your first customer
        </SButton>
      </div>
    </SCard>
    <CustomerEditor v-model:open="editorOpen" />
  </div>
</template>
