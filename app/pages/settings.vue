<script setup lang="ts">
import { settingsSections } from '~/data/settings'
const route = useRoute()
const sections = settingsSections.map((section) => ({
  label: section.label,
  icon: section.icon,
  value: section.to,
}))
const activeTab = computed({
  get: () =>
    sections.find((section) => section.value === route.path.replace(/\/$/, ''))
      ?.value ?? '/settings',
  set: (value: string) => {
    if (
      value !== activeTab.value &&
      sections.some((section) => section.value === value)
    )
      void navigateTo(value)
  },
})
</script>

<template>
  <div>
    <PageHeading
      eyebrow="MAKE YOURSELF AT HOME"
      title="Settings"
      description="Your space, your preferences. Set things up the way you work."
    />
    <STabs
      v-model="activeTab"
      :items="sections"
      scrollable
      :ui="{ list: { 'aria-label': 'Settings sections' }, content: 'pt-8' }"
    >
      <template
        v-for="section in sections"
        :key="section.value"
        #[section.value]
      >
        <NuxtPage v-if="activeTab === section.value" />
      </template>
    </STabs>
  </div>
</template>
