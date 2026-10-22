<script setup lang="ts">
useHead({ title: 'Security · Selaras Dashboard' })
const toast = useToast()
const draft = reactive({ current: '', password: '', confirmation: '' })
const errors = ref<Partial<Record<keyof typeof draft, string>>>({})
function preview() {
  errors.value = {}
  if (!draft.current) errors.value.current = 'Enter a demo current password.'
  if (draft.password.length < 12)
    errors.value.password = 'Use at least 12 characters.'
  if (draft.password !== draft.confirmation)
    errors.value.confirmation = 'The passwords do not match.'
  if (Object.keys(errors.value).length) return
  Object.assign(draft, { current: '', password: '', confirmation: '' })
  toast.add({
    title: 'Password form preview complete',
    description:
      'No password was changed. Connect your authentication provider to enable this action.',
    color: 'info',
  })
}
</script>

<template>
  <div class="flex flex-col gap-[30px]">
    <SAlert
      color="info"
      title="Security screen preview"
      description="This starter does not authenticate users. Use demo values below; they are not sent or saved. Password changes, two-factor authentication, and session management require your authentication provider."
    />
    <form class="flex flex-col gap-[30px]" novalidate @submit.prevent="preview">
      <section class="grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
        <div>
          <h2>Password</h2>
          <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
            Preview a validated password form.
          </p>
        </div>
        <SCard>
          <div class="flex flex-col gap-[22px]">
            <SFormField
              label="Demo current password"
              :error="errors.current"
              required
            >
              <SInput
                v-model="draft.current"
                type="password"
                autocomplete="off"
              />
            </SFormField>
            <SFormField
              label="Demo new password"
              hint="At least 12 characters."
              :error="errors.password"
              required
            >
              <SInput
                v-model="draft.password"
                type="password"
                autocomplete="off"
              />
            </SFormField>
            <SFormField
              label="Confirm demo password"
              :error="errors.confirmation"
              required
            >
              <SInput
                v-model="draft.confirmation"
                type="password"
                autocomplete="off"
              />
            </SFormField>
          </div>
        </SCard>
      </section>
      <div class="flex justify-end gap-2.5">
        <SButton type="submit">Preview password change</SButton>
      </div>
    </form>
    <section class="grid grid-cols-[minmax(200px,1fr)_minmax(0,2fr)] gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
      <div>
        <h2>Two-factor authentication</h2>
        <p class="mt-1.5 max-w-[230px] text-xs text-[var(--selaras-resolved-text-muted)] max-[1000px]:max-w-none">
          An extra step to protect your account.
        </p>
      </div>
      <SCard>
        <SSwitch
          :model-value="false"
          disabled
          label="Two-factor authentication"
          description="Connect an authentication provider to enable setup and recovery codes."
        />
      </SCard>
    </section>
  </div>
</template>
