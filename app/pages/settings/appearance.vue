<script setup lang="ts">
useHead({ title: 'Appearance · Selaras Dashboard' })
const colorMode = useColorMode()
const preference = computed(() =>
  colorMode.preference === 'light' || colorMode.preference === 'dark'
    ? colorMode.preference
    : 'system',
)
</script>

<template>
  <section class="grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
    <div>
      <h2>Appearance</h2>
      <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
        A comfortable view, day or night.
      </p>
    </div>
    <SCard>
      <div class="flex flex-col gap-[22px]">
        <SFormField
          label="Color mode"
          hint="System follows your device preference."
        >
          <SSelect
            :model-value="preference"
            :items="['system', 'light', 'dark']"
            @update:model-value="
              (value) => {
                if (value) colorMode.preference = value
              }
            "
          />
        </SFormField>
        <div class="flex flex-col gap-4 rounded-[9px] border border-[var(--selaras-resolved-border-default)] bg-[var(--selaras-resolved-surface-elevated)] p-6">
          <SBadge color="primary" variant="soft">Preview</SBadge>
          <h3>A little clarity.</h3>
          <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
            Tables, charts, and your editor follow the same theme.
          </p>
          <div class="flex flex-wrap items-center gap-2.5">
            <SButton>Primary action</SButton>
            <SButton color="neutral" variant="outline">
              Secondary action
            </SButton>
          </div>
        </div>
        <p class="text-[var(--selaras-resolved-text-muted)] text-xs">
          Your appearance preference is remembered in this browser.
        </p>
      </div>
    </SCard>
  </section>
</template>
