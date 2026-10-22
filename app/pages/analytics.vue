<script setup lang="ts">
import {
  formatUsd,
  monthlyRevenue,
  totalValues,
  weeklyRevenue,
  weeklyVisitors,
} from '#shared/utils/analytics'

useHead({ title: 'Analytics · Selaras Dashboard' })
const period = ref<'Last 6 months' | 'Last 7 days'>('Last 6 months')
const chartType = ref<'line' | 'area' | 'bar'>('area')
const data = computed(() =>
  period.value === 'Last 7 days' ? weeklyRevenue : monthlyRevenue,
)
</script>

<template>
  <div>
    <PageHeading
      eyebrow="SEE THE BIGGER PICTURE"
      title="Analytics"
      description="A few useful perspectives on how things are going."
    >
      <SSelect
        :model-value="period"
        :items="['Last 6 months', 'Last 7 days']"
        aria-label="Analytics period"
        @update:model-value="
          (value) => {
            if (typeof value === 'string') period = value
          }
        "
      />
    </PageHeading>
    <div class="analytics-banner">
      <SIcon name="hugeicons:information-circle" />
      <p>
        These charts use sample data. Explore the filters and chart types to
        make them your own.
      </p>
    </div>
    <SCard :ui="{ body: 'p-6' }">
      <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
        <div>
          <h2>Revenue</h2>
          <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
            {{ formatUsd(totalValues(data)) }} across
            {{ period.toLowerCase() }}.
          </p>
        </div>
        <div class="flex items-center gap-2.5" role="group" aria-label="Chart type">
          <SButton
            v-for="type in ['area', 'line', 'bar'] as const"
            :key="type"
            size="sm"
            :variant="chartType === type ? 'soft' : 'ghost'"
            :aria-pressed="chartType === type"
            @click="chartType = type"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </SButton>
        </div>
      </div>
      <DashboardChart
        :data="data"
        :type="chartType"
        label="Sample revenue in US dollars"
        :height="320"
      />
    </SCard>
    <div class="analytics-grid">
      <SCard>
        <h2>Visitors this week</h2>
        <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
          {{ totalValues(weeklyVisitors).toLocaleString('en') }} visits · Sample
          data
        </p>
        <DashboardChart
          :data="weeklyVisitors"
          type="bar"
          label="Sample daily website visitors"
        />
      </SCard>
      <SCard>
        <h2>Revenue this week</h2>
        <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
          {{ formatUsd(totalValues(weeklyRevenue)) }} · Sample data
        </p>
        <DashboardChart
          :data="weeklyRevenue"
          type="line"
          label="Sample daily revenue in US dollars"
        />
      </SCard>
    </div>
  </div>
</template>

<style scoped>
.analytics-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 14px 18px;
  border: 1px solid var(--selaras-resolved-border-default);
  border-radius: 9px;
  background: var(--selaras-resolved-surface-elevated);
  color: var(--selaras-resolved-text-muted);
  font-size: 12px;
}

.analytics-banner :deep(svg) {
  width: 18px;
  flex-shrink: 0;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

@media (max-width: 1000px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
