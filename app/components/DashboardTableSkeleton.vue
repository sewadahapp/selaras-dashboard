<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div
    class="px-6 py-4"
    role="status"
    :aria-label="label"
    aria-busy="true"
  >
    <span class="sr-only">{{ label }}…</span>
    <div
      v-for="row in 4"
      :key="row"
      class="flex items-center gap-6 py-4"
      aria-hidden="true"
    >
      <SSkeleton class="size-9 shrink-0 rounded-full" />
      <SSkeleton class="h-4 w-1/3" />
      <SSkeleton class="h-4 w-1/4" />
    </div>
  </div>
</template>
