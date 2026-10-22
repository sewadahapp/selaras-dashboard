<script setup lang="ts">
import { Chart as TanStackChart } from '@tanstack/charts/vue'
import { areaY, barY, defineChart, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'
import type { ChartDatum } from '#shared/utils/analytics'

const props = withDefaults(
  defineProps<{
    data: ChartDatum[]
    label: string
    type?: 'line' | 'area' | 'bar'
    height?: number
  }>(),
  { type: 'area', height: 240 },
)

// Keep the definition reactive: changing a filter replaces the captured rows.
const definition = computed(() => {
  const channels = { x: 'label', y: 'value' } as const
  const color = 'var(--selaras-resolved-color-primary-fill)'
  const marks =
    props.type === 'bar'
      ? [barY(props.data, { ...channels, fill: color })]
      : props.type === 'line'
        ? [
            lineY(props.data, {
              ...channels,
              stroke: color,
              strokeWidth: 2,
              points: true,
            }),
          ]
        : [
            areaY(props.data, { ...channels, fill: color, fillOpacity: 0.12 }),
            lineY(props.data, {
              ...channels,
              stroke: color,
              strokeWidth: 2,
              points: true,
            }),
          ]
  return defineChart({
    marks,
    scales: {
      x: {
        scale:
          props.type === 'bar'
            ? () => scaleBand<string>().padding(0.35)
            : () => scalePoint<string>().padding(0.2),
      },
      y: { scale: scaleLinear, nice: true, grid: true },
    },
    tooltip,
  })
})
</script>

<template>
  <div class="mt-[22px] min-w-0">
    <TanStackChart
      :definition="definition"
      :height="height"
      :initial-width="640"
      :aria-label="label"
      :style="{ height: `${height}px`, width: '100%' }"
    />
    <details class="mt-2.5 text-[11px] text-[var(--selaras-resolved-text-muted)]">
      <summary class="cursor-pointer">View chart data</summary>
      <table>
        <caption class="sr-only">
          {{ label }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.label">
            <td>{{ item.label }}</td>
            <td>{{ item.value.toLocaleString('en') }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
  font-size: 12px;
}

thead {
  background: var(--selaras-resolved-surface-elevated);
}

th {
  font-size: 10px;
  font-weight: 500;
  color: var(--selaras-resolved-text-muted);
}

td,
th {
  padding: 14px 24px;
  border-bottom: 1px solid var(--selaras-resolved-border-default);
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--selaras-resolved-surface-elevated);
}
</style>
