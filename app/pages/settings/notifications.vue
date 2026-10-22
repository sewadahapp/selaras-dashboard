<script setup lang="ts">
useHead({ title: 'Notifications · Selaras Dashboard' })
const { settings, persist, ready } = useDashboard()
const toast = useToast()
const draft = reactive({
  weeklyDigest: settings.value.weeklyDigest,
  customerUpdates: settings.value.customerUpdates,
})
function discard() {
  Object.assign(draft, {
    weeklyDigest: settings.value.weeklyDigest,
    customerUpdates: settings.value.customerUpdates,
  })
}
watch(settings, discard, { deep: true })
function save() {
  settings.value = { ...settings.value, ...draft }
  if (persist())
    toast.add({ title: 'Notification preferences saved.', color: 'success' })
}
</script>

<template>
  <form class="flex flex-col gap-[30px]" @submit.prevent="save">
    <section class="grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
      <div>
        <h2>Notifications</h2>
        <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
          Choose what you would like to hear about.
        </p>
      </div>
      <SCard>
        <div class="flex flex-col gap-[22px]">
          <SSwitch
            v-model="draft.weeklyDigest"
            label="Weekly digest"
            description="A summary of your workspace activity."
            :disabled="!ready"
          />
          <SSwitch
            v-model="draft.customerUpdates"
            label="Customer updates"
            description="Keep up with new customers and plan changes."
            :disabled="!ready"
          />
          <SAlert
            color="info"
            title="Preferences only"
            description="These settings are saved in this browser. Connect an email service to send notifications."
          />
        </div>
      </SCard>
    </section>
    <div class="flex justify-end gap-2.5">
      <SButton
        color="neutral"
        variant="outline"
        :disabled="!ready"
        @click="discard"
      >
        Discard changes
      </SButton>
      <SButton type="submit" :disabled="!ready">Save changes</SButton>
    </div>
  </form>
</template>
