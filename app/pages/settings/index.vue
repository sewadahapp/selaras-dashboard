<script setup lang="ts">
import { initials } from '#shared/utils/members'
useHead({ title: 'General settings · Selaras Dashboard' })
const { settings, ready, persist, reset } = useDashboard()
const toast = useToast()
const draft = reactive({
  name: settings.value.name,
  email: settings.value.email,
})
const errors = ref<{ name?: string; email?: string }>({})
const resetOpen = ref(false)
function discard() {
  Object.assign(draft, {
    name: settings.value.name,
    email: settings.value.email,
  })
  errors.value = {}
}
watch(settings, discard, { deep: true })
function save() {
  errors.value = {}
  if (!draft.name.trim()) errors.value.name = 'Enter a workspace name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.value.email = 'Enter a valid email address.'
  if (Object.keys(errors.value).length) return
  settings.value = {
    ...settings.value,
    name: draft.name.trim(),
    email: draft.email.trim(),
  }
  if (persist())
    toast.add({ title: 'Workspace settings saved.', color: 'success' })
}
function resetDemo() {
  reset()
  discard()
}
</script>

<template>
  <div class="flex flex-col gap-[30px]">
    <form class="flex flex-col gap-[30px]" novalidate @submit.prevent="save">
      <section class="grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
        <div>
          <h2>Workspace details</h2>
          <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
            The basics that make this space yours.
          </p>
        </div>
        <SCard>
          <div class="flex flex-col gap-[22px]">
            <div class="flex items-center gap-2.5">
              <SAvatar
                :text="initials(draft.name)"
                :alt="draft.name || 'Workspace'"
                shape="rounded"
              />
              <span class="text-[var(--selaras-resolved-text-muted)] text-xs">Your workspace</span>
            </div>
            <SFormField
              label="Workspace name"
              name="workspace"
              required
              :error="errors.name"
            >
              <SInput v-model="draft.name" :disabled="!ready" />
            </SFormField>
            <SFormField
              label="Contact email"
              name="email"
              hint="Demo only. No emails will be sent."
              required
              :error="errors.email"
            >
              <SInput v-model="draft.email" type="email" :disabled="!ready" />
            </SFormField>
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
    <section class="mt-9 grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 border-t border-[var(--selaras-resolved-border-default)] pt-[30px] max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
      <div>
        <h2>Start fresh</h2>
        <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
          Give the demo another spin.
        </p>
      </div>
      <SCard>
        <div class="flex items-center justify-between gap-4 max-[760px]:flex-wrap">
          <div>
            <h3>Reset demo workspace</h3>
            <p class="mt-1 text-xs text-[var(--selaras-resolved-text-muted)]">
              Restore customers, members, and workspace preferences. Your editor
              draft is kept.
            </p>
          </div>
          <SButton
            variant="outline"
            color="danger"
            :disabled="!ready"
            @click="resetOpen = true"
          >
            Reset demo
          </SButton>
        </div>
      </SCard>
    </section>
    <SAlertDialog
      v-model:open="resetOpen"
      title="Reset demo workspace?"
      description="Your customers, members, and workspace preferences will be replaced with the original sample data. Your editor draft is kept. This cannot be undone."
      action-label="Reset workspace"
      action-color="danger"
      @confirm="resetDemo"
    />
  </div>
</template>
