<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; description: string }>()
</script>

<template>
  <div class="page-heading">
    <div>
      <p v-if="eyebrow" class="mb-2.5 text-[10px] font-semibold tracking-[1.6px] text-[var(--selaras-resolved-text-muted)]">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="mt-2 text-[13px] text-[var(--selaras-resolved-text-muted)]">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="flex items-center gap-2.5 heading-actions"><slot /></div>
  </div>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

.heading-actions {
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .page-heading {
    align-items: flex-start;
  }
}

@media (max-width: 1000px) {
  .page-heading {
    flex-wrap: wrap;
  }

  .heading-actions {
    padding-top: 0;
  }
}

@media (max-width: 760px) {
  .page-heading {
    margin-bottom: 24px;
  }
}
</style>
